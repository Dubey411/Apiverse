'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  KeyRound,
  ListChecks,
  Loader2,
  RefreshCcw,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  MonitoringAuthMode,
  MonitoringStatus,
  MonitoringSummary,
  MonitoredApiEnvironment,
  MonitoredApiView,
} from '@/lib/api-monitoring/types';

type MonitoringResponse = MonitoringSummary & { error?: string };

type ApiFormState = ReturnType<typeof defaultForm>;

interface ConnectionTestResult {
  ok: boolean;
  status: MonitoringStatus;
  url: string;
  statusCode: number | null;
  latencyMs: number | null;
  error: string | null;
  quotaRemaining: number | null;
  quotaLimit: number | null;
  quotaReset: string | null;
  suggestedHealthPath: string | null;
  findings: string[];
  suggestions: string[];
}

const wizardSteps = [
  { label: 'Identify', help: 'Name, domain, health path' },
  { label: 'Authorize', help: 'Key or token' },
  { label: 'Test', help: 'Verify before saving' },
  { label: 'Save', help: 'Alerts and monitoring' },
];

const inputClass = 'w-full rounded-2xl border border-stone-300/70 bg-white/75 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#d85f43] dark:border-white/10 dark:bg-white/5 dark:text-stone-100';
const selectClass = 'themed-select w-full rounded-2xl border border-stone-300/70 bg-white/75 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#d85f43] dark:border-white/10 dark:bg-white/5 dark:text-stone-100';

