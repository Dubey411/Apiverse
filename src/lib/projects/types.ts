import type { MonitoringStatus } from '@/lib/api-monitoring/types';

export type ProjectApiCriticality = 'low' | 'medium' | 'high';

export interface ProjectApiUsageView {
  id: string;
  projectId: string;
  monitoredApiId: string | null;
  apiName: string;
  apiSlug: string | null;
  usageDescription: string;
  criticality: ProjectApiCriticality;
  expiryAt: string | null;
  latestStatus: MonitoringStatus;
  lastLatencyMs: number | null;
  lastCheckedAt: string | null;
  vulnerabilityStatus: MonitoringStatus;
  vulnerabilitySummary: string | null;
  createdAt: string;
}

export interface WorkspaceProjectView {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  apis: ProjectApiUsageView[];
}

export interface ProjectsSummary {
  schemaMissing: boolean;
  projects: WorkspaceProjectView[];
  metrics: {
    totalProjects: number;
    totalApis: number;
    criticalApis: number;
    expiringSoon: number;
    vulnerableApis: number;
  };
}
