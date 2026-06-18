import { Suspense } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock3,
  Gauge,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMonitoringSummary } from '@/lib/api-monitoring/service';
import type {
  MonitoringSummary,
  MonitoringStatus,
  MonitoredApiView,
  MonitorAlertView,
  MonitorCheckView,
} from '@/lib/api-monitoring/types';
import {
  DashboardActionLink,
  DashboardMetricCard,
  DashboardPageFrame,
  DashboardPanel,
} from '@/app/developer-dashboard/DashboardSectionComponents';
import AnalyticsApiSelector from '@/app/developer-dashboard/analytics/AnalyticsApiSelector';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const emptySummary: MonitoringSummary = {
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

function formatDateTime(value: string | null) {
  if (!value) return 'Not checked yet';
  return new Date(value).toLocaleString('en-US');
}

function formatDate(value: string | null) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-US');
}

function formatLatency(value: number | null) {
  return typeof value === 'number' ? `${value} ms` : 'Pending';
}

function isApiActive(api: MonitoredApiView) {
  return Boolean(api.monitoringConsent && api.lastCheckedAt && api.latestStatus !== 'paused');
}

function statusClass(status: MonitoringStatus) {
  if (status === 'critical') {
    return 'bg-[#fff0df] text-[#b8573f] dark:bg-[#2a1815] dark:text-[#efb28f]';
  }

  if (status === 'warning') {
    return 'bg-[#f7f0dc] text-[#8b6712] dark:bg-[#231d10] dark:text-[#ecc56a]';
  }

  if (status === 'paused') {
    return 'bg-stone-200 text-stone-600 dark:bg-white/10 dark:text-stone-300';
  }

  return 'bg-[#e7f3ef] text-[#23695d] dark:bg-[#10231f] dark:text-[#82d2c7]';
}

function alertClass(alert: MonitorAlertView) {
  if (alert.severity === 'critical') return 'text-[#d85f43]';
  if (alert.severity === 'warning') return 'text-[#d68d2e]';
  return 'text-[#2b8a7d]';
}

function checkClass(check: MonitorCheckView) {
  if (check.severity === 'critical') return 'border-[#5b2d1f] bg-[#2a1711]/80 text-[#f2b18d]';
  if (check.severity === 'warning') return 'border-[#5d4417] bg-[#241c10]/80 text-[#ecc56a]';
  return 'border-[#1d4f48] bg-[#10231f]/80 text-[#82d2c7]';
}

function averageLatency(checks: MonitorCheckView[]) {
  const latencies = checks
    .map((check) => check.latencyMs)
    .filter((value): value is number => typeof value === 'number');

  if (latencies.length === 0) return null;
  return Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length);
}

function quotaLabel(api: MonitoredApiView | null) {
  if (!api || typeof api.quotaRemaining !== 'number') return 'Unknown';
  if (typeof api.quotaLimit !== 'number') return `${api.quotaRemaining} left`;
  return `${api.quotaRemaining} / ${api.quotaLimit}`;
}

function quotaNote(api: MonitoredApiView | null) {
  if (!api || typeof api.quotaRemaining !== 'number') {
    return 'Quota appears only when your API exposes quota headers or you enter a limit.';
  }

  if (typeof api.quotaLimit !== 'number') {
    return 'Remaining quota was read, but no total limit is configured.';
  }

  const used = Math.max(api.quotaLimit - api.quotaRemaining, 0);
  return `${used} requests used in the latest observed quota window.`;
}

