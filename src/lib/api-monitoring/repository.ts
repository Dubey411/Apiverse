import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AlertSeverity,
  MonitorAlertView,
  MonitorCheckView,
  MonitoringMetrics,
  MonitoringStatus,
  MonitoringSummary,
  MonitoredApiView,
} from '@/lib/api-monitoring/types';

type DatabaseClient = SupabaseClient;

interface MonitoredApiRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  base_url: string;
  health_path: string;
  docs_url: string | null;
  environment: 'sandbox' | 'live';
  auth_mode: 'none' | 'bearer' | 'api_key';
  auth_header_name: string | null;
  encrypted_auth_value: string | null;
  quota_limit: number | null;
  quota_remaining: number | null;
  quota_remaining_header: string | null;
  quota_limit_header: string | null;
  quota_reset_header: string | null;
  quota_renews_at: string | null;
  expiry_at: string | null;
  alert_email: string | null;
  ownership_confirmed: boolean;
  monitoring_consent: boolean;
  security_scan_enabled: boolean;
  latest_status: MonitoringStatus;
  last_checked_at: string | null;
  last_status_code: number | null;
  last_latency_ms: number | null;
  last_error: string | null;
  vulnerability_status: MonitoringStatus;
  vulnerability_summary: string | null;
  created_at: string;
  updated_at: string;
}

interface MonitorCheckRow {
  id: string;
  api_id: string;
  user_id: string;
  api_name: string;
  check_type: 'uptime' | 'quota' | 'expiry' | 'security';
  severity: AlertSeverity;
  status_code: number | null;
  latency_ms: number | null;
  requests_remaining: number | null;
  findings: string[] | null;
  checked_at: string;
}

