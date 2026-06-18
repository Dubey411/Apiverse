export type MonitoredApiEnvironment = 'sandbox' | 'live';
export type MonitoringAuthMode = 'none' | 'bearer' | 'api_key';
export type MonitoringStatus = 'healthy' | 'warning' | 'critical' | 'paused';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface MonitoredApiView {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  healthPath: string;
  docsUrl: string | null;
  environment: MonitoredApiEnvironment;
  authMode: MonitoringAuthMode;
  authHeaderName: string | null;
  quotaLimit: number | null;
  quotaRemaining: number | null;
  quotaRemainingHeader: string | null;
  quotaLimitHeader: string | null;
  quotaResetHeader: string | null;
  quotaRenewsAt: string | null;
  expiryAt: string | null;
  alertEmail: string | null;
  ownershipConfirmed: boolean;
  monitoringConsent: boolean;
  securityScanEnabled: boolean;
  latestStatus: MonitoringStatus;
  lastCheckedAt: string | null;
  lastStatusCode: number | null;
  lastLatencyMs: number | null;
  lastError: string | null;
  vulnerabilityStatus: MonitoringStatus;
  vulnerabilitySummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorCheckView {
  id: string;
  apiId: string;
  apiName: string;
  checkType: 'uptime' | 'quota' | 'expiry' | 'security';
  severity: AlertSeverity;
  statusCode: number | null;
  latencyMs: number | null;
  requestsRemaining: number | null;
  findings: string[];
  checkedAt: string;
}

export interface MonitorAlertView {
  id: string;
  apiId: string;
  apiName: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  channel: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface MonitoringMetrics {
  totalApis: number;
  healthyApis: number;
  warningApis: number;
  criticalApis: number;
  openAlerts: number;
  expiringSoon: number;
  checksRun: number;
  avgLatencyMs: number | null;
}

export interface MonitoringSummary {
  schemaMissing: boolean;
  apis: MonitoredApiView[];
  recentChecks: MonitorCheckView[];
  alerts: MonitorAlertView[];
  metrics: MonitoringMetrics;
}

export interface CreateMonitoredApiInput {
  name: string;
  slug: string;
  baseUrl: string;
  healthPath: string;
  docsUrl?: string | null;
  environment: MonitoredApiEnvironment;
  authMode: MonitoringAuthMode;
  authHeaderName?: string | null;
  authValue?: string | null;
  quotaLimit?: number | null;
  quotaRemainingHeader?: string | null;
  quotaLimitHeader?: string | null;
  quotaResetHeader?: string | null;
  expiryAt?: string | null;
  alertEmail?: string | null;
  ownershipConfirmed: boolean;
  monitoringConsent: boolean;
  securityScanEnabled: boolean;
}
