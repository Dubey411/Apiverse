import { createAdminClient } from '@/lib/supabase/admin';
import { sendAlertEmail } from '@/lib/api-monitoring/emails';
import { decryptMonitorSecret, encryptMonitorSecret } from '@/lib/api-monitoring/crypto';
import {
  deleteMonitoredApiForUser,
  findMonitoredApiBySlugForUser,
  findMonitoredApiForUser,
  insertAlerts,
  insertMonitoredApi,
  insertMonitorChecks,
  isSchemaMissingError,
  listMonitoredApiIdsForUser,
  listMonitoringSummaryForUser,
  updateMonitoredApi,
} from '@/lib/api-monitoring/repository';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AlertSeverity,
  CreateMonitoredApiInput,
  MonitoringStatus,
} from '@/lib/api-monitoring/types';

const COMMON_HEALTH_PATHS = ['/health', '/status', '/ping', '/'];

interface MonitorProbeResult {
  url: string;
  statusCode: number | null;
  latencyMs: number | null;
  error: string | null;
  headers: Headers | null;
}

export interface MonitoredApiConnectionTestResult {
  ok: boolean;
  status: MonitoringStatus;
  url: string;
  statusCode: number | null;
  latencyMs: number | null;
  error: string | null;
  quotaRemaining: number | null;
  quotaLimit: number | null;
  quotaReset: string | null;
  suggestedHealthPath: string | null;
  findings: string[];
  suggestions: string[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function normalizeUrl(value: string) {
  const withProtocol = value.trim().match(/^https?:\/\//i)
    ? value.trim()
    : `https://${value.trim()}`;
  const trimmed = withProtocol.replace(/\/+$/, '');
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('API domain must be a valid URL like https://api.example.com.');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('API domain must start with http:// or https://.');
  }

  return trimmed;
}

function normalizePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function parseNumericHeader(headers: Headers, headerName: string | null) {
  if (!headerName) return null;
  const raw = headers.get(headerName);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseQuotaReset(headers: Headers, headerName: string | null) {
  if (!headerName) return null;
  const raw = headers.get(headerName);
  if (!raw) return null;

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber)) {
    const milliseconds = asNumber > 9999999999 ? asNumber : asNumber * 1000;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function describeVulnerabilitySummary(findings: string[]) {
  if (findings.length === 0) return 'No safe posture warnings were detected on the latest check.';
  if (findings.length === 1) return findings[0];
  return `${findings[0]} (+${findings.length - 1} more checks need attention)`;
}

function chooseSeverity(statuses: MonitoringStatus[]): MonitoringStatus {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'healthy';
}

function toAlertSeverity(status: MonitoringStatus): AlertSeverity {
  if (status === 'critical') return 'critical';
  if (status === 'warning') return 'warning';
  return 'info';
}

function buildAuthHeaders(input: Pick<CreateMonitoredApiInput, 'authMode' | 'authHeaderName' | 'authValue'>) {
  const headers = new Headers();
  const authValue = input.authValue?.trim();

  if (input.authMode === 'bearer' && authValue) {
    headers.set('Authorization', `Bearer ${authValue}`);
  } else if (input.authMode === 'api_key' && authValue) {
    headers.set(input.authHeaderName?.trim() || 'x-api-key', authValue);
  }

  return headers;
}

async function runMonitorProbe(
  baseUrl: string,
  path: string,
  headers: Headers,
): Promise<MonitorProbeResult> {
  const url = `${baseUrl}${path}`;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: controller.signal,
    });

    return {
      url,
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
      error: null,
      headers: response.headers,
    };
  } catch (error) {
    return {
      url,
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : 'Connection test failed.',
      headers: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureUniqueSlug(
  supabase: Parameters<typeof insertMonitoredApi>[0],
  userId: string,
  baseSlug: string,
) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await findMonitoredApiBySlugForUser(supabase, userId, candidate)) {
    candidate = `${baseSlug.slice(0, Math.max(1, 76))}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function getMonitoringSummary(_supabase: SupabaseClient, userId: string) {
  const adminClient = createAdminClient();
  return listMonitoringSummaryForUser(adminClient, userId);
}

export async function createMonitoredApi(
  supabase: Parameters<typeof insertMonitoredApi>[0],
  userId: string,
  input: CreateMonitoredApiInput,
) {
  const name = input.name.trim();
  const slug = slugify(input.slug || input.name);

  if (!name || !input.baseUrl.trim()) {
    throw new Error('API name and API domain are required.');
  }

  if (!slug) {
    throw new Error('API name must include at least one letter or number.');
  }

  if (!input.ownershipConfirmed || !input.monitoringConsent) {
    throw new Error('You must confirm ownership/authorization and allow monitoring before adding an API.');
  }

  const uniqueSlug = await ensureUniqueSlug(supabase, userId, slug);

  const row = await insertMonitoredApi(supabase, userId, {
    name,
    slug: uniqueSlug,
    base_url: normalizeUrl(input.baseUrl),
    health_path: normalizePath(input.healthPath),
    docs_url: input.docsUrl?.trim() || null,
    environment: input.environment,
    auth_mode: input.authMode,
    auth_header_name: input.authMode === 'api_key'
      ? (input.authHeaderName?.trim() || 'x-api-key')
      : input.authMode === 'bearer'
        ? 'Authorization'
        : null,
    encrypted_auth_value: encryptMonitorSecret(input.authValue?.trim() || null),
    quota_limit: typeof input.quotaLimit === 'number' && Number.isFinite(input.quotaLimit) ? input.quotaLimit : null,
    quota_remaining_header: input.quotaRemainingHeader?.trim() || null,
    quota_limit_header: input.quotaLimitHeader?.trim() || null,
    quota_reset_header: input.quotaResetHeader?.trim() || null,
    expiry_at: input.expiryAt || null,
    alert_email: input.alertEmail?.trim() || null,
    ownership_confirmed: input.ownershipConfirmed,
    monitoring_consent: input.monitoringConsent,
    security_scan_enabled: input.securityScanEnabled,
  });

  return row;
}

export async function testMonitoredApiConnection(
  input: Pick<
    CreateMonitoredApiInput,
    | 'baseUrl'
    | 'healthPath'
    | 'authMode'
    | 'authHeaderName'
    | 'authValue'
    | 'quotaLimit'
    | 'quotaRemainingHeader'
    | 'quotaLimitHeader'
    | 'quotaResetHeader'
    | 'securityScanEnabled'
  >,
): Promise<MonitoredApiConnectionTestResult> {
  if (!input.baseUrl.trim()) {
    throw new Error('API domain is required before testing.');
  }

  const baseUrl = normalizeUrl(input.baseUrl);
  const healthPath = normalizePath(input.healthPath);
  const headers = buildAuthHeaders(input);
  const primaryProbe = await runMonitorProbe(baseUrl, healthPath, headers);
  let suggestedHealthPath: string | null = null;
  const findings: string[] = [];
  const suggestions: string[] = [];

  if (primaryProbe.statusCode && primaryProbe.statusCode >= 200 && primaryProbe.statusCode < 400) {
    findings.push(`Connection worked. ${primaryProbe.url} returned HTTP ${primaryProbe.statusCode}.`);
  } else if (primaryProbe.statusCode === 401 || primaryProbe.statusCode === 403) {
    findings.push(`The endpoint responded with HTTP ${primaryProbe.statusCode}.`);
    suggestions.push('Check the auth mode, header name, and pasted key/token from the provider dashboard.');
  } else if (primaryProbe.statusCode === 404) {
    findings.push('The API domain was reachable, but this health path returned HTTP 404.');
    suggestions.push('Try a different health path like /status, /ping, or the provider-specific status endpoint.');
  } else if (primaryProbe.statusCode && primaryProbe.statusCode >= 500) {
    findings.push(`The endpoint responded with HTTP ${primaryProbe.statusCode}.`);
    suggestions.push('This usually means the API server is reachable but unhealthy right now.');
  } else if (primaryProbe.statusCode) {
    findings.push(`The endpoint responded with HTTP ${primaryProbe.statusCode}.`);
    suggestions.push('Review whether this response is expected for your health endpoint.');
  } else {
    findings.push(primaryProbe.error ?? 'The endpoint could not be reached.');
    suggestions.push('Check that the API domain is not a dashboard URL and that the server is reachable from APIverse.');
  }

  if (primaryProbe.statusCode === 404 || primaryProbe.error) {
    for (const candidatePath of COMMON_HEALTH_PATHS) {
      if (candidatePath === healthPath) continue;

      const candidateProbe = await runMonitorProbe(baseUrl, candidatePath, headers);
      if (candidateProbe.statusCode && candidateProbe.statusCode >= 200 && candidateProbe.statusCode < 400) {
        suggestedHealthPath = candidatePath;
        suggestions.push(`APIverse found a working health path: ${candidatePath}.`);
        break;
      }
    }
  }

  const quotaRemaining = primaryProbe.headers
    ? parseNumericHeader(primaryProbe.headers, input.quotaRemainingHeader?.trim() || null)
    : null;
  const quotaLimit = primaryProbe.headers
    ? parseNumericHeader(primaryProbe.headers, input.quotaLimitHeader?.trim() || null) ?? input.quotaLimit ?? null
    : input.quotaLimit ?? null;
  const quotaReset = primaryProbe.headers
    ? parseQuotaReset(primaryProbe.headers, input.quotaResetHeader?.trim() || null)
    : null;

  if (input.quotaRemainingHeader && typeof quotaRemaining !== 'number') {
    suggestions.push(`The response did not include ${input.quotaRemainingHeader}; quota remaining will show as unknown.`);
  }

  if (!baseUrl.startsWith('https://')) {
    suggestions.push('Use HTTPS for live APIs so monitoring does not send credentials over plain HTTP.');
  }

  if (input.securityScanEnabled && primaryProbe.headers) {
    if (!primaryProbe.headers.get('strict-transport-security')) {
      findings.push('Strict-Transport-Security header was not present on the response.');
    }
    if (!primaryProbe.headers.get('x-content-type-options')) {
      findings.push('X-Content-Type-Options header was not present on the response.');
    }
  }

  const ok = Boolean(primaryProbe.statusCode && primaryProbe.statusCode >= 200 && primaryProbe.statusCode < 400);
  const status: MonitoringStatus = ok
    ? 'healthy'
    : primaryProbe.error || (primaryProbe.statusCode !== null && primaryProbe.statusCode >= 500)
      ? 'critical'
      : 'warning';

  return {
    ok,
    status,
    url: primaryProbe.url,
    statusCode: primaryProbe.statusCode,
    latencyMs: primaryProbe.latencyMs,
    error: primaryProbe.error,
    quotaRemaining,
    quotaLimit,
    quotaReset,
    suggestedHealthPath,
    findings,
    suggestions: Array.from(new Set(suggestions)),
  };
}

export async function removeMonitoredApi(
  supabase: Parameters<typeof deleteMonitoredApiForUser>[0],
  userId: string,
  apiId: string,
) {
  return deleteMonitoredApiForUser(supabase, userId, apiId);
}

export async function runMonitoringCheck(
  supabase: Parameters<typeof findMonitoredApiForUser>[0],
  userId: string,
  apiId: string,
) {
  const api = await findMonitoredApiForUser(supabase, userId, apiId);
  if (!api) {
    throw new Error('API not found.');
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const headers = new Headers();

  const authValue = decryptMonitorSecret(api.encrypted_auth_value);
  if (api.auth_mode === 'bearer' && authValue) {
    headers.set('Authorization', `Bearer ${authValue}`);
  } else if (api.auth_mode === 'api_key' && authValue && api.auth_header_name) {
    headers.set(api.auth_header_name, authValue);
  }

  let statusCode: number | null = null;
  let latencyMs: number | null = null;
  let lastError: string | null = null;
  let responseHeaders: Headers | null = null;
  let uptimeStatus: MonitoringStatus = 'healthy';
  const securityFindings: string[] = [];

  try {
    const response = await fetch(`${api.base_url}${api.health_path}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: controller.signal,
    });
    statusCode = response.status;
    latencyMs = Date.now() - startedAt;
    responseHeaders = response.headers;

