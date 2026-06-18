import type { ConnectionView } from '@/lib/provider-connections/types';
import type { ConnectionsSummary } from '@/lib/provider-connections/service';

function formatUsage(connection: ConnectionView) {
  if (connection.usageQuantity === null || connection.usageQuantity === undefined) {
    return connection.connectionStatus === 'connected' ? 'Connected' : 'Awaiting sync';
  }

  const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    connection.usageQuantity,
  );

  return connection.usageUnit ? `${compact} ${connection.usageUnit}` : compact;
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

export interface DashboardWorkspaceModel {
  schemaMissing: boolean;
  metrics: {
    savedShortlist: string;
    connectedApis: string;
    docsLeft: string;
    healthyKeys: string;
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
    officialUrl: string | null;
  }>;
}

export function buildDashboardWorkspaceModel(summary: ConnectionsSummary): DashboardWorkspaceModel {
  const connections = summary.connections;
  const needsAttention = connections.filter((item) =>
    ['needs_setup', 'rotate_soon', 'sync_error', 'verification_failed'].includes(item.connectionStatus),
  );
  const shortlistEstimate = Math.max(12 - connections.length, 0);
  const docsLeft = Math.max(shortlistEstimate, 2);
  const healthyKeys = `${Math.max(summary.metrics.total - needsAttention.length, 0)} / ${Math.max(summary.metrics.total, 0)}`;

  const actionQueue = needsAttention.slice(0, 4).map((connection) => ({
    title:
      connection.connectionStatus === 'rotate_soon'
        ? `Rotate ${connection.displayName} key`
        : connection.connectionStatus === 'needs_setup'
          ? `Finish ${connection.displayName} setup`
          : connection.connectionStatus === 'sync_error'
            ? `Re-sync ${connection.displayName}`
            : `Reconnect ${connection.displayName}`,
    detail:
      connection.verificationMessage ??
      `This ${connection.environment} connection still needs work before it can be trusted in the workspace.`,
    accent:
      connection.connectionStatus === 'rotate_soon'
        ? 'text-[#d85f43]'
        : connection.connectionStatus === 'needs_setup'
          ? 'text-[#d68d2e]'
          : 'text-[#2b8a7d]',
  }));

  if (actionQueue.length === 0) {
    actionQueue.push(
      {
        title: 'Connect your next shortlisted API',
        detail: 'Pick one API from the shortlist and attach a sandbox key so the workspace can start comparing real usage.',
        accent: 'text-[#d85f43]',
      },
      {
        title: 'Compare providers before going live',
        detail: 'Use APIverse docs and saved notes to decide which provider should move from sandbox to production.',
        accent: 'text-[#d68d2e]',
      },
    );
  }

  const activity = connections
    .slice(0, 4)
    .map((connection) => ({
      time: formatRelativeTime(connection.lastSyncAt ?? connection.lastVerifiedAt ?? connection.updatedAt),
      title: `${connection.displayName} ${connection.syncStatus === 'synced' ? 'synced' : 'verified'}`,
      detail:
        connection.lastSyncError ??
        connection.verificationMessage ??
        `${connection.providerLabel} is connected in ${connection.environment} mode.`,
    }));

  const usageRows = connections.slice(0, 4).map((connection) => {
    const quantity = connection.usageQuantity ?? 0;
    const progress = Math.max(18, Math.min(92, quantity > 0 ? Math.round(quantity % 90) : 24));

    return {
      label: connection.displayName,
      progress,
      value: formatUsage(connection),
    };
  });

  const connectedPortfolio = connections.slice(0, 6).map((connection) => ({
    id: connection.id,
    name: connection.displayName,
    category: connection.providerLabel,
    environment: connection.environment === 'live' ? 'Live' : 'Sandbox',
    status:
      connection.connectionStatus === 'connected'
        ? 'Connected'
        : connection.connectionStatus === 'rotate_soon'
          ? 'Rotate soon'
          : connection.connectionStatus === 'needs_setup'
            ? 'Needs setup'
            : connection.connectionStatus === 'sync_error'
              ? 'Sync error'
              : 'Verification failed',
    usage: formatUsage(connection),
    lastActivity: formatRelativeTime(connection.lastUsedAt ?? connection.lastSyncAt ?? connection.updatedAt),
    officialUrl: connection.officialUrl,
  }));

  return {
    schemaMissing: summary.schemaMissing,
    metrics: {
      savedShortlist: String(shortlistEstimate),
      connectedApis: String(summary.metrics.connected),
      docsLeft: String(docsLeft),
      healthyKeys,
    },
    actionQueue,
    activity,
    usageRows,
    connectedPortfolio,
  };
}
