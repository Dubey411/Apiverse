import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMonitoringSummary } from '@/lib/api-monitoring/service';
import { listProjectsForUser } from '@/lib/projects/repository';
import { DashboardActionLink, DashboardPageFrame } from '@/app/developer-dashboard/DashboardSectionComponents';
import ProjectsWorkspace from '@/app/developer-dashboard/projects/ProjectsWorkspace';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DeveloperDashboardProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const projects = user ? await listProjectsForUser(admin, user.id) : {
    schemaMissing: true,
    projects: [],
    metrics: {
      totalProjects: 0,
      totalApis: 0,
      criticalApis: 0,
      expiringSoon: 0,
      vulnerableApis: 0,
    },
  };
  const monitoredApis = user ? await getMonitoringSummary(supabase, user.id) : {
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

  return (
    <DashboardPageFrame
      eyebrow="Project workspaces"
      title="Group APIs by the products that use them."
      description="Create projects, attach the APIs used in each app, document what each API does, and monitor performance, expiry, and vulnerability signals from one place."
      actions={
        <>
          <DashboardActionLink href="/developer-dashboard/projects?newProject=true" label="New project" />
          <DashboardActionLink href="/api-marketplace" label="Find APIs" />
        </>
      }
    >
      <Suspense fallback={
        <div className="flex h-48 items-center justify-center rounded-[32px] border border-dashed border-stone-300/70 bg-white/60 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-stone-500 dark:text-stone-400">Loading projects...</p>
        </div>
      }>
        <ProjectsWorkspace initialProjects={projects} monitoredApis={monitoredApis} />
      </Suspense>
    </DashboardPageFrame>
  );
}
