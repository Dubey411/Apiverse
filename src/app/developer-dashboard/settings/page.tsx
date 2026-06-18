import { BellRing, Globe2, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMonitoringSummary } from '@/lib/api-monitoring/service';
import {
  DashboardActionLink,
  DashboardMetricCard,
  DashboardPageFrame,
  DashboardPanel,
} from '@/app/developer-dashboard/DashboardSectionComponents';

export default async function DeveloperDashboardSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const summary = user
    ? await getMonitoringSummary(supabase, user.id)
    : {
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

  const settingsGroups = [
    {
      title: 'Workspace identity',
      detail: `${user?.email ?? 'No signed-in owner'} is the current owner of API registrations, alert acknowledgements, and monitor metadata.`,
    },
    {
      title: 'Notification routing',
      detail: `${summary.metrics.openAlerts} open alerts are currently available in-app. Alert emails are stored per API when you add them on the connector screen.`,
    },
    {
      title: 'Monitoring defaults',
      detail: 'New APIs should start with a safe health endpoint, quota header names if available, and an explicit expiry date whenever the upstream API supports one.',
    },
  ];

  return (
    <DashboardPageFrame
      eyebrow="Workspace preferences"
      title="Settings should support monitoring, ownership, and alert flow."
      description="This page keeps ownership, alert routing, and safe monitoring defaults in one place so APIverse stays honest about what it can and cannot monitor."
      actions={<DashboardActionLink href="/login" label="Switch account" />}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Workspace owner" value={user?.email ?? 'No owner'} note="The account currently responsible for registered APIs and alert triage." />
        <DashboardMetricCard label="Alert workload" value={`${summary.metrics.openAlerts} open`} note="Open alerts currently waiting in the workspace." />
        <DashboardMetricCard label="Expiring soon" value={`${summary.metrics.expiringSoon} APIs`} note="APIs that should be reviewed before their configured credential expiry hits." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardPanel
          eyebrow="Preferences"
          title="Settings"
          description="These settings now support the upload-and-monitor workflow instead of a fake reseller or provider console."
        >
          <div className="space-y-4">
            {settingsGroups.map((group) => (
              <div key={group.title} className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{group.title}</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{group.detail}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          eyebrow="Boundaries"
          title="What this workspace is allowed to do"
          description="APIverse should make legal and technical limits visible rather than hiding them."
        >
          <div className="grid gap-4">
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <UserRound size={18} className="text-[#d85f43]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Owner authorization matters</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Only register APIs you own or are explicitly allowed to monitor. That is the safest legal model for this product.</p>
            </div>
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <BellRing size={18} className="text-[#2b8a7d]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Alerts are best-effort</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Quota and expiry alerts are only as good as the headers or metadata the upstream API actually exposes to APIverse.</p>
            </div>
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <Globe2 size={18} className="text-[#d68d2e]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Security posture is non-invasive</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">APIverse can warn about obvious posture issues, but it should not act like a penetration-testing tool unless you add explicit authorization and consent later.</p>
            </div>
          </div>
        </DashboardPanel>
      </section>
    </DashboardPageFrame>
  );
}