interface MonitorAlertRow {
  id: string;
  api_id: string;
  user_id: string;
  api_name: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  channel: string;
  acknowledged: boolean;
  created_at: string;
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

function toApiView(row: MonitoredApiRow): MonitoredApiView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    baseUrl: row.base_url,
    healthPath: row.health_path,
    docsUrl: row.docs_url,
    environment: row.environment,
    authMode: row.auth_mode,
    authHeaderName: row.auth_header_name,
    quotaLimit: row.quota_limit,
    quotaRemaining: row.quota_remaining,
    quotaRemainingHeader: row.quota_remaining_header,
    quotaLimitHeader: row.quota_limit_header,
    quotaResetHeader: row.quota_reset_header,
    quotaRenewsAt: row.quota_renews_at,
    expiryAt: row.expiry_at,
    alertEmail: row.alert_email,
    ownershipConfirmed: row.ownership_confirmed,
    monitoringConsent: row.monitoring_consent,
    securityScanEnabled: row.security_scan_enabled,
    latestStatus: row.latest_status,
    lastCheckedAt: row.last_checked_at,
    lastStatusCode: row.last_status_code,
    lastLatencyMs: row.last_latency_ms,
    lastError: row.last_error,
    vulnerabilityStatus: row.vulnerability_status,
    vulnerabilitySummary: row.vulnerability_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCheckView(row: MonitorCheckRow): MonitorCheckView {
  return {
    id: row.id,
    apiId: row.api_id,
    apiName: row.api_name,
    checkType: row.check_type,
    severity: row.severity,
    statusCode: row.status_code,
    latencyMs: row.latency_ms,
    requestsRemaining: row.requests_remaining,
    findings: row.findings ?? [],
    checkedAt: row.checked_at,
  };
}

function toAlertView(row: MonitorAlertRow): MonitorAlertView {
  return {
    id: row.id,
    apiId: row.api_id,
    apiName: row.api_name,
    severity: row.severity,
    title: row.title,
    body: row.body,
    channel: row.channel,
    acknowledged: row.acknowledged,
    createdAt: row.created_at,
  };
}

function buildMetrics(apis: MonitoredApiView[], checks: MonitorCheckView[], alerts: MonitorAlertView[]): MonitoringMetrics {
  const latencies = apis
    .map((api) => api.lastLatencyMs)
    .filter((value): value is number => typeof value === 'number');

  return {
    totalApis: apis.length,
    healthyApis: apis.filter((api) => api.latestStatus === 'healthy').length,
    warningApis: apis.filter((api) => api.latestStatus === 'warning').length,
    criticalApis: apis.filter((api) => api.latestStatus === 'critical').length,
    openAlerts: alerts.filter((alert) => !alert.acknowledged).length,
    expiringSoon: apis.filter((api) => {
      if (!api.expiryAt) return false;
      const days = (new Date(api.expiryAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 14;
    }).length,
    checksRun: checks.length,
    avgLatencyMs: latencies.length
      ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
      : null,
  };
}

export async function listMonitoringSummaryForUser(
  supabase: DatabaseClient,
  userId: string,
): Promise<MonitoringSummary> {
  const { data: apiRows, error: apiError } = await supabase
    .from('workspace_monitored_apis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (apiError) {
    if (isSchemaMissingError(apiError)) {
      return {
        schemaMissing: true,
        apis: [],
        recentChecks: [],
        alerts: [],
        metrics: {
          totalApis: 0,
          healthyApis: 0,
          warningApis: 0,
          criticalApis: 0,
          openAlerts: 0,
          expiringSoon: 0,
          checksRun: 0,
          avgLatencyMs: null,
        },
      };
    }

    throw apiError;
  }

  const apis = ((apiRows ?? []) as MonitoredApiRow[]).map(toApiView);

  const { data: checkRows, error: checkError } = await supabase
    .from('workspace_api_monitor_checks')
    .select('*')
    .eq('user_id', userId)
    .order('checked_at', { ascending: false })
    .limit(80);

  if (checkError && !isSchemaMissingError(checkError)) {
    throw checkError;
  }

  const recentChecks = ((checkRows ?? []) as MonitorCheckRow[]).map(toCheckView);

  const { data: alertRows, error: alertError } = await supabase
    .from('workspace_api_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40);

  if (checkError && !isSchemaMissingError(checkError)) {
    throw checkError;
  }

  if (alertError && !isSchemaMissingError(alertError)) {
    throw alertError;
  }

  const alerts = ((alertRows ?? []) as MonitorAlertRow[]).map(toAlertView);

  return {
    schemaMissing: false,
    apis,
    recentChecks,
    alerts,
    metrics: buildMetrics(apis, recentChecks, alerts),
  };
}

export async function insertMonitoredApi(
  supabase: DatabaseClient,
  userId: string,
  payload: Omit<MonitoredApiRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_checked_at' | 'last_status_code' | 'last_latency_ms' | 'last_error' | 'latest_status' | 'vulnerability_status' | 'vulnerability_summary' | 'quota_remaining' | 'quota_renews_at'>,
) {
  const { data, error } = await supabase
    .from('workspace_monitored_apis')
    .insert({
      user_id: userId,
      ...payload,
      latest_status: 'warning',
      vulnerability_status: 'warning',
      vulnerability_summary: 'Waiting for the first monitoring check.',
      quota_remaining: payload.quota_limit,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as MonitoredApiRow;
}

export async function findMonitoredApiForUser(
  supabase: DatabaseClient,
  userId: string,
  apiId: string,
) {
  const { data, error } = await supabase
    .from('workspace_monitored_apis')
    .select('*')
    .eq('user_id', userId)
    .eq('id', apiId)
    .maybeSingle();

  if (error) throw error;
  return (data as MonitoredApiRow | null) ?? null;
}

export async function findMonitoredApiBySlugForUser(
  supabase: DatabaseClient,
  userId: string,
  slug: string,
) {
  const { data, error } = await supabase
    .from('workspace_monitored_apis')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as { id: string } | null;
}

export async function listMonitoredApiIdsForUser(
  supabase: DatabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from('workspace_monitored_apis')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (isSchemaMissingError(error)) return [];
    throw error;
  }

  return data as Array<{ id: string }>;
}

export async function findApisDueForMonitoring(
  supabase: DatabaseClient,
  olderThanMinutes: number = 5,
) {
  const threshold = new Date(Date.now() - olderThanMinutes * 60000).toISOString();
  const { data, error } = await supabase
    .from('workspace_monitored_apis')
    .select('user_id, id')
    .eq('monitoring_consent', true)
    .or(`last_checked_at.is.null,last_checked_at.lt.${threshold}`);

  if (error) {
    if (isSchemaMissingError(error)) return [];
    throw error;
  }

  return data as Array<{ user_id: string; id: string }>;
}

export async function deleteMonitoredApiForUser(
  supabase: DatabaseClient,
  userId: string,
  apiId: string,
) {
  const { error } = await supabase
    .from('workspace_monitored_apis')
    .delete()
    .eq('user_id', userId)
    .eq('id', apiId);

  if (error) throw error;
}

export async function updateMonitoredApi(
  supabase: DatabaseClient,
  apiId: string,
  updates: Partial<MonitoredApiRow>,
) {
  const { data, error } = await supabase
    .from('workspace_monitored_apis')
    .update(updates)
    .eq('id', apiId)
    .select('*')
    .single();

  if (error) throw error;
  return data as MonitoredApiRow;
}

export async function insertMonitorChecks(
  supabase: DatabaseClient,
  checks: Array<{
    apiId: string;
    userId: string;
    apiName: string;
    checkType: 'uptime' | 'quota' | 'expiry' | 'security';
    severity: AlertSeverity;
    statusCode?: number | null;
    latencyMs?: number | null;
    requestsRemaining?: number | null;
    findings: string[];
  }>,
) {
  if (checks.length === 0) return;
  const { error } = await supabase.from('workspace_api_monitor_checks').insert(
    checks.map((check) => ({
      api_id: check.apiId,
      user_id: check.userId,
      api_name: check.apiName,
      check_type: check.checkType,
      severity: check.severity,
      status_code: check.statusCode ?? null,
      latency_ms: check.latencyMs ?? null,
      requests_remaining: check.requestsRemaining ?? null,
      findings: check.findings,
    })),
  );

  if (error) throw error;
}

export async function insertAlerts(
  supabase: DatabaseClient,
  alerts: Array<{
    apiId: string;
    userId: string;
    apiName: string;
    severity: AlertSeverity;
    title: string;
    body: string;
    channel?: string;
  }>,
) {
  if (alerts.length === 0) return;

  const { error } = await supabase.from('workspace_api_alerts').insert(
    alerts.map((alert) => ({
      api_id: alert.apiId,
      user_id: alert.userId,
      api_name: alert.apiName,
      severity: alert.severity,
      title: alert.title,
      body: alert.body,
      channel: alert.channel ?? 'in_app',
      acknowledged: false,
    })),
  );

  if (error) throw error;
}
