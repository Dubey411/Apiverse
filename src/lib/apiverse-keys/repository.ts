import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateWorkspaceApiKeyInput,
  WorkspaceAnalyticsSummary,
  WorkspaceApiKeyView,
  WorkspaceApiSummary,
  WorkspaceKeyEnvironment,
  WorkspaceKeyStatus,
  WorkspaceMetrics,
  WorkspaceUsageEventView,
} from '@/lib/apiverse-keys/types';

type DatabaseClient = SupabaseClient;

interface WorkspaceApiKeyRow {
  id: string;
  user_id: string;
  api_slug: string;
  api_name: string;
  display_name: string;
  environment: WorkspaceKeyEnvironment;
  status: WorkspaceKeyStatus;
  key_prefix: string;
  key_hash: string;
  last_four: string;
  total_requests: number;
  success_count: number;
  error_count: number;
  average_latency_ms: number | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkspaceUsageEventRow {
  id: string;
  api_key_id: string;
  user_id: string;
  api_slug: string;
  api_name: string;
  environment: WorkspaceKeyEnvironment;
  request_method: string;
  status_code: number;
  latency_ms: number;
  request_path: string;
  request_id: string;
  usage_quantity: number;
  created_at: string;
}

export interface StoredWorkspaceKeyRecord {
  row: WorkspaceApiKeyRow;
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

function toKeyView(row: WorkspaceApiKeyRow): WorkspaceApiKeyView {
  const successRate = row.total_requests > 0
    ? Number(((row.success_count / row.total_requests) * 100).toFixed(2))
    : 100;

  return {
    id: row.id,
    apiSlug: row.api_slug,
    apiName: row.api_name,
    displayName: row.display_name,
    environment: row.environment,
    status: row.status,
    keyPrefix: row.key_prefix,
    lastFour: row.last_four,
    totalRequests: row.total_requests ?? 0,
    successCount: row.success_count ?? 0,
    errorCount: row.error_count ?? 0,
    successRate,
    averageLatencyMs: row.average_latency_ms,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toEventView(row: WorkspaceUsageEventRow): WorkspaceUsageEventView {
  return {
    id: row.id,
    apiKeyId: row.api_key_id,
    apiSlug: row.api_slug,
    apiName: row.api_name,
    environment: row.environment,
    requestMethod: row.request_method,
    statusCode: row.status_code,
    latencyMs: row.latency_ms,
    requestPath: row.request_path,
    requestId: row.request_id,
    usageQuantity: row.usage_quantity,
    createdAt: row.created_at,
  };
}

function buildApiSummaries(keys: WorkspaceApiKeyView[]): WorkspaceApiSummary[] {
  const grouped = new Map<string, WorkspaceApiSummary & { latencyWeight: number }>();

  for (const key of keys.filter((item) => item.status === 'active')) {
    const current = grouped.get(key.apiSlug);
    if (!current) {
      grouped.set(key.apiSlug, {
        apiSlug: key.apiSlug,
        apiName: key.apiName,
        environments: [key.environment],
        activeKeys: 1,
        totalRequests: key.totalRequests,
        successRate: key.successRate,
        averageLatencyMs: key.averageLatencyMs,
        errorCount: key.errorCount,
        lastUsedAt: key.lastUsedAt,
        latencyWeight: key.totalRequests,
      });
      continue;
    }

    current.activeKeys += 1;
    current.totalRequests += key.totalRequests;
    current.errorCount += key.errorCount;
    current.successRate = current.totalRequests > 0
      ? Number((((current.totalRequests - current.errorCount) / current.totalRequests) * 100).toFixed(2))
      : 100;
    if (!current.environments.includes(key.environment)) {
      current.environments.push(key.environment);
    }

    const latest = [current.lastUsedAt, key.lastUsedAt].filter(Boolean).sort().at(-1) ?? null;
    current.lastUsedAt = latest;

    if (typeof key.averageLatencyMs === 'number') {
      const existingWeighted = (current.averageLatencyMs ?? 0) * current.latencyWeight;
      const nextWeight = current.latencyWeight + Math.max(key.totalRequests, 1);
      current.averageLatencyMs = Math.round(
        (existingWeighted + key.averageLatencyMs * Math.max(key.totalRequests, 1)) / nextWeight,
      );
      current.latencyWeight = nextWeight;
    }
  }

  return Array.from(grouped.values())
    .map((entry) => {
      const { latencyWeight, ...summary } = entry;
      void latencyWeight;
      return summary;
    })
    .sort((a, b) => b.totalRequests - a.totalRequests || a.apiName.localeCompare(b.apiName));
}

function buildMetrics(keys: WorkspaceApiKeyView[], apiSummaries: WorkspaceApiSummary[]): WorkspaceMetrics {
  const activeKeys = keys.filter((key) => key.status === 'active');
  const totalRequests = activeKeys.reduce((sum, key) => sum + key.totalRequests, 0);
  const successfulRequests = activeKeys.reduce((sum, key) => sum + key.successCount, 0);
  const errorCount = activeKeys.reduce((sum, key) => sum + key.errorCount, 0);

  return {
    totalKeys: keys.length,
    activeKeys: activeKeys.length,
    sandboxKeys: activeKeys.filter((key) => key.environment === 'sandbox').length,
    liveKeys: activeKeys.filter((key) => key.environment === 'live').length,
    connectedApis: apiSummaries.length,
    totalRequests,
    successfulRequests,
    errorCount,
  };
}

export async function listWorkspaceAnalyticsForUser(
  supabase: DatabaseClient,
  userId: string,
): Promise<WorkspaceAnalyticsSummary> {
  const { data: keyRows, error: keyError } = await supabase
    .from('workspace_api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (keyError) {
    if (isSchemaMissingError(keyError)) {
      return {
        schemaMissing: true,
        keys: [],
        apiSummaries: [],
        recentEvents: [],
        metrics: {
          totalKeys: 0,
          activeKeys: 0,
          sandboxKeys: 0,
          liveKeys: 0,
          connectedApis: 0,
          totalRequests: 0,
          successfulRequests: 0,
          errorCount: 0,
        },
      };
    }

    throw keyError;
  }

  const keys = ((keyRows ?? []) as WorkspaceApiKeyRow[]).map(toKeyView);

  const { data: eventRows, error: eventError } = await supabase
    .from('workspace_api_usage_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(80);

  if (eventError && !isSchemaMissingError(eventError)) {
    throw eventError;
  }

  const recentEvents = ((eventRows ?? []) as WorkspaceUsageEventRow[]).map(toEventView);
  const apiSummaries = buildApiSummaries(keys);
  const metrics = buildMetrics(keys, apiSummaries);

  return {
    schemaMissing: false,
    keys,
    apiSummaries,
    recentEvents,
    metrics,
  };
}

export async function insertWorkspaceApiKey(
  supabase: DatabaseClient,
  userId: string,
  input: CreateWorkspaceApiKeyInput & {
    apiName: string;
    keyPrefix: string;
    keyHash: string;
    lastFour: string;
  },
) {
  const payload = {
    user_id: userId,
    api_slug: input.apiSlug,
    api_name: input.apiName,
    display_name: input.displayName,
    environment: input.environment,
    status: 'active' as WorkspaceKeyStatus,
    key_prefix: input.keyPrefix,
    key_hash: input.keyHash,
    last_four: input.lastFour,
  };

  const { data, error } = await supabase
    .from('workspace_api_keys')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return toKeyView(data as WorkspaceApiKeyRow);
}

export async function revokeWorkspaceApiKeyForUser(
  supabase: DatabaseClient,
  userId: string,
  keyId: string,
) {
  const { data, error } = await supabase
    .from('workspace_api_keys')
    .update({ status: 'revoked' })
    .eq('user_id', userId)
    .eq('id', keyId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return toKeyView(data as WorkspaceApiKeyRow);
}

export async function findWorkspaceApiKeyForAdminByHash(
  supabase: DatabaseClient,
  keyHash: string,
) {
  const { data, error } = await supabase
    .from('workspace_api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as WorkspaceApiKeyRow | null) ?? null;
}

export async function recordWorkspaceApiUsageForAdmin(
  supabase: DatabaseClient,
  row: WorkspaceApiKeyRow,
  usage: {
    statusCode: number;
    latencyMs: number;
    requestMethod: string;
    requestPath: string;
    requestId: string;
    usageQuantity?: number;
  },
) {
  const usageQuantity = usage.usageQuantity ?? 1;

  const { error: eventError } = await supabase.from('workspace_api_usage_events').insert({
    api_key_id: row.id,
    user_id: row.user_id,
    api_slug: row.api_slug,
    api_name: row.api_name,
    environment: row.environment,
    request_method: usage.requestMethod,
    status_code: usage.statusCode,
    latency_ms: usage.latencyMs,
    request_path: usage.requestPath,
    request_id: usage.requestId,
    usage_quantity: usageQuantity,
  });

  if (eventError) {
    throw eventError;
  }

  const nextTotalRequests = (row.total_requests ?? 0) + usageQuantity;
  const nextSuccessCount = (row.success_count ?? 0) + (usage.statusCode < 400 ? usageQuantity : 0);
  const nextErrorCount = (row.error_count ?? 0) + (usage.statusCode >= 400 ? usageQuantity : 0);
  const existingWeight = row.total_requests ?? 0;
  const nextAverageLatency = Math.round(
    (((row.average_latency_ms ?? usage.latencyMs) * existingWeight) + usage.latencyMs * usageQuantity) / Math.max(nextTotalRequests, 1),
  );

  const { data, error: updateError } = await supabase
    .from('workspace_api_keys')
    .update({
      total_requests: nextTotalRequests,
      success_count: nextSuccessCount,
      error_count: nextErrorCount,
      average_latency_ms: nextAverageLatency,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', row.id)
    .select('*')
    .single();

  if (updateError) {
    throw updateError;
  }

  return toKeyView(data as WorkspaceApiKeyRow);
}