function formatRelativeTime(isoTimestamp: string | null) {
  if (!isoTimestamp) return 'Not checked yet';

  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.max(Math.round(diff / 60000), 1);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function defaultForm() {
  return {
    name: '',
    slug: '',
    baseUrl: '',
    healthPath: '/health',
    docsUrl: '',
    environment: 'live' as MonitoredApiEnvironment,
    authMode: 'none' as MonitoringAuthMode,
    authHeaderName: 'x-api-key',
    authValue: '',
    quotaLimit: '',
    quotaRemainingHeader: '',
    quotaLimitHeader: '',
    quotaResetHeader: '',
    expiryAt: '',
    alertEmail: '',
    ownershipConfirmed: true,
    monitoringConsent: true,
    securityScanEnabled: true,
  };
}

function statusPill(status: MonitoredApiView['latestStatus']) {
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

function testStatusClasses(status: MonitoringStatus) {
  if (status === 'healthy') {
    return 'border-[#2b8a7d]/35 bg-[#e7f3ef] text-[#23695d] dark:border-[#2b8a7d]/35 dark:bg-[#10231f] dark:text-[#82d2c7]';
  }
  if (status === 'warning') {
    return 'border-[#d68d2e]/35 bg-[#f7f0dc] text-[#8b6712] dark:border-[#d68d2e]/35 dark:bg-[#231d10] dark:text-[#ecc56a]';
  }
  return 'border-[#d85f43]/35 bg-[#fff0df] text-[#b8573f] dark:border-[#d85f43]/35 dark:bg-[#2a1815] dark:text-[#efb28f]';
}

function buildPayload(form: ApiFormState) {
  return {
    ...form,
    slug: form.slug.trim(),
    quotaLimit: form.quotaLimit ? Number(form.quotaLimit) : null,
    expiryAt: form.expiryAt || null,
    docsUrl: form.docsUrl || null,
    authHeaderName: form.authMode === 'api_key' ? form.authHeaderName : null,
    authValue: form.authMode === 'none' ? null : form.authValue || null,
    quotaRemainingHeader: form.quotaRemainingHeader || null,
    quotaLimitHeader: form.quotaLimitHeader || null,
    quotaResetHeader: form.quotaResetHeader || null,
    alertEmail: form.alertEmail || null,
  };
}

function ConnectionTestCard({
  result,
  onUseSuggestedPath,
}: {
  result: ConnectionTestResult | null;
  onUseSuggestedPath: (path: string) => void;
}) {
  if (!result) {
    return (
      <div className="rounded-[24px] border border-dashed border-stone-300/70 bg-white/50 p-5 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
        Test result will appear here before the API is saved. This keeps the setup honest: you see reachability, status code, latency, and likely mistakes first.
      </div>
    );
  }

  const Icon = result.status === 'healthy' ? CheckCircle2 : result.status === 'warning' ? AlertTriangle : XCircle;

  return (
    <div className={`rounded-[24px] border p-5 ${testStatusClasses(result.status)}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={18} />
            <p className="text-sm font-semibold">
              {result.status === 'healthy' ? 'Connection works' : result.status === 'warning' ? 'Connection needs review' : 'Connection failed'}
            </p>
          </div>
          <p className="mt-2 break-all text-sm opacity-85">{result.url}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
            HTTP {result.statusCode ?? '--'}
          </span>
          <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
            {typeof result.latencyMs === 'number' ? `${result.latencyMs} ms` : 'No latency'}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[18px] bg-black/5 p-3 dark:bg-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">Quota remaining</p>
          <p className="mt-2 text-sm font-semibold">{result.quotaRemaining ?? 'Unknown'}</p>
        </div>
        <div className="rounded-[18px] bg-black/5 p-3 dark:bg-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">Quota limit</p>
          <p className="mt-2 text-sm font-semibold">{result.quotaLimit ?? 'Unknown'}</p>
        </div>
        <div className="rounded-[18px] bg-black/5 p-3 dark:bg-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">Quota reset</p>
          <p className="mt-2 text-sm font-semibold">{result.quotaReset ? new Date(result.quotaReset).toLocaleString('en-US') : 'Unknown'}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm leading-7">
        {result.findings.map((finding) => (
          <p key={finding}>{finding}</p>
        ))}
      </div>

      {result.suggestedHealthPath ? (
        <button
          type="button"
          onClick={() => onUseSuggestedPath(result.suggestedHealthPath as string)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15"
        >
          Use suggested path {result.suggestedHealthPath}
          <ArrowRight size={13} />
        </button>
      ) : null}

      {result.suggestions.length > 0 ? (
        <div className="mt-4 rounded-[18px] bg-black/5 p-4 text-sm leading-7 dark:bg-white/10">
          <p className="font-semibold">Suggestions</p>
          {result.suggestions.map((suggestion) => (
            <p key={suggestion} className="mt-1 opacity-85">{suggestion}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProviderConnectionsWorkspace() {
  const router = useRouter();
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [form, setForm] = useState(defaultForm);

  function updateForm(patch: Partial<ApiFormState>) {
    setForm((current) => ({ ...current, ...patch }));
    setTestResult(null);
    setSubmitError(null);
  }

  async function loadMonitoringSummary() {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/monitored-apis', {
        credentials: 'same-origin',
        cache: 'no-store',
      });

      const payload = (await response.json()) as MonitoringResponse;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load monitored APIs.');
      }

      setSummary(payload);
      return payload;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load monitored APIs.');
      return null;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadMonitoringSummary();
  }, []);

  const metrics = summary?.metrics ?? {
    totalApis: 0,
    healthyApis: 0,
    warningApis: 0,
    criticalApis: 0,
    openAlerts: 0,
    expiringSoon: 0,
    checksRun: 0,
    avgLatencyMs: null,
  };

  const alertPreview = useMemo(() => summary?.alerts.slice(0, 3) ?? [], [summary]);
  const canContinueFromIdentify = Boolean(form.name.trim() && form.baseUrl.trim());
  const canContinueFromAuth = form.authMode === 'none'
    || (form.authMode === 'bearer' && Boolean(form.authValue.trim()))
    || (form.authMode === 'api_key' && Boolean(form.authHeaderName.trim() && form.authValue.trim()));
  const canSave = Boolean(testResult && testResult.status !== 'critical');

  function moveNext() {
    if (setupStep === 0 && !canContinueFromIdentify) {
      toast.error('Add the API name and API domain first.');
      return;
    }

    if (setupStep === 1 && !canContinueFromAuth) {
      toast.error('Add the auth key/token, or choose No auth if the health endpoint is public.');
      return;
    }

    if (setupStep === 2 && !testResult) {
      toast.error('Test the connection before moving to save.');
      return;
    }

    setSetupStep((current) => Math.min(current + 1, wizardSteps.length - 1));
  }

  async function handleTestConnection() {
    setSubmitError(null);

    if (!canContinueFromIdentify) {
      const message = 'Add the API name and API domain before testing.';
      setSubmitError(message);
      toast.error(message);
      setSetupStep(0);
      return;
    }

    if (!canContinueFromAuth) {
      const message = 'Add the auth key/token, or choose No auth if this endpoint is public.';
      setSubmitError(message);
      toast.error(message);
      setSetupStep(1);
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/monitored-apis/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(buildPayload(form)),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        result?: ConnectionTestResult;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? 'Unable to test API connection.');
      }

      setTestResult(payload.result);
      setSetupStep(2);

      if (payload.result.ok) {
        toast.success(payload.message ?? 'Connection test passed.');
      } else if (payload.result.status === 'warning') {
        toast.warning(payload.message ?? 'Connection test completed with warnings.');
      } else {
        toast.error(payload.result.error ?? 'Connection test failed.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to test API connection.';
      setTestResult(null);
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleCreateApi(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!canContinueFromIdentify) {
      const message = 'API name and API domain are required.';
      setSubmitError(message);
      toast.error(message);
      setSetupStep(0);
      return;
    }

    if (!canContinueFromAuth) {
      const message = 'Auth setup is incomplete.';
      setSubmitError(message);
      toast.error(message);
      setSetupStep(1);
      return;
    }

    if (!testResult) {
      const message = 'Run Test connection before saving this API.';
      setSubmitError(message);
      toast.error(message);
      setSetupStep(2);
      return;
    }

    if (testResult.status === 'critical') {
      const message = 'Fix the connection test failure before saving this API.';
      setSubmitError(message);
      toast.error(message);
      setSetupStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/monitored-apis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(buildPayload(form)),
      });

      const payload = (await response.json()) as { error?: string; message?: string; api?: { id?: string } };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to register API.');
      }

      const nextSummary = await loadMonitoringSummary();
      const apiExists = payload.api?.id
        ? nextSummary?.apis.some((api) => api.id === payload.api?.id)
        : false;

      if (!apiExists) {
        throw new Error('API was saved, but the dashboard did not refresh correctly. Reload once and it should appear.');
      }

      router.refresh();
      toast.success(payload.message ?? 'API registered for monitoring.');

      if (payload.api?.id) {
        const checkResponse = await fetch(`/api/monitored-apis/${payload.api.id}`, {
          method: 'POST',
          credentials: 'same-origin',
        });

        if (checkResponse.ok) {
          await loadMonitoringSummary();
          router.refresh();
        } else {
          const checkPayload = (await checkResponse.json()) as { error?: string };
          toast.warning(checkPayload.error ?? 'API was saved, but the first monitoring check needs attention.');
        }
      }

      setSubmitError(null);
      setTestResult(null);
      setShowAdvanced(false);
      setSetupStep(0);
      setForm(defaultForm());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to register API.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRunCheck(api: MonitoredApiView) {
    setCheckingId(api.id);
    try {
      const response = await fetch(`/api/monitored-apis/${api.id}`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to run monitor check.');
      }
      toast.success(payload.message ?? `Monitoring check ran for ${api.name}.`);
      await loadMonitoringSummary();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to run monitor check.');
    } finally {
      setCheckingId(null);
    }
  }

  async function handleRunAllChecks() {
    setIsRunningAll(true);
    try {
      const response = await fetch('/api/monitored-apis/run-checks', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        result?: { checked: number; successful: number; failed: number };
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to run monitoring checks.');
      }

      toast.success(payload.message ?? 'Monitoring checks completed.');
      if (payload.result?.failed) {
        toast.warning(`${payload.result.failed} check${payload.result.failed === 1 ? '' : 's'} need attention.`);
      }
      await loadMonitoringSummary();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to run monitoring checks.');
    } finally {
      setIsRunningAll(false);
    }
  }

  async function handleDeleteApi(api: MonitoredApiView) {
    try {
      const response = await fetch(`/api/monitored-apis/${api.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to remove API.');
      }
      toast.success(`${api.name} removed.`);
      await loadMonitoringSummary();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to remove API.');
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Registered APIs</p>
          <p className="mt-4 font-display text-4xl text-stone-950 dark:text-stone-50">{metrics.totalApis}</p>
        </article>
        <article className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Healthy</p>
          <p className="mt-4 font-display text-4xl text-stone-950 dark:text-stone-50">{metrics.healthyApis}</p>
        </article>
        <article className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Open alerts</p>
          <p className="mt-4 font-display text-4xl text-stone-950 dark:text-stone-50">{metrics.openAlerts}</p>
        </article>
        <article className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Avg latency</p>
          <p className="mt-4 font-display text-4xl text-stone-950 dark:text-stone-50">
            {typeof metrics.avgLatencyMs === 'number' ? `${metrics.avgLatencyMs} ms` : '--'}
          </p>
        </article>
      </section>

      {summary?.schemaMissing ? (
        <div className="rounded-[28px] border border-[#5b2d1f] bg-[#2a1711] px-6 py-5 text-sm leading-7 text-[#f2b18d]">
          The monitored API tables are not in Supabase yet. Run the SQL migration at{' '}
          <span className="font-mono text-[#ffd3ba]">supabase/migrations/20260421_workspace_api_monitoring.sql</span>{' '}
          and reload this page.
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.86fr]">
        <article className="editorial-card rounded-[32px] p-6">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Guided API setup</p>
          <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">Connect your API without the guesswork</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
            APIverse now asks only for the basics first, tests the endpoint before saving, and keeps quota, expiry, and docs fields tucked away until you need them.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {wizardSteps.map((step, index) => (
              <button
                key={step.label}
                type="button"
                onClick={() => setSetupStep(index)}
                className={`rounded-[22px] border p-4 text-left transition ${
                  setupStep === index
                    ? 'border-[#d85f43]/60 bg-[#fff0df] dark:border-[#ef7d52]/35 dark:bg-[#2a1815]'
                    : 'border-stone-300/70 bg-white/55 hover:border-stone-400 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{step.label}</p>
                <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{step.help}</p>
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleCreateApi}>
            {submitError ? (
              <div className="rounded-[22px] border border-[#5b2d1f] bg-[#2a1711] px-4 py-3 text-sm leading-7 text-[#f2b18d]">
                {submitError}
              </div>
            ) : null}

            {setupStep === 0 ? (
              <section className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">API name</span>
                    <input
                      suppressHydrationWarning
                      type="text"
                      value={form.name}
                      onChange={(event) => {
                        const value = event.target.value;
                        setForm((current) => ({
                          ...current,
                          name: value,
                          slug: current.slug
                            ? current.slug
                            : value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        }));
                        setTestResult(null);
                        setSubmitError(null);
                      }}
                      placeholder="Sarvam AI / GST Search / My Payments API"
                      className={inputClass}
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">API domain</span>
                    <input
                      suppressHydrationWarning
                      type="text"
                      value={form.baseUrl}
                      onChange={(event) => updateForm({ baseUrl: event.target.value })}
                      placeholder="https://api.sarvam.ai"
                      className={inputClass}
                      required
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Health or status path</span>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={form.healthPath}
                    onChange={(event) => updateForm({ healthPath: event.target.value })}
                    placeholder="/health"
                    className={inputClass}
                  />
                </label>

                <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 text-sm leading-7 text-stone-600 dark:border-white/8 dark:bg-black/10 dark:text-stone-400">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">What is API domain?</p>
                  <p className="mt-1">
                    Use the real API root, not the provider dashboard. Example: use <span className="font-mono">https://api.sarvam.ai</span>, not <span className="font-mono">dashboard.sarvam.ai/key-management</span>.
                  </p>
                </div>
              </section>
            ) : null}

            {setupStep === 1 ? (
              <section className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Auth mode</span>
                    <select
                      suppressHydrationWarning
                      value={form.authMode}
                      onChange={(event) => updateForm({ authMode: event.target.value as MonitoringAuthMode })}
                      className={selectClass}
                    >
                      <option value="none">No auth</option>
                      <option value="bearer">Bearer token</option>
                      <option value="api_key">API key header</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Environment</span>
                    <select
                      suppressHydrationWarning
                      value={form.environment}
                      onChange={(event) => updateForm({ environment: event.target.value as MonitoredApiEnvironment })}
                      className={selectClass}
                    >
                      <option value="live">Live</option>
                      <option value="sandbox">Sandbox / test</option>
                    </select>
                  </label>
                </div>

                {form.authMode !== 'none' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {form.authMode === 'api_key' ? (
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Header name</span>
                        <input
                          suppressHydrationWarning
                          type="text"
                          value={form.authHeaderName}
                          onChange={(event) => updateForm({ authHeaderName: event.target.value })}
                          placeholder="x-api-key"
                          className={inputClass}
                        />
                      </label>
                    ) : (
                      <div className="rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 text-sm leading-7 text-stone-600 dark:border-white/8 dark:bg-black/10 dark:text-stone-400">
                        <p className="font-semibold text-stone-900 dark:text-stone-100">Bearer token</p>
                        <p className="mt-1">APIverse will send it as <span className="font-mono">Authorization: Bearer your-token</span>.</p>
                      </div>
                    )}

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {form.authMode === 'bearer' ? 'Bearer token' : 'API key value'}
                      </span>
                      <input
                        suppressHydrationWarning
                        type="password"
                        value={form.authValue}
                        onChange={(event) => updateForm({ authValue: event.target.value })}
                        placeholder="Paste the key/token from your provider dashboard"
                        className={inputClass}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 text-sm leading-7 text-stone-600 dark:border-white/8 dark:bg-black/10 dark:text-stone-400">
                    <KeyRound size={18} className="text-[#d68d2e]" />
                    <p className="mt-3 font-semibold text-stone-900 dark:text-stone-100">No auth means public monitoring only</p>
                    <p className="mt-1">Choose this only if the health endpoint is intentionally public and does not need a provider key.</p>
                  </div>
                )}
              </section>
            ) : null}

            {setupStep === 2 ? (
              <section className="space-y-5">
                <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 text-sm leading-7 text-stone-600 dark:border-white/8 dark:bg-black/10 dark:text-stone-400">
                  <ListChecks size={18} className="text-[#2b8a7d]" />
                  <p className="mt-3 font-semibold text-stone-900 dark:text-stone-100">Test before saving</p>
                  <p className="mt-1">
                    APIverse will send one safe GET request to <span className="font-mono">{form.baseUrl || 'your-domain'}{form.healthPath || '/health'}</span> and report what it sees.
                  </p>
                </div>

                <ConnectionTestCard
                  result={testResult}
                  onUseSuggestedPath={(path) => updateForm({ healthPath: path })}
                />
              </section>
            ) : null}

            {setupStep === 3 ? (
              <section className="space-y-5">
                <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 text-sm leading-7 text-stone-600 dark:border-white/8 dark:bg-black/10 dark:text-stone-400">
                  <CheckCircle2 size={18} className={testResult?.status === 'healthy' ? 'text-[#2b8a7d]' : 'text-[#d68d2e]'} />
                  <p className="mt-3 font-semibold text-stone-900 dark:text-stone-100">
                    {testResult ? 'Ready to save monitoring' : 'Test connection first'}
                  </p>
                  <p className="mt-1">
                    {testResult
                      ? `Latest test: HTTP ${testResult.statusCode ?? '--'} in ${typeof testResult.latencyMs === 'number' ? `${testResult.latencyMs} ms` : 'unknown latency'}.`
                      : 'Run the connection test so APIverse knows this endpoint can be monitored.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvanced((current) => !current)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200"
                >
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showAdvanced ? 'Hide optional monitoring fields' : 'Optional quota, expiry, docs, and alerts'}
                </button>

                {showAdvanced ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Slug</span>
                        <input
                          suppressHydrationWarning
                          type="text"
                          value={form.slug}
                          onChange={(event) => updateForm({ slug: event.target.value })}
                          placeholder="auto-generated-slug"
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Docs URL</span>
                        <input
                          suppressHydrationWarning
                          type="url"
                          value={form.docsUrl}
                          onChange={(event) => updateForm({ docsUrl: event.target.value })}
                          placeholder="https://docs.example.com"
                          className={inputClass}
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Quota limit</span>
                        <input
                          suppressHydrationWarning
                          type="number"
                          min="0"
                          value={form.quotaLimit}
                          onChange={(event) => updateForm({ quotaLimit: event.target.value })}
                          placeholder="10000"
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Remaining header</span>
                        <input
                          suppressHydrationWarning
                          type="text"
                          value={form.quotaRemainingHeader}
                          onChange={(event) => updateForm({ quotaRemainingHeader: event.target.value })}
                          placeholder="x-ratelimit-remaining"
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Limit header</span>
                        <input
                          suppressHydrationWarning
                          type="text"
                          value={form.quotaLimitHeader}
                          onChange={(event) => updateForm({ quotaLimitHeader: event.target.value })}
                          placeholder="x-ratelimit-limit"
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Reset header</span>
                        <input
                          suppressHydrationWarning
                          type="text"
                          value={form.quotaResetHeader}
                          onChange={(event) => updateForm({ quotaResetHeader: event.target.value })}
                          placeholder="x-ratelimit-reset"
                          className={inputClass}
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Credential expiry</span>
                        <input
                          suppressHydrationWarning
                          type="datetime-local"
                          value={form.expiryAt}
                          onChange={(event) => updateForm({ expiryAt: event.target.value })}
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Alert email</span>
                        <input
                          suppressHydrationWarning
                          type="email"
                          value={form.alertEmail}
                          onChange={(event) => updateForm({ alertEmail: event.target.value })}
                          placeholder="ops@yourcompany.com"
                          className={inputClass}
                        />
                      </label>
                    </div>
                  </>
                ) : null}

                <div className="rounded-[22px] border border-dashed border-stone-300/70 bg-white/50 p-4 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">Safe monitoring scope</p>
                  <p className="mt-1">
                    APIverse runs health, quota, expiry, and safe posture checks only against APIs you own or are explicitly authorized to monitor.
                  </p>
                </div>
              </section>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-300/60 pt-5 dark:border-white/10">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSetupStep((current) => Math.max(current - 1, 0))}
                  disabled={setupStep === 0 || isSubmitting || isTesting}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
                >
                  Back
                </button>
                {setupStep < 2 ? (
                  <button
                    type="button"
                    onClick={moveNext}
                    disabled={isSubmitting || isTesting}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
                  >
                    Continue
                    <ArrowRight size={15} />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                {setupStep >= 2 ? (
                  <button
                    type="button"
                    onClick={() => void handleTestConnection()}
                    disabled={isTesting || isSubmitting || isLoading || !summary || summary.schemaMissing}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
                  >
                    {isTesting ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                    Test connection
                  </button>
                ) : null}
                {setupStep === 2 && testResult ? (
                  <button
                    type="button"
                    onClick={moveNext}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Review and save
                    <ArrowRight size={15} />
                  </button>
                ) : null}
                {setupStep === 3 ? (
                  <button
                    type="submit"
                    disabled={isSubmitting || isTesting || isLoading || !summary || summary.schemaMissing || !canSave}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
                    Save monitored API
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </article>

        <article className="editorial-card rounded-[32px] p-6">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Setup helper</p>
          <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">What APIverse checks before it saves</h2>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <Globe size={18} className="text-[#2b8a7d]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Reachability</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">We verify the API root plus health path from the server, not from your browser.</p>
            </div>
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <KeyRound size={18} className="text-[#d68d2e]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Auth mistakes</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">If the provider returns 401 or 403, APIverse tells you to check the key, token, or header name.</p>
            </div>
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <ListChecks size={18} className="text-[#2b8a7d]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Health path suggestions</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">If your chosen path returns 404, APIverse tries common paths like /status and /ping and suggests one if it works.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleRunAllChecks()}
              disabled={isRunningAll || isSubmitting || isTesting || isLoading || !summary || summary.schemaMissing}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
            >
              {isRunningAll ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
              Run all checks
            </button>
            <button
              type="button"
              onClick={() => void loadMonitoringSummary()}
              disabled={isRefreshing || isRunningAll}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
            >
              {isRefreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
              Refresh board
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="editorial-card rounded-[32px] p-6">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Alerts</p>
          <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">Attention board</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
            Expiry warnings, low quota, endpoint failures, and safe security posture findings land here.
          </p>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-[24px] border border-dashed border-stone-300/70 bg-white/55 p-6 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                Loading alerts...
              </div>
            ) : alertPreview.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-stone-300/70 bg-white/55 p-6 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                No alerts yet. Register an API and run the first monitor check to start filling this board.
              </div>
            ) : (
              alertPreview.map((alert) => (
                <div key={alert.id} className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{alert.title}</p>
                      <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{alert.body}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      alert.severity === 'critical'
                        ? 'bg-[#fff0df] text-[#b8573f] dark:bg-[#2a1815] dark:text-[#efb28f]'
                        : alert.severity === 'warning'
                          ? 'bg-[#f7f0dc] text-[#8b6712] dark:bg-[#231d10] dark:text-[#ecc56a]'
                          : 'bg-[#e7f3ef] text-[#23695d] dark:bg-[#10231f] dark:text-[#82d2c7]'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    {alert.apiName} - {formatRelativeTime(alert.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="editorial-card rounded-[32px] p-6">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Registered APIs</p>
          <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">Monitoring board</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
            Every card below is an API you uploaded. Manual checks and scheduled cron checks use the same monitoring pipeline.
          </p>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-[24px] border border-dashed border-stone-300/70 bg-white/55 p-6 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                Loading registered APIs...
              </div>
            ) : summary && summary.apis.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-stone-300/70 bg-white/55 p-6 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                No APIs are registered yet. Add one above, test it, then save it so analytics can start filling with real signals.
              </div>
            ) : (
              summary?.apis.map((api) => (
                <div key={api.id} className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{api.name}</p>
                      <p className="mt-1 break-all text-sm text-stone-600 dark:text-stone-400">
                        {api.baseUrl}{api.healthPath}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusPill(api.latestStatus)}`}>
                      {api.latestStatus}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Latency</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {typeof api.lastLatencyMs === 'number' ? `${api.lastLatencyMs} ms` : 'Pending'}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Status code</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{api.lastStatusCode ?? '--'}</p>
                    </div>
                    <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Quota</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {typeof api.quotaRemaining === 'number'
                          ? `${api.quotaRemaining}${typeof api.quotaLimit === 'number' ? ` / ${api.quotaLimit}` : ''}`
                          : 'Unknown'}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Expiry</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {api.expiryAt ? new Date(api.expiryAt).toLocaleDateString('en-US') : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                    <div className="flex items-center gap-2">
                      <Shield size={15} className={api.vulnerabilityStatus === 'critical' ? 'text-[#d85f43]' : api.vulnerabilityStatus === 'warning' ? 'text-[#d68d2e]' : 'text-[#2b8a7d]'} />
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Security posture</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                      {api.vulnerabilitySummary ?? 'No posture findings yet.'}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleRunCheck(api)}
                      disabled={checkingId === api.id}
                      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkingId === api.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                      Run check
                    </button>
                    <Link
                      href={`/developer-dashboard/analytics?api=${api.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
                    >
                      <ExternalLink size={14} />
                      View analytics
                    </Link>
                    {api.docsUrl ? (
                      <Link
                        href={api.docsUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
                      >
                        <ExternalLink size={14} />
                        Open docs
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void handleDeleteApi(api)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#f2c4b5] bg-[#fff4ee] px-4 py-2 text-sm font-semibold text-[#b8573f] transition hover:border-[#d85f43] dark:border-[#4a2d24] dark:bg-[#201512] dark:text-[#efb28f]"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    Last checked {formatRelativeTime(api.lastCheckedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="editorial-card rounded-[32px] p-6">
        <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">How it works</p>
        <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">What APIverse can monitor safely</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
            <Globe size={18} className="text-[#2b8a7d]" />
            <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Health and latency</p>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">APIverse sends a safe health request to the endpoint you configure and stores status code, latency, and last error.</p>
          </div>
          <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
            <Bell size={18} className="text-[#d68d2e]" />
            <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Quota and expiry</p>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">When the API exposes quota headers or you enter an expiry date, APIverse can warn before requests run out or credentials expire.</p>
          </div>
          <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
            <AlertTriangle size={18} className="text-[#d85f43]" />
            <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Safe security posture only</p>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">APIverse checks safe signals like HTTPS, auth hygiene, and response headers. It does not run invasive security testing.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