    if (response.status >= 500) {
      uptimeStatus = 'critical';
      lastError = `Health endpoint returned ${response.status}.`;
    } else if (response.status >= 400) {
      uptimeStatus = 'warning';
      lastError = `Health endpoint returned ${response.status}.`;
    }
  } catch (error) {
    latencyMs = Date.now() - startedAt;
    uptimeStatus = 'critical';
    lastError = error instanceof Error ? error.message : 'Monitor request failed.';
  } finally {
    clearTimeout(timeout);
  }

  const quotaRemaining = responseHeaders
    ? parseNumericHeader(responseHeaders, api.quota_remaining_header)
    : null;
  const quotaLimit = responseHeaders
    ? parseNumericHeader(responseHeaders, api.quota_limit_header) ?? api.quota_limit
    : api.quota_limit;
  const quotaReset = responseHeaders ? parseQuotaReset(responseHeaders, api.quota_reset_header) : null;

  let quotaStatus: MonitoringStatus = 'healthy';
  if (typeof quotaRemaining === 'number' && typeof quotaLimit === 'number' && quotaLimit > 0) {
    const ratio = quotaRemaining / quotaLimit;
    if (ratio <= 0.05) quotaStatus = 'critical';
    else if (ratio <= 0.15) quotaStatus = 'warning';
  }

  let expiryStatus: MonitoringStatus = 'healthy';
  if (api.expiry_at) {
    const daysLeft = (new Date(api.expiry_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft < 0) {
      expiryStatus = 'critical';
    } else if (daysLeft <= 14) {
      expiryStatus = 'warning';
    }
  }

  if (!api.base_url.startsWith('https://')) {
    securityFindings.push('Base URL is not using HTTPS, so credentials and traffic posture are not considered safe.');
  }
  if (api.auth_mode === 'none') {
    securityFindings.push('Monitoring is running without auth headers. Confirm this endpoint is intentionally public.');
  }
  if (api.security_scan_enabled && responseHeaders) {
    if (!responseHeaders.get('strict-transport-security')) {
      securityFindings.push('Strict-Transport-Security header is missing on the monitored endpoint response.');
    }
    if (!responseHeaders.get('x-content-type-options')) {
      securityFindings.push('X-Content-Type-Options header is missing, so the basic response posture is weaker than expected.');
    }
  }
  const securityStatus: MonitoringStatus = securityFindings.length >= 2
    ? 'critical'
    : securityFindings.length === 1
      ? 'warning'
      : 'healthy';

  const latestStatus = chooseSeverity([uptimeStatus, quotaStatus, expiryStatus, securityStatus]);
  const vulnerabilityStatus = chooseSeverity([securityStatus]);
  const vulnerabilitySummary = describeVulnerabilitySummary(securityFindings);

  await updateMonitoredApi(supabase, api.id, {
    last_checked_at: new Date().toISOString(),
    last_status_code: statusCode,
    last_latency_ms: latencyMs,
    last_error: lastError,
    latest_status: latestStatus,
    vulnerability_status: vulnerabilityStatus,
    vulnerability_summary: vulnerabilitySummary,
    quota_remaining: quotaRemaining ?? api.quota_remaining,
    quota_limit: quotaLimit,
    quota_renews_at: quotaReset ?? api.quota_renews_at,
  });

  const checks = [
    {
      apiId: api.id,
      userId,
      apiName: api.name,
      checkType: 'uptime' as const,
      severity: toAlertSeverity(uptimeStatus),
      statusCode,
      latencyMs,
      findings: lastError ? [lastError] : ['Health endpoint responded successfully.'],
    },
    {
      apiId: api.id,
      userId,
      apiName: api.name,
      checkType: 'quota' as const,
      severity: toAlertSeverity(quotaStatus),
      requestsRemaining: quotaRemaining,
      findings: typeof quotaRemaining === 'number'
        ? [`${quotaRemaining} requests remain on the latest observed quota window.`]
        : ['Quota headers were not available on the latest response.'],
    },
    {
      apiId: api.id,
      userId,
      apiName: api.name,
      checkType: 'expiry' as const,
      severity: toAlertSeverity(expiryStatus),
      findings: api.expiry_at
        ? [`Credential expiry is set to ${new Date(api.expiry_at).toLocaleString('en-US')}.`]
        : ['No expiry date is stored yet.'],
    },
    {
      apiId: api.id,
      userId,
      apiName: api.name,
      checkType: 'security' as const,
      severity: toAlertSeverity(securityStatus),
      findings: securityFindings.length ? securityFindings : ['No safe posture warnings were detected on the latest check.'],
    },
  ];

  await insertMonitorChecks(supabase, checks);

  const alerts = [];
  if (uptimeStatus === 'critical' || uptimeStatus === 'warning') {
    alerts.push({
      apiId: api.id,
      userId,
      apiName: api.name,
      severity: toAlertSeverity(uptimeStatus),
      title: `${api.name} health check needs attention`,
      body: lastError ?? 'The latest health request did not return a healthy response.',
    });
  }
  if (quotaStatus === 'warning' || quotaStatus === 'critical') {
    alerts.push({
      apiId: api.id,
      userId,
      apiName: api.name,
      severity: toAlertSeverity(quotaStatus),
      title: `${api.name} quota is running low`,
      body: typeof quotaRemaining === 'number' && typeof quotaLimit === 'number'
        ? `${quotaRemaining} requests remain out of ${quotaLimit}.`
        : 'Quota monitoring is configured, but the latest response did not expose clear remaining values.',
    });
  }
  if (expiryStatus === 'warning' || expiryStatus === 'critical') {
    alerts.push({
      apiId: api.id,
      userId,
      apiName: api.name,
      severity: toAlertSeverity(expiryStatus),
      title: `${api.name} credentials are close to expiry`,
      body: api.expiry_at
        ? `Stored expiry is ${new Date(api.expiry_at).toLocaleString('en-US')}.`
        : 'No expiry date is stored for this API yet.',
    });
  }
  if (securityStatus === 'warning' || securityStatus === 'critical') {
    alerts.push({
      apiId: api.id,
      userId,
      apiName: api.name,
      severity: toAlertSeverity(securityStatus),
      title: `${api.name} has security posture warnings`,
      body: vulnerabilitySummary,
    });
  }

  await insertAlerts(supabase, alerts);

  if (alerts.length > 0 && api.alert_email) {
    // Fire and forget email dispatch; do not fail the check if email fails
    void sendAlertEmail(api.alert_email, api.name, alerts);
  }

  return {
    status: latestStatus,
    statusCode,
    latencyMs,
    quotaRemaining,
    quotaLimit,
    vulnerabilitySummary,
    alertsCreated: alerts.length,
  };
}

export async function runMonitoringCheckAsAdmin(userId: string, apiId: string) {
  const admin = createAdminClient();
  return runMonitoringCheck(admin, userId, apiId);
}

export async function runMonitoringChecksForUser(
  supabase: SupabaseClient,
  userId: string,
) {
  const apis = await listMonitoredApiIdsForUser(supabase, userId);
  const results = await Promise.allSettled(
    apis.map((api) => runMonitoringCheck(supabase, userId, api.id)),
  );

  return {
    checked: apis.length,
    successful: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
    failures: results.flatMap((result, index) => {
      if (result.status === 'fulfilled') return [];
      const reason = result.reason instanceof Error
        ? result.reason.message
        : 'Monitoring check failed.';
      return [{ apiId: apis[index]?.id, reason }];
    }),
  };
}

export { isSchemaMissingError };
