export type WorkspaceKeyEnvironment = 'sandbox' | 'live';
export type WorkspaceKeyStatus = 'active' | 'revoked';

export interface WorkspaceApiKeyView {
  id: string;
  apiSlug: string;
  apiName: string;
  displayName: string;
  environment: WorkspaceKeyEnvironment;
  status: WorkspaceKeyStatus;
  keyPrefix: string;
  lastFour: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageLatencyMs: number | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceUsageEventView {
  id: string;
  apiKeyId: string;
  apiSlug: string;
  apiName: string;
  environment: WorkspaceKeyEnvironment;
  requestMethod: string;
  statusCode: number;
  latencyMs: number;
  requestPath: string;
  requestId: string;
  usageQuantity: number;
  createdAt: string;
}

export interface WorkspaceApiSummary {
  apiSlug: string;
  apiName: string;
  environments: WorkspaceKeyEnvironment[];
  activeKeys: number;
  totalRequests: number;
  successRate: number;
  averageLatencyMs: number | null;
  errorCount: number;
  lastUsedAt: string | null;
}

export interface WorkspaceMetrics {
  totalKeys: number;
  activeKeys: number;
  sandboxKeys: number;
  liveKeys: number;
  connectedApis: number;
  totalRequests: number;
  successfulRequests: number;
  errorCount: number;
}

export interface WorkspaceAnalyticsSummary {
  schemaMissing: boolean;
  keys: WorkspaceApiKeyView[];
  apiSummaries: WorkspaceApiSummary[];
  recentEvents: WorkspaceUsageEventView[];
  metrics: WorkspaceMetrics;
}

export interface CreateWorkspaceApiKeyInput {
  apiSlug: string;
  displayName: string;
  environment: WorkspaceKeyEnvironment;
}

export interface ApiKeyCatalogOption {
  slug: string;
  provider: string;
  product: string;
  category: string;
}
