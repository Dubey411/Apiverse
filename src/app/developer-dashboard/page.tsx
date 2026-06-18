import DashboardExperience from '@/app/developer-dashboard/DashboardExperience';
import { createClient } from '@/lib/supabase/server';
import { getMonitoringSummary } from '@/lib/api-monitoring/service';
import { buildMonitoringDashboardModel } from '@/lib/api-monitoring/dashboard';

export default async function DeveloperDashboardPage() {
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

  return <DashboardExperience workspace={buildMonitoringDashboardModel(summary)} />;
}
