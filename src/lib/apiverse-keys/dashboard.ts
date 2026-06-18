import type { WorkspaceAnalyticsSummary, WorkspaceUsageEventView } from '@/lib/apiverse-keys/types';

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

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function bucketEvents(
  events: WorkspaceUsageEventView[],
  labels: string[],
  getIndex: (eventDate: Date) => number,
) {
  const rows = labels.map((label) => ({ label, calls: 0, errors: 0 }));

  for (const event of events) {
    const date = new Date(event.createdAt);
    const index = getIndex(date);
    if (index < 0 || index >= rows.length) continue;

    rows[index].calls += event.usageQuantity;
    if (event.statusCode >= 400) {
      rows[index].errors += event.usageQuantity;
    }
  }

  return rows;
}

function buildChartSeries(events: WorkspaceUsageEventView[]) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const last24hData = events.filter(
    (event) => Date.now() - new Date(event.createdAt).getTime() <= 24 * 60 * 60 * 1000,
  );

  const last24h = bucketEvents(
    last24hData,
    ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    (date) => Math.min(5, Math.max(0, Math.floor(date.getHours() / 4))),
  );

  const sevenDayStart = new Date(startOfToday);
  sevenDayStart.setDate(startOfToday.getDate() - 6);
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDayStart);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const last7d = bucketEvents(
    events.filter((event) => new Date(event.createdAt) >= sevenDayStart),
    dayLabels,
    (date) => {
      const daysAgo = Math.floor(
        (startOfToday.getTime() - new Date(date).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000),
      );
      return Math.min(6, Math.max(0, 6 - daysAgo));
    },
  );

  const last30d = bucketEvents(
    events.filter((event) => Date.now() - new Date(event.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000),
    ['W1', 'W2', 'W3', 'W4'],
    (date) => {
      const diffDays = Math.floor(
        (startOfToday.getTime() - new Date(date).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000),
      );
      return Math.min(3, Math.max(0, Math.floor((29 - diffDays) / 7)));
    },
  );

  return {
    '24h': last24h,
    '7d': last7d,
    '30d': last30d,
  };
}

export interface DashboardWorkspaceModel {
  schemaMissing: boolean;
  metrics: {
    activeKeys: string;
    connectedApis: string;
    totalRequests: string;
    successRate: string;
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

export function buildDashboardWorkspaceModel(summary: WorkspaceAnalyticsSummary): DashboardWorkspaceModel {
  const totalRequests = summary.metrics.totalRequests;
  const successRate = totalRequests > 0
    ? Number(((summary.metrics.successfulRequests / totalRequests) * 100).toFixed(2))
    : 100;

  const keysWithNoTraffic = summary.keys.filter((key) => key.status === 'active' && key.totalRequests === 0);
  const sandboxOnlyApis = summary.apiSummaries.filter(
    (api) => api.environments.length === 1 && api.environments[0] === 'sandbox',
  );
  const noisyApis = summary.apiSummaries.filter((api) => api.errorCount > 0);

  const actionQueue: Array<{ title: string; detail: string; accent: string }> = [];

  if (keysWithNoTraffic.length > 0) {
    const next = keysWithNoTraffic[0];
    actionQueue.push({
      title: `Send the first request to ${next.apiName}`,
      detail: `${next.displayName} is already issued. Hit its APIverse endpoint once so analytics starts tracking real usage.`,
      accent: 'text-[#d85f43]',
    });
  }

  if (sandboxOnlyApis.length > 0) {
    const next = sandboxOnlyApis[0];
    actionQueue.push({
      title: `Promote ${next.apiName} from sandbox to live`,
      detail: `${next.activeKeys} key${next.activeKeys === 1 ? '' : 's'} already exist, but traffic is still sandbox-only.`,
      accent: 'text-[#d68d2e]',
    });
  }

  if (noisyApis.length > 0) {
    const next = noisyApis[0];
    actionQueue.push({
      title: `Investigate ${next.apiName} errors`,
      detail: `${next.errorCount} tracked error${next.errorCount === 1 ? '' : 's'} have landed on this API so far.`,
      accent: 'text-[#2b8a7d]',
    });
  }

  if (actionQueue.length === 0) {
    actionQueue.push({
      title: 'Issue another API key',
      detail: 'Create a sandbox or live key for the next API you want the workspace to track.',
      accent: 'text-[#d85f43]',
    });
  }

  const activity = summary.recentEvents.slice(0, 4).map((event) => ({
    time: formatRelativeTime(event.createdAt),
    title: `${event.apiName} handled a ${event.requestMethod} request`,
    detail: `${event.statusCode} response in ${event.latencyMs} ms on ${event.environment} key traffic.`,
  }));

  const topApis = summary.apiSummaries.slice(0, 4);
  const maxRequests = Math.max(...topApis.map((api) => api.totalRequests), 1);
  const usageRows = topApis.map((api) => ({
    label: api.apiName,
    progress: Math.max(18, Math.round((api.totalRequests / maxRequests) * 100)),
    value: `${compactNumber(api.totalRequests)} calls`,
  }));

  const connectedPortfolio = summary.apiSummaries.slice(0, 6).map((api) => ({
    id: api.apiSlug,
    name: api.apiName,
    category: api.environments.includes('live') ? 'Live + sandbox keys' : 'Sandbox only',
    environment: api.environments.includes('live') ? 'Live ready' : 'Sandbox only',
    status: api.errorCount > 0 ? 'Needs review' : 'Healthy',
    usage: `${compactNumber(api.totalRequests)} calls`,
    lastActivity: formatRelativeTime(api.lastUsedAt),
    href: `/api-marketplace/${api.apiSlug}`,
  }));

  return {
    schemaMissing: summary.schemaMissing,
    metrics: {
      activeKeys: String(summary.metrics.activeKeys),
      connectedApis: String(summary.metrics.connectedApis),
      totalRequests: compactNumber(summary.metrics.totalRequests),
      successRate: `${successRate.toFixed(2)}%`,
    },
    actionQueue,
    activity,
    usageRows,
    connectedPortfolio,
    charts: buildChartSeries(summary.recentEvents),
  };
}
