import type { SupabaseClient } from '@supabase/supabase-js';
import { getOfficialProviderUrl } from '@/lib/apiMarketplaceData';
import { getProviderDefinition, providerCatalog } from '@/lib/provider-connections/catalog';
import { getProviderAdapter, resolveBaseUrl } from '@/lib/provider-connections/adapters';
import {
  deleteConnectionForUser,
  getStoredConnectionForUser,
  getStoredConnectionsForAdmin,
  insertConnection,
  listConnectionsForUser,
  updateConnectionAfterSync,
} from '@/lib/provider-connections/repository';
import type {
  ConnectionStatus,
  ConnectionView,
  CreateConnectionInput,
  ProviderDefinition,
} from '@/lib/provider-connections/types';

type DatabaseClient = SupabaseClient;

export interface ConnectionsSummary {
  schemaMissing: boolean;
  connections: ConnectionView[];
  metrics: {
    total: number;
    connected: number;
    sandboxOnly: number;
    live: number;
    needsAttention: number;
    usageSyncEnabled: number;
  };
}

function buildStatusAfterSync(current: ConnectionStatus, syncOk: boolean) {
  if (!syncOk) return 'sync_error';
  return current === 'rotate_soon' ? 'rotate_soon' : 'connected';
}

export async function createProviderConnection(
  supabase: DatabaseClient,
  userId: string,
  input: CreateConnectionInput,
) {
  const provider = getProviderDefinition(input.providerId);

  if (!provider) {
    throw new Error('Unknown provider. Choose one of the supported connector types first.');
  }

  const baseUrl = resolveBaseUrl(input);
  const adapter = getProviderAdapter(provider.id);
  const verification = await adapter.verify({
    baseUrl,
    credentials: input.credentials,
    environment: input.environment,
  });

  const connection = await insertConnection(supabase, userId, input, {
    authType: provider.authType,
    providerLabel: provider.label,
    officialUrl: getOfficialProviderUrl(input.apiSlug ?? provider.id, provider.label) ?? provider.docsUrl,
    supportsUsageSync: provider.supportsUsageSync,
    verification,
    baseUrl,
  });

  let syncedConnection = connection;
  if (verification.ok) {
    syncedConnection = (await syncProviderConnection(supabase, userId, connection.id)) ?? connection;
  }

  return {
    connection: syncedConnection,
    provider,
  };
}

export async function syncProviderConnection(
  supabase: DatabaseClient,
  userId: string,
  connectionId: string,
) {
  const stored = await getStoredConnectionForUser(supabase, userId, connectionId);

  if (!stored) {
    throw new Error('Connection not found.');
  }

  const adapter = getProviderAdapter(stored.row.provider_id);
  const syncResult =
    (await adapter.sync?.({
      baseUrl: stored.row.base_url ?? resolveBaseUrl({
        providerId: stored.row.provider_id,
        baseUrl: stored.row.base_url ?? undefined,
        credentials: stored.credentials,
      }),
      credentials: stored.credentials,
      environment: stored.row.environment,
    })) ??
    {
      ok: true,
      status: 'limited',
      message: 'This provider is connected, but usage sync is limited to connection health only.',
      summary: {
        lastUsedAt: new Date().toISOString(),
      },
    };

  const updatedRow = await updateConnectionAfterSync(
    supabase,
    userId,
    connectionId,
    syncResult,
    buildStatusAfterSync(stored.row.connection_status, syncResult.ok),
  );

  return updatedRow;
}

export async function deleteProviderConnection(
  supabase: DatabaseClient,
  userId: string,
  connectionId: string,
) {
  await deleteConnectionForUser(supabase, userId, connectionId);
}

export async function getConnectionsSummary(
  supabase: DatabaseClient,
  userId: string,
): Promise<ConnectionsSummary> {
  const result = await listConnectionsForUser(supabase, userId);
  const metrics = {
    total: result.connections.length,
    connected: result.connections.filter((connection) => connection.connectionStatus === 'connected').length,
    sandboxOnly: result.connections.filter((connection) => connection.environment === 'sandbox').length,
    live: result.connections.filter((connection) => connection.environment === 'live').length,
    needsAttention: result.connections.filter((connection) =>
      ['rotate_soon', 'needs_setup', 'sync_error', 'verification_failed'].includes(connection.connectionStatus),
    ).length,
    usageSyncEnabled: result.connections.filter((connection) => connection.supportsUsageSync).length,
  };

  return {
    schemaMissing: result.schemaMissing,
    connections: result.connections,
    metrics,
  };
}

export function getConnectableProviders(): ProviderDefinition[] {
  return providerCatalog;
}

export async function syncAllConnectionsForAdmin(supabase: DatabaseClient) {
  const connections = await getStoredConnectionsForAdmin(supabase);
  const results: Array<{ id: string; ok: boolean; message: string }> = [];

  for (const stored of connections) {
    const adapter = getProviderAdapter(stored.row.provider_id);
    const syncResult =
      (await adapter.sync?.({
        baseUrl: stored.row.base_url ?? resolveBaseUrl({
          providerId: stored.row.provider_id,
          baseUrl: stored.row.base_url ?? undefined,
          credentials: stored.credentials,
        }),
        credentials: stored.credentials,
        environment: stored.row.environment,
      })) ??
      {
        ok: true,
        status: 'limited',
        message: 'Provider health sync only.',
        summary: {
          lastUsedAt: new Date().toISOString(),
        },
      };

    await updateConnectionAfterSync(
      supabase,
      stored.row.user_id,
      stored.row.id,
      syncResult,
      buildStatusAfterSync(stored.row.connection_status, syncResult.ok),
    );

    results.push({
      id: stored.row.id,
      ok: syncResult.ok,
      message: syncResult.message,
    });
  }

  return results;
}
