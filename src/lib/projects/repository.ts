import type { SupabaseClient } from '@supabase/supabase-js';
import type { MonitoringStatus } from '@/lib/api-monitoring/types';
import { isSchemaMissingError } from '@/lib/api-monitoring/repository';
import type { ProjectApiCriticality, ProjectsSummary, WorkspaceProjectView } from '@/lib/projects/types';

type DatabaseClient = SupabaseClient;

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectApiRow {
  id: string;
  project_id: string;
  user_id: string;
  monitored_api_id: string | null;
  api_name: string;
  api_slug: string | null;
  usage_description: string;
  criticality: ProjectApiCriticality;
  expiry_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MonitoredApiStatusRow {
  id: string;
  latest_status: MonitoringStatus;
  last_latency_ms: number | null;
  last_checked_at: string | null;
  vulnerability_status: MonitoringStatus;
  vulnerability_summary: string | null;
  expiry_at: string | null;
}

function emptySummary(schemaMissing = false): ProjectsSummary {
  return {
    schemaMissing,
    projects: [],
    metrics: {
      totalProjects: 0,
      totalApis: 0,
      criticalApis: 0,
      expiringSoon: 0,
      vulnerableApis: 0,
    },
  };
}

function buildMetrics(projects: WorkspaceProjectView[]): ProjectsSummary['metrics'] {
  const apis = projects.flatMap((project) => project.apis);
  return {
    totalProjects: projects.length,
    totalApis: apis.length,
    criticalApis: apis.filter((api) => api.latestStatus === 'critical' || api.criticality === 'high').length,
    expiringSoon: apis.filter((api) => {
      if (!api.expiryAt) return false;
      const daysLeft = (new Date(api.expiryAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysLeft >= 0 && daysLeft <= 14;
    }).length,
    vulnerableApis: apis.filter((api) => api.vulnerabilityStatus === 'critical' || api.vulnerabilityStatus === 'warning').length,
  };
}

export async function listProjectsForUser(supabase: DatabaseClient, userId: string): Promise<ProjectsSummary> {
  const { data: projectRows, error: projectError } = await supabase
    .from('workspace_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (projectError) {
    if (isSchemaMissingError(projectError)) return emptySummary(true);
    throw projectError;
  }

  const projects = (projectRows ?? []) as ProjectRow[];
  if (projects.length === 0) return emptySummary(false);

  const { data: apiRows, error: apiError } = await supabase
    .from('workspace_project_apis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (apiError) {
    if (isSchemaMissingError(apiError)) return emptySummary(true);
    throw apiError;
  }

  const projectApis = (apiRows ?? []) as ProjectApiRow[];
  const monitoredIds = Array.from(new Set(projectApis.flatMap((api) => api.monitored_api_id ? [api.monitored_api_id] : [])));
  const statusById = new Map<string, MonitoredApiStatusRow>();

  if (monitoredIds.length > 0) {
    const { data: monitoredRows, error: monitoredError } = await supabase
      .from('workspace_monitored_apis')
      .select('id, latest_status, last_latency_ms, last_checked_at, vulnerability_status, vulnerability_summary, expiry_at')
      .eq('user_id', userId)
      .in('id', monitoredIds);

    if (monitoredError) throw monitoredError;
    for (const row of (monitoredRows ?? []) as MonitoredApiStatusRow[]) {
      statusById.set(row.id, row);
    }
  }

  const views: WorkspaceProjectView[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    apis: projectApis
      .filter((api) => api.project_id === project.id)
      .map((api) => {
        const status = api.monitored_api_id ? statusById.get(api.monitored_api_id) : null;
        return {
          id: api.id,
          projectId: api.project_id,
          monitoredApiId: api.monitored_api_id,
          apiName: api.api_name,
          apiSlug: api.api_slug,
          usageDescription: api.usage_description,
          criticality: api.criticality,
          expiryAt: api.expiry_at ?? status?.expiry_at ?? null,
          latestStatus: status?.latest_status ?? 'warning',
          lastLatencyMs: status?.last_latency_ms ?? null,
          lastCheckedAt: status?.last_checked_at ?? null,
          vulnerabilityStatus: status?.vulnerability_status ?? 'warning',
          vulnerabilitySummary: status?.vulnerability_summary ?? 'No monitoring check has been attached yet.',
          createdAt: api.created_at,
        };
      }),
  }));

  return {
    schemaMissing: false,
    projects: views,
    metrics: buildMetrics(views),
  };
}

export async function createProjectForUser(
  supabase: DatabaseClient,
  userId: string,
  input: { name: string; description?: string | null },
) {
  const name = input.name.trim();
  if (!name) throw new Error('Project name is required.');

  const { data, error } = await supabase
    .from('workspace_projects')
    .insert({
      user_id: userId,
      name,
      description: input.description?.trim() || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ProjectRow;
}

export async function addApiToProjectForUser(
  supabase: DatabaseClient,
  userId: string,
  input: {
    projectId: string;
    monitoredApiId?: string | null;
    apiName: string;
    apiSlug?: string | null;
    usageDescription: string;
    criticality: ProjectApiCriticality;
    expiryAt?: string | null;
  },
) {
  const projectId = input.projectId.trim();
  const apiName = input.apiName.trim();
  const usageDescription = input.usageDescription.trim();

  if (!projectId || !apiName || !usageDescription) {
    throw new Error('Project, API name, and usage description are required.');
  }

  const { data: project, error: projectError } = await supabase
    .from('workspace_projects')
    .select('id')
    .eq('user_id', userId)
    .eq('id', projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) throw new Error('Project not found.');

  const { data, error } = await supabase
    .from('workspace_project_apis')
    .insert({
      project_id: projectId,
      user_id: userId,
      monitored_api_id: input.monitoredApiId || null,
      api_name: apiName,
      api_slug: input.apiSlug?.trim() || null,
      usage_description: usageDescription,
      criticality: input.criticality,
      expiry_at: input.expiryAt || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ProjectApiRow;
}

export async function deleteProjectApiForUser(
  supabase: DatabaseClient,
  userId: string,
  projectApiId: string,
) {
  const { error } = await supabase
    .from('workspace_project_apis')
    .delete()
    .eq('user_id', userId)
    .eq('id', projectApiId);

  if (error) throw error;
}