export default async function DeveloperDashboardAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ api?: string | string[] }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const summary = user ? await getMonitoringSummary(supabase, user.id) : emptySummary;
  const params = searchParams ? await searchParams : {};
  const requestedApiId = Array.isArray(params.api) ? params.api[0] : params.api ?? '';
  const selectedApi = summary.apis.find((api) => api.id === requestedApiId) ?? null;
  const selectedApiId = selectedApi?.id ?? '';
  const selectedChecks = selectedApi
    ? summary.recentChecks.filter((check) => check.apiId === selectedApi.id)
    : summary.recentChecks;
  const selectedAlerts = selectedApi
    ? summary.alerts.filter((alert) => alert.apiId === selectedApi.id)
    : summary.alerts;
  const activeApis = summary.apis.filter(isApiActive);
  const inactiveApis = summary.apis.filter((api) => !isApiActive(api));
  const avgSelectedLatency = averageLatency(selectedChecks);
  const latestSelectedCheck = selectedChecks[0] ?? null;

  return (
    <DashboardPageFrame
      eyebrow={selectedApi ? 'API analytics' : 'Workspace analytics'}
      title={selectedApi ? `${selectedApi.name} analytics` : 'Choose an API or review the whole workspace.'}
      description={
        selectedApi
          ? 'This page is filtered to one uploaded API, so you can inspect usage signals, health checks, quota, expiry, alerts, and safe posture findings.'
          : 'By default APIverse shows the total monitoring picture: all uploaded APIs, which ones are active, which ones still need checks, and the latest operational signals.'
      }
      actions={
        <Suspense fallback={<div className="text-sm text-stone-500 dark:text-stone-400">Loading APIs...</div>}>
          <AnalyticsApiSelector
            apis={summary.apis.map((api) => ({
              id: api.id,
              name: api.name,
              latestStatus: isApiActive(api) ? 'active' : 'inactive',
            }))}
            selectedApiId={selectedApiId}
          />
        </Suspense>
      }
    >
      {requestedApiId && !selectedApi ? (
        <div className="rounded-[28px] border border-[#5b2d1f] bg-[#2a1711] px-6 py-5 text-sm leading-7 text-[#f2b18d]">
          That API could not be found in your workspace. Showing all API analytics instead.
        </div>
      ) : null}

      {selectedApi ? (
        <section className="grid gap-4 md:grid-cols-4">
          <DashboardMetricCard label="Latest status" value={selectedApi.latestStatus} note={`Last checked: ${formatDateTime(selectedApi.lastCheckedAt)}`} />
          <DashboardMetricCard label="Data usage" value={quotaLabel(selectedApi)} note={quotaNote(selectedApi)} />
          <DashboardMetricCard label="Checks captured" value={String(selectedChecks.length)} note="Monitoring samples stored for this API." />
          <DashboardMetricCard label="Avg latency" value={avgSelectedLatency ? `${avgSelectedLatency} ms` : formatLatency(selectedApi.lastLatencyMs)} note="Average from recent checks for this API." />
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-4">
          <DashboardMetricCard label="Total APIs" value={String(summary.metrics.totalApis)} note="All APIs uploaded into APIverse monitoring." />
          <DashboardMetricCard label="Active APIs" value={String(activeApis.length)} note="APIs with monitoring consent and at least one check." />
          <DashboardMetricCard label="Inactive APIs" value={String(inactiveApis.length)} note="APIs not checked yet or currently paused." />
          <DashboardMetricCard label="Open alerts" value={String(summary.metrics.openAlerts)} note="Warnings still waiting for review." />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <DashboardPanel
          eyebrow={selectedApi ? 'Selected API' : 'All APIs'}
          title={selectedApi ? 'Usage and health detail' : 'Active and inactive APIs'}
          description={
            selectedApi
              ? 'These values are read from the latest monitor checks and the metadata you registered for this API.'
              : 'Direct analytics starts here: a full list of uploaded APIs, their active state, latest status, and a quick jump into per-API analysis.'
          }
        >
          {summary.apis.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-stone-300/70 bg-white/55 p-6 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              No APIs are registered yet. Add one from My project, run a check, and analytics will start filling from real monitor data.
            </div>
          ) : selectedApi ? (
            <div className="space-y-4">
              <div className="rounded-[26px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                      {selectedApi.slug}
                    </p>
                    <h3 className="mt-3 break-words font-display text-3xl text-stone-950 dark:text-stone-50">
                      {selectedApi.name}
                    </h3>
                    <p className="mt-3 break-all text-sm leading-7 text-stone-600 dark:text-stone-400">
                      {selectedApi.baseUrl}{selectedApi.healthPath}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass(selectedApi.latestStatus)}`}>
                    {selectedApi.latestStatus}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Environment</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{selectedApi.environment === 'live' ? 'Live' : 'Sandbox'}</p>
                  </div>
                  <div className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Status code</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{selectedApi.lastStatusCode ?? '--'}</p>
                  </div>
                  <div className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Credential expiry</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{formatDate(selectedApi.expiryAt)}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Security posture</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                    {selectedApi.vulnerabilitySummary ?? 'No posture findings yet.'}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <DashboardActionLink href="/developer-dashboard/projects" label="Run checks" />
                  {selectedApi.docsUrl ? <DashboardActionLink href={selectedApi.docsUrl} label="Open docs" /> : null}
                  <DashboardActionLink href="/developer-dashboard/projects" label="Back to My project" />
                </div>
              </div>

              <div className="rounded-[26px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Latest usage signal</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  {latestSelectedCheck
                    ? `${latestSelectedCheck.checkType} check ran at ${formatDateTime(latestSelectedCheck.checkedAt)}.`
                    : 'No checks are stored for this API yet. Run the first check from My project.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {summary.apis.map((api) => {
                const active = isApiActive(api);

                return (
                  <article key={api.id} className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${active ? 'bg-[#e7f3ef] text-[#23695d] dark:bg-[#10231f] dark:text-[#82d2c7]' : 'bg-stone-200 text-stone-600 dark:bg-white/10 dark:text-stone-300'}`}>
                            {active ? 'active' : 'inactive'}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass(api.latestStatus)}`}>
                            {api.latestStatus}
                          </span>
                        </div>
                        <h3 className="mt-3 break-words font-display text-3xl text-stone-950 dark:text-stone-50">{api.name}</h3>
                        <p className="mt-2 break-all text-sm leading-7 text-stone-600 dark:text-stone-400">
                          {api.baseUrl}{api.healthPath}
                        </p>
                      </div>
                      <DashboardActionLink href={`/developer-dashboard/analytics?api=${api.id}`} label="View analytics" />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Last checked</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{formatDateTime(api.lastCheckedAt)}</p>
                      </div>
                      <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Latency</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{formatLatency(api.lastLatencyMs)}</p>
                      </div>
                      <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Quota</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{quotaLabel(api)}</p>
                      </div>
                      <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Expiry</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{formatDate(api.expiryAt)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          eyebrow={selectedApi ? 'Monitor history' : 'Workspace signals'}
          title={selectedApi ? 'Recent checks and alerts' : 'What the overview means'}
          description={
            selectedApi
              ? 'Checks are filtered to this API only, so alerts and usage signals are not mixed with other APIs.'
              : 'The default analytics page is intentionally broad: it tells you what is active, what is inactive, and where to drill in.'
          }
        >
          {selectedApi ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                  <Gauge size={18} className="text-[#2b8a7d]" />
                  <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Quota and data usage</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{quotaNote(selectedApi)}</p>
                </div>
                <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                  <Clock3 size={18} className="text-[#d68d2e]" />
                  <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Latest check</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{formatDateTime(selectedApi.lastCheckedAt)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedChecks.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-stone-300/70 bg-white/55 p-6 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                    No check history for this API yet.
                  </div>
                ) : (
                  selectedChecks.slice(0, 8).map((check) => (
                    <div key={check.id} className={`rounded-[22px] border p-4 text-sm leading-7 ${checkClass(check)}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold capitalize">{check.checkType} check</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{check.severity}</p>
                      </div>
                      <p className="mt-2">
                        {check.findings[0] ?? 'Check completed.'}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-75">
                        {formatDateTime(check.checkedAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Alerts for this API</p>
                {selectedAlerts.length === 0 ? (
                  <p className="rounded-[22px] border border-stone-300/70 bg-white/55 p-4 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                    No alerts for this API yet.
                  </p>
                ) : (
                  selectedAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="rounded-[22px] border border-stone-300/70 bg-white/68 p-4 dark:border-white/8 dark:bg-white/5">
                      <p className={`text-sm font-semibold ${alertClass(alert)}`}>{alert.title}</p>
                      <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{alert.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <Activity size={18} className="text-[#2b8a7d]" />
                <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Active means monitoring has started</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  An API becomes active after APIverse has at least one stored check and monitoring consent is enabled.
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <Zap size={18} className="text-[#d68d2e]" />
                <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Inactive usually means no check yet</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  If an API is inactive, run a check from My project or wait for the cron monitor to pick it up.
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <ShieldAlert size={18} className="text-[#d85f43]" />
                <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Security posture is safe-scope only</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  APIverse checks HTTPS, auth hygiene, and response posture headers. It does not run invasive security testing.
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <AlertTriangle size={18} className="text-[#d85f43]" />
                <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Alerts are tied to APIs</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  Click View analytics beside any API to see only the alerts and check history for that API.
                </p>
              </div>
            </div>
          )}
        </DashboardPanel>
      </section>
    </DashboardPageFrame>
  );
}
