// ============================================================
// health-monitoring.service.ts
// Pings API base URLs and records latency + status in DB.
// Runs from /api/cron/monitor on a schedule.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { saveStatusCheck } from '@/lib/repositories/api.repository';

export interface HealthCheckResult {
  apiId: string;
  slug: string;
  status: 'healthy' | 'warning' | 'critical' | 'paused';
  latencyMs: number;
  errorRate: number;
  error?: string;
}

/** Ping a URL and return latency in ms or null on failure */
async function pingUrl(url: string, timeoutMs = 8000): Promise<{ latencyMs: number; ok: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'APIverse-HealthBot/1.0' },
    });
    const latencyMs = Date.now() - start;
    clearTimeout(timer);
    return { latencyMs, ok: res.ok || res.status < 500 };
  } catch {
    clearTimeout(timer);
    return { latencyMs: Date.now() - start, ok: false };
  }
}

/** Map latency and ok into a status string */
function resolveStatus(
  latencyMs: number,
  ok: boolean
): 'healthy' | 'warning' | 'critical' | 'paused' {
  if (!ok) return 'critical';
  if (latencyMs > 3000) return 'warning';
  if (latencyMs > 1500) return 'warning';
  return 'healthy';
}

/**
 * Run health checks on all APIs in the database and persist results.
 */
export async function runHealthMonitoring(): Promise<{
  checked: number;
  results: HealthCheckResult[];
}> {
  const admin = createAdminClient();

  const { data: apis, error } = await admin
    .from('apis')
    .select('id, slug, base_url')
    .order('slug');

  if (error || !apis) {
    console.error('[health-monitor] Failed to fetch APIs:', error);
    return { checked: 0, results: [] };
  }

  const results: HealthCheckResult[] = [];

  for (const api of apis) {
    if (!api.base_url) {
      results.push({
        apiId: api.id,
        slug: api.slug,
        status: 'paused',
        latencyMs: 0,
        errorRate: 100,
        error: 'No base URL configured',
      });
      continue;
    }

    const { latencyMs, ok } = await pingUrl(api.base_url);
    const status = resolveStatus(latencyMs, ok);
    const errorRate = ok ? 0 : 100;

    await saveStatusCheck(api.id, status, latencyMs, errorRate);

    results.push({ apiId: api.id, slug: api.slug, status, latencyMs, errorRate });
    console.log(`[health-monitor] ${api.slug}: ${status} (${latencyMs}ms)`);
  }

  console.log(`[health-monitor] Completed checks for ${results.length} APIs`);
  return { checked: results.length, results };
}
