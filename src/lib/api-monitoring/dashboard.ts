import type { MonitoringSummary, MonitorCheckView } from '@/lib/api-monitoring/types';

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatRelativeTime(isoTimestamp: string | null) {
  if (!isoTimestamp) return 'Pending';

  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function bucketChecks(
  checks: MonitorCheckView[],
  labels: string[],
  getIndex: (date: Date) => number,
) {
  const rows = labels.map((label) => ({ label, calls: 0, errors: 0 }));
  for (const check of checks.filter((item) => item.checkType === 'uptime')) {
    const index = getIndex(new Date(check.checkedAt));
    if (index < 0 || index >= rows.length) continue;
    rows[index].calls += 1;
    if (check.severity !== 'info') rows[index].errors += 1;
  }
  return rows;
}

function buildCharts(checks: MonitorCheckView[]) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // 24h: 6 four-hour buckets keyed by hour-of-day
  const last24hData = checks.filter(
    (c) => Date.now() - new Date(c.checkedAt).getTime() <= 24 * 60 * 60 * 1000,
  );

  // 7d: 7 buckets where index 0 = 6 days ago, index 6 = today
  const sevenDayStart = new Date(startOfToday);
  sevenDayStart.setDate(startOfToday.getDate() - 6);
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDayStart);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

  return {
    '24h': bucketChecks(
      last24hData,
      ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      (date) => Math.min(5, Math.max(0, Math.floor(date.getHours() / 4))),
    ),
    '7d': bucketChecks(
      checks.filter((c) => new Date(c.checkedAt) >= sevenDayStart),
      dayLabels,
      (date) => {
        const daysAgo = Math.floor(
          (startOfToday.getTime() - new Date(date).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000),
        );
        return Math.min(6, Math.max(0, 6 - daysAgo));
      },
    ),
    '30d': bucketChecks(
      checks.filter((c) => Date.now() - new Date(c.checkedAt).getTime() <= 30 * 24 * 60 * 60 * 1000),
      ['W1', 'W2', 'W3', 'W4'],
      (date) => {
        const diffDays = Math.floor(
          (startOfToday.getTime() - new Date(date).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000),
        );
        return Math.min(3, Math.max(0, Math.floor((29 - diffDays) / 7)));
      },
    ),
  };
}

export interface MonitoringDashboardModel {
  schemaMissing: boolean;
  metrics: {
    totalApis: string;
    healthyApis: string;
    openAlerts: string;
    avgLatency: string;
  };
  actionQueue: Array<{ title: string; detail: string; accent: string }>;
  activity: Array<{ time: string; title: string; detail: string }>;
  usageRows: Array<{ label: string; progress: number; value: string }>;
  connectedPortfolio: Array<{
    id: string;
    name: string;
    category: string;
    environment: string;
    status: string;
    usage: string;
    lastActivity: string;
    href: string;
  }>;
  charts: {
    '24h': Array<{ label: string; calls: number; errors: number }>;
    '7d': Array<{ label: string; calls: number; errors: number }>;
    '30d': Array<{ label: string; calls: number; errors: number }>;
  };
}

export function buildMonitoringDashboardModel(summary: MonitoringSummary): MonitoringDashboardModel {
  const actionQueue: MonitoringDashboardModel['actionQueue'] = [];
  const expiring = summary.apis.find((api) => {
    if (!api.expiryAt) return false;
    const days = (new Date(api.expiryAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 14;
  });
  const critical = summary.apis.find((api) => api.latestStatus === 'critical');
  const unconfigured = summary.apis.find((api) => !api.lastCheckedAt);

  if (critical) {
    actionQueue.push({
      title: `Review ${critical.name}`,
      detail: critical.lastError ?? critical.vulnerabilitySummary ?? 'The latest monitoring check flagged this API as critical.',
      accent: 'text-[#d85f43]',
    });
  }
  if (expiring) {
    actionQueue.push({
      title: `${expiring.name} expires soon`,
      detail: `Credential expiry is set to ${new Date(expiring.expiryAt as string).toLocaleDateString('en-US')}.`,
      accent: 'text-[#d68d2e]',
    });
  }
  if (unconfigured) {
    actionQueue.push({
      title: `Run the first monitor for ${unconfigured.name}`,
      detail: 'The API is registered, but no health, quota, or security check has been captured yet.',
      accent: 'text-[#2b8a7d]',
    });
  }
  if (actionQueue.length === 0) {
    actionQueue.push({
      title: 'Register the next API',
      detail: 'Upload another owned API so APIverse can keep quota, expiry, and health in the same workspace.',
      accent: 'text-[#d85f43]',
    });
  }

  const activity = summary.recentChecks.slice(0, 4).map((check) => ({
    time: formatRelativeTime(check.checkedAt),
    title: `${check.apiName} ${check.checkType} check ran`,
    detail: check.findings[0] ?? 'The latest monitoring cycle finished.',
  }));

  const topApis = summary.apis.slice(0, 4);
  const usageRows = topApis.map((api) => ({
    label: api.name,
    progress: api.latestStatus === 'critical' ? 95 : api.latestStatus === 'warning' ? 65 : 35,
    value: typeof api.quotaRemaining === 'number'
      ? `${compactNumber(api.quotaRemaining)} remaining`
      : api.lastLatencyMs
        ? `${api.lastLatencyMs} ms`
        : 'Awaiting first check',
  }));

  return {
    schemaMissing: summary.schemaMissing,
    metrics: {
      totalApis: String(summary.metrics.totalApis),
      healthyApis: String(summary.metrics.healthyApis),
      openAlerts: String(summary.metrics.openAlerts),
      avgLatency: summary.metrics.avgLatencyMs ? `${summary.metrics.avgLatencyMs} ms` : 'Pending',
    },
    actionQueue,
    activity,
    usageRows,
    connectedPortfolio: summary.apis.slice(0, 6).map((api) => ({
      id: api.id,
      name: api.name,
      category: api.baseUrl,
      environment: api.environment === 'live' ? 'Live' : 'Sandbox',
      status: api.latestStatus === 'critical' ? 'Critical' : api.latestStatus === 'warning' ? 'Warning' : 'Healthy',
      usage: typeof api.quotaRemaining === 'number'
        ? `${compactNumber(api.quotaRemaining)} remaining`
        : api.lastStatusCode ? `${api.lastStatusCode} status` : 'Not checked',
      lastActivity: formatRelativeTime(api.lastCheckedAt),
      href: '/developer-dashboard/projects',
    })),
    charts: buildCharts(summary.recentChecks),
  };
}
