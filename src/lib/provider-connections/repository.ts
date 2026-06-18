import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ConnectionStatus,
  ConnectionView,
  CreateConnectionInput,
  ProviderEnvironment,
  ProviderSyncResult,
  ProviderVerificationResult,
  SyncStatus,
} from '@/lib/provider-connections/types';
import { encryptCredentials, decryptCredentials } from '@/lib/provider-connections/crypto';
import { getProviderDefinition } from '@/lib/provider-connections/catalog';

type DatabaseClient = SupabaseClient;

export interface ApiConnectionRow {
  id: string;
  user_id: string;
  provider_id: string;
  provider_label: string;
  api_slug: string | null;
  display_name: string;
  environment: ProviderEnvironment;
  auth_type: string;
  connection_status: ConnectionStatus;
  sync_status: SyncStatus;
  verification_message: string | null;
  official_url: string | null;
  base_url: string | null;
  encrypted_credentials: string;
  credential_hint: string | null;
  account_label: string | null;
  account_ref: string | null;
  supports_usage_sync: boolean;
  last_verified_at: string | null;
  last_sync_at: string | null;
  last_sync_error: string | null;
  last_used_at: string | null;
  total_requests: number | null;
  success_rate: number | null;
  average_latency_ms: number | null;
  error_count: number | null;
  usage_quantity: number | null;
  usage_unit: string | null;
  estimated_spend: number | null;
  currency: string | null;
  connection_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ApiUsageSnapshotRow {
  id: string;
  connection_id: string;
  user_id: string;
  sync_status: SyncStatus;
  sync_message: string;
  total_requests: number | null;
  success_rate: number | null;
  average_latency_ms: number | null;
  error_count: number | null;
  usage_quantity: number | null;
  usage_unit: string | null;
  estimated_spend: number | null;
  currency: string | null;
  last_used_at: string | null;
  raw_payload: unknown;
  snapshot_at: string;
}

export interface StoredConnectionRecord {
  row: ApiConnectionRow;
  credentials: Record<string, string>;
}

export interface ConnectionListResult {
  connections: ConnectionView[];
  rows: ApiConnectionRow[];
  snapshots: ApiUsageSnapshotRow[];
  schemaMissing: boolean;
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toConnectionView(row: ApiConnectionRow): ConnectionView {
  return {
    id: row.id,
    providerId: row.provider_id,
    providerLabel: row.provider_label,
    apiSlug: row.api_slug,
    displayName: row.display_name,
    environment: row.environment,
    authType: row.auth_type,
    connectionStatus: row.connection_status,
    syncStatus: row.sync_status,
    verificationMessage: row.verification_message,
    officialUrl: row.official_url,
    baseUrl: row.base_url,
    accountLabel: row.account_label,
    accountRef: row.account_ref,
    supportsUsageSync: row.supports_usage_sync,
    lastVerifiedAt: row.last_verified_at,
    lastSyncAt: row.last_sync_at,
    lastSyncError: row.last_sync_error,
    lastUsedAt: row.last_used_at,
    totalRequests: toNumber(row.total_requests),
    successRate: toNumber(row.success_rate),
    averageLatencyMs: toNumber(row.average_latency_ms),
    errorCount: toNumber(row.error_count),
    usageQuantity: toNumber(row.usage_quantity),
    usageUnit: row.usage_unit,
    estimatedSpend: toNumber(row.estimated_spend),
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isSchemaMissingError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;

  return (
    error.code === '42P01' ||
    error.message?.includes('relation') ||
    error.message?.includes('does not exist') ||
    error.message?.includes('Could not find the table')
  );
}

async function fetchLatestSnapshots(
  supabase: DatabaseClient,
  userId: string,
  connectionIds: string[],
) {
  if (connectionIds.length === 0) {
    return new Map<string, ApiUsageSnapshotRow>();
  }

  const { data, error } = await supabase
    .from('api_usage_snapshots')
    .select('*')
    .eq('user_id', userId)
    .in('connection_id', connectionIds)
    .order('snapshot_at', { ascending: false });

  if (error) {
    if (isSchemaMissingError(error)) {
      return new Map<string, ApiUsageSnapshotRow>();
    }

    throw error;
  }

  const latestSnapshots = new Map<string, ApiUsageSnapshotRow>();
  for (const snapshot of (data ?? []) as ApiUsageSnapshotRow[]) {
    if (!latestSnapshots.has(snapshot.connection_id)) {
      latestSnapshots.set(snapshot.connection_id, snapshot);
    }
  }

  return latestSnapshots;
}

export async function listConnectionsForUser(
  supabase: DatabaseClient,
  userId: string,
): Promise<ConnectionListResult> {
  const { data, error } = await supabase
    .from('api_connections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (isSchemaMissingError(error)) {
      return {
        connections: [],
        rows: [],
        snapshots: [],
        schemaMissing: true,
      };
    }

    throw error;
  }

  const rows = (data ?? []) as ApiConnectionRow[];
  const latestSnapshots = await fetchLatestSnapshots(
    supabase,
    userId,
    rows.map((row) => row.id),
  );

  const enrichedRows = rows.map((row) => {
    const snapshot = latestSnapshots.get(row.id);
    if (!snapshot) return row;

    return {
      ...row,
      sync_status: snapshot.sync_status,
      last_sync_at: snapshot.snapshot_at,
      last_used_at: snapshot.last_used_at ?? row.last_used_at,
      total_requests: snapshot.total_requests ?? row.total_requests,
      success_rate: snapshot.success_rate ?? row.success_rate,
      average_latency_ms: snapshot.average_latency_ms ?? row.average_latency_ms,
      error_count: snapshot.error_count ?? row.error_count,
      usage_quantity: snapshot.usage_quantity ?? row.usage_quantity,
      usage_unit: snapshot.usage_unit ?? row.usage_unit,
      estimated_spend: snapshot.estimated_spend ?? row.estimated_spend,
      currency: snapshot.currency ?? row.currency,
      last_sync_error: snapshot.sync_status === 'failed' ? snapshot.sync_message : row.last_sync_error,
    } satisfies ApiConnectionRow;
  });

  return {
    connections: enrichedRows.map(toConnectionView),
    rows: enrichedRows,
    snapshots: Array.from(latestSnapshots.values()),
    schemaMissing: false,
  };
}

export async function getConnectionForUser(
  supabase: DatabaseClient,
  userId: string,
  connectionId: string,
): Promise<ApiConnectionRow | null> {
  const { data, error } = await supabase
    .from('api_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('id', connectionId)
    .maybeSingle();

  if (error) {
    if (isSchemaMissingError(error)) {
      return null;
    }

    throw error;
  }

  return (data as ApiConnectionRow | null) ?? null;
}

export async function getStoredConnectionForUser(
  supabase: DatabaseClient,
  userId: string,
  connectionId: string,
): Promise<StoredConnectionRecord | null> {
  const row = await getConnectionForUser(supabase, userId, connectionId);

  if (!row) return null;

  return {
    row,
    credentials: decryptCredentials(row.encrypted_credentials),
  };
}

export async function getStoredConnectionsForAdmin(
  supabase: DatabaseClient,
): Promise<StoredConnectionRecord[]> {
  const { data, error } = await supabase
    .from('api_connections')
    .select('*')
    .order('updated_at', { ascending: true });

  if (error) {
    if (isSchemaMissingError(error)) {
      return [];
    }

    throw error;
  }

  return ((data ?? []) as ApiConnectionRow[]).map((row) => ({
    row,
    credentials: decryptCredentials(row.encrypted_credentials),
  }));
}

function buildCredentialHint(input: CreateConnectionInput) {
  const provider = getProviderDefinition(input.providerId);

  if (!provider) return null;

  const visibleField = provider.fields.find((field) => field.secret);
  if (!visibleField) return null;

  const value = input.credentials[visibleField.key];
  if (!value) return null;

  return value.length > 8 ? `${value.slice(0, 4)}••••${value.slice(-4)}` : `${value.slice(0, 2)}••••`;
}

export async function insertConnection(
  supabase: DatabaseClient,
  userId: string,
  input: CreateConnectionInput,
  config: {
    authType: string;
    providerLabel: string;
    officialUrl: string | null;
    supportsUsageSync: boolean;
    verification: ProviderVerificationResult;
    baseUrl: string | null;
  },
) {
  const payload = {
    user_id: userId,
    provider_id: input.providerId,
    provider_label: config.providerLabel,
    api_slug: input.apiSlug ?? null,
    display_name: input.displayName,
    environment: input.environment,
    auth_type: config.authType,
    connection_status: (config.verification.ok ? 'connected' : 'verification_failed') as ConnectionStatus,
    sync_status: (config.verification.ok ? 'idle' : 'failed') as SyncStatus,
    verification_message: config.verification.message,
    official_url: config.officialUrl,
    base_url: config.baseUrl,
    encrypted_credentials: encryptCredentials(input.credentials),
    credential_hint: buildCredentialHint(input),
    account_label: config.verification.accountLabel ?? null,
    account_ref: config.verification.accountRef ?? null,
    supports_usage_sync: config.supportsUsageSync,
    last_verified_at: new Date().toISOString(),
    connection_metadata: config.verification.metadata ?? {},
    connected_at: config.verification.ok ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('api_connections')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;

  return toConnectionView(data as ApiConnectionRow);
}

export async function updateConnectionAfterSync(
  supabase: DatabaseClient,
  userId: string,
  connectionId: string,
  syncResult: ProviderSyncResult,
  nextStatus?: ConnectionStatus,
) {
  const summary = syncResult.summary;
  const patch = {
    connection_status: nextStatus ?? (syncResult.ok ? 'connected' : 'sync_error'),
    sync_status: syncResult.status,
    last_sync_at: new Date().toISOString(),
    last_sync_error: syncResult.ok ? null : syncResult.message,
    last_used_at: summary.lastUsedAt ?? null,
    total_requests: summary.totalRequests ?? null,
    success_rate: summary.successRate ?? null,
    average_latency_ms: summary.averageLatencyMs ?? null,
    error_count: summary.errorCount ?? null,
    usage_quantity: summary.usageQuantity ?? null,
    usage_unit: summary.usageUnit ?? null,
    estimated_spend: summary.estimatedSpend ?? null,
    currency: summary.currency ?? null,
  };

  const { error } = await supabase
    .from('api_connections')
    .update(patch)
    .eq('user_id', userId)
    .eq('id', connectionId);

  if (error) throw error;

  const { error: snapshotError } = await supabase.from('api_usage_snapshots').insert({
    connection_id: connectionId,
    user_id: userId,
    sync_status: syncResult.status,
    sync_message: syncResult.message,
    total_requests: summary.totalRequests ?? null,
    success_rate: summary.successRate ?? null,
    average_latency_ms: summary.averageLatencyMs ?? null,
    error_count: summary.errorCount ?? null,
    usage_quantity: summary.usageQuantity ?? null,
    usage_unit: summary.usageUnit ?? null,
    estimated_spend: summary.estimatedSpend ?? null,
    currency: summary.currency ?? null,
    last_used_at: summary.lastUsedAt ?? null,
    raw_payload: syncResult.rawPayload ?? null,
  });

  if (snapshotError) throw snapshotError;

  const refreshed = await getConnectionForUser(supabase, userId, connectionId);
  return refreshed ? toConnectionView(refreshed) : null;
}

export async function deleteConnectionForUser(
  supabase: DatabaseClient,
  userId: string,
  connectionId: string,
) {
  const { error } = await supabase
    .from('api_connections')
    .delete()
    .eq('user_id', userId)
    .eq('id', connectionId);

  if (error) throw error;
}
