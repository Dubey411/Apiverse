export type ProviderEnvironment = 'sandbox' | 'live';

export type ConnectionStatus =
  | 'connected'
  | 'needs_setup'
  | 'rotate_soon'
  | 'sync_error'
  | 'verification_failed';

export type SyncStatus = 'idle' | 'synced' | 'limited' | 'failed';

export interface ProviderFieldDefinition {
  key: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  secret?: boolean;
}

export interface ProviderDefinition {
  id: string;
  label: string;
  description: string;
  authType: string;
  docsUrl: string;
  defaultBaseUrl?: string;
  supportsUsageSync: boolean;
  fields: ProviderFieldDefinition[];
}

export interface ConnectionCredentials {
  [key: string]: string;
}

export interface CreateConnectionInput {
  providerId: string;
  apiSlug?: string;
  displayName: string;
  environment: ProviderEnvironment;
  credentials: ConnectionCredentials;
  baseUrl?: string;
}

export interface ConnectionView {
  id: string;
  providerId: string;
  providerLabel: string;
  apiSlug: string | null;
  displayName: string;
  environment: ProviderEnvironment;
  authType: string;
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  verificationMessage: string | null;
  officialUrl: string | null;
  baseUrl: string | null;
  accountLabel: string | null;
  accountRef: string | null;
  supportsUsageSync: boolean;
  lastVerifiedAt: string | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  lastUsedAt: string | null;
  totalRequests: number | null;
  successRate: number | null;
  averageLatencyMs: number | null;
  errorCount: number | null;
  usageQuantity: number | null;
  usageUnit: string | null;
  estimatedSpend: number | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderVerificationResult {
  ok: boolean;
  message: string;
  accountLabel?: string | null;
  accountRef?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ProviderSyncResult {
  ok: boolean;
  status: SyncStatus;
  message: string;
  summary: {
    totalRequests?: number | null;
    successRate?: number | null;
    averageLatencyMs?: number | null;
    errorCount?: number | null;
    usageQuantity?: number | null;
    usageUnit?: string | null;
    estimatedSpend?: number | null;
    currency?: string | null;
    lastUsedAt?: string | null;
  };
  rawPayload?: unknown;
}
