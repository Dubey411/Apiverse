'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderKanban,
  Globe,
  KeyRound,
  ListChecks,
  Loader2,
  Plus,
  Rocket,
  ShieldAlert,
  Tag,
  Trash2,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  MonitoringAuthMode,
  MonitoringStatus,
  MonitoringSummary,
  MonitoredApiEnvironment,
  MonitoredApiView,
} from '@/lib/api-monitoring/types';
import type { ProjectsSummary, WorkspaceProjectView } from '@/lib/projects/types';

// ─── Shared style tokens ─────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-2xl border border-stone-300/70 bg-white/75 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#d85f43] dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-500';
const selectClass =
  'themed-select w-full rounded-2xl border border-stone-300/70 bg-white/75 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#d85f43] dark:border-white/10 dark:bg-white/5 dark:text-stone-100';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ApiConnectForm {
  name: string;
  slug: string;
  baseUrl: string;
  healthPath: string;
  docsUrl: string;
  environment: MonitoredApiEnvironment;
  authMode: MonitoringAuthMode;
  authHeaderName: string;
  authValue: string;
  quotaLimit: string;
  quotaRemainingHeader: string;
  quotaLimitHeader: string;
  quotaResetHeader: string;
  expiryAt: string;
  alertEmail: string;
  ownershipConfirmed: boolean;
  monitoringConsent: boolean;
  securityScanEnabled: boolean;
}

interface AttachedApiItem {
  monitoredApiId: string;
  apiName: string;
  usageDescription: string;
  criticality: 'low' | 'medium' | 'high';
  expiryAt: string | null;
}

function defaultApiForm(): ApiConnectForm {
  return {
    name: '',
    slug: '',
    baseUrl: '',
    healthPath: '/health',
    docsUrl: '',
    environment: 'live',
    authMode: 'none',
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

function buildApiPayload(form: ApiConnectForm) {
  return {
    ...form,
    slug: form.slug.trim() || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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

// ─── Wizard state ─────────────────────────────────────────────────────────────

interface WizardState {
  projectName: string;
  projectDescription: string;
  apis: AttachedApiItem[];
}

const EMPTY_WIZARD: WizardState = {
  projectName: '',
  projectDescription: '',
  apis: [],
};

const STEPS = [
  { id: 1, label: 'Project', icon: FolderKanban },
  { id: 2, label: 'Connect APIs', icon: Zap },
  { id: 3, label: 'Review & Launch', icon: Rocket },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusClass(status: string) {
  if (status === 'critical' || status === 'high')
    return 'bg-[#fff0df] text-[#b8573f] dark:bg-[#2a1815] dark:text-[#efb28f]';
  if (status === 'warning' || status === 'medium')
    return 'bg-[#f7f0dc] text-[#8b6712] dark:bg-[#231d10] dark:text-[#ecc56a]';
  return 'bg-[#e7f3ef] text-[#23695d] dark:bg-[#10231f] dark:text-[#82d2c7]';
}

function testStatusClasses(status: MonitoringStatus) {
  if (status === 'healthy')
    return 'border-[#2b8a7d]/35 bg-[#e7f3ef] text-[#23695d] dark:border-[#2b8a7d]/35 dark:bg-[#10231f] dark:text-[#82d2c7]';
  if (status === 'warning')
    return 'border-[#d68d2e]/35 bg-[#f7f0dc] text-[#8b6712] dark:border-[#d68d2e]/35 dark:bg-[#231d10] dark:text-[#ecc56a]';
  return 'border-[#d85f43]/35 bg-[#fff0df] text-[#b8573f] dark:border-[#d85f43]/35 dark:bg-[#2a1815] dark:text-[#efb28f]';
}

function formatDate(value: string | null) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-US');
}

function isExpiringSoon(value: string | null) {
  if (!value) return false;
  const daysLeft = (new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysLeft >= 0 && daysLeft <= 14;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectsWorkspace({
  initialProjects,
  monitoredApis,
}: {
  initialProjects: ProjectsSummary;
  monitoredApis: MonitoringSummary;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [apisList, setApisList] = useState<MonitoredApiView[]>(monitoredApis.apis);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'projects' | 'monitored-apis'>('projects');

  // Wizard states
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<StepId>(1);
  const [wizard, setWizard] = useState<WizardState>(EMPTY_WIZARD);
  
  // Sub-flow states (used for both wizard connect API and standalone Add API)
  const [isAddingApi, setIsAddingApi] = useState(false);
  const [apiForm, setApiForm] = useState<ApiConnectForm>(defaultApiForm);
  const [apiConnectStep, setApiConnectStep] = useState<0 | 1 | 2 | 3>(0); // identify | auth | test | details
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isRegisteringApi, setIsRegisteringApi] = useState(false);
  
  // Temporary fields for the API currently being added
  const [usageDescription, setUsageDescription] = useState('');
  const [criticality, setCriticality] = useState<'low' | 'medium' | 'high'>('medium');
  const [subscriptionDate, setSubscriptionDate] = useState('');
  const [expiryAt, setExpiryAt] = useState('');

  // Standalone Add API states (adding to an existing project)
  const [activeAddApiProjectId, setActiveAddApiProjectId] = useState<string | null>(null);
  const [activeAddApiProjectName, setActiveAddApiProjectName] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingApiId, setDeletingApiId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const apiSlug = searchParams.get('apiSlug') || searchParams.get('slug');
  const newProjectParam = searchParams.get('newProject') || searchParams.get('new');

  // Trigger from URL query parameters
  useEffect(() => {
    if (apiSlug) {
      import('@/lib/apiMarketplaceData').then(({ getUnifiedApiBySlug }) => {
        const match = getUnifiedApiBySlug(apiSlug);
        if (match) {
          setApiForm((prev) => ({
            ...prev,
            name: match.catalog.product,
            slug: match.catalog.slug,
            baseUrl: match.detail.baseUrl,
            healthPath: '/health',
          }));
          setWizard((prev) => ({
            ...prev,
            projectName: `${match.catalog.provider} Integration`,
          }));
          setWizardStep(2);
          setApiConnectStep(0);
          setIsAddingApi(true);
          setWizardOpen(true);
        }
      });
    } else if (newProjectParam) {
      openWizard();
    }
  }, [apiSlug, newProjectParam]);

  function updateApiForm(patch: Partial<ApiConnectForm>) {
    setApiForm((prev) => ({ ...prev, ...patch }));
    setTestResult(null);
  }

  function openWizard() {
    setWizard(EMPTY_WIZARD);
    setApiForm(defaultApiForm());
    setApiConnectStep(0);
    setTestResult(null);
    setWizardStep(1);
    setIsAddingApi(false);
    setWizardOpen(true);
  }

  function closeWizard() {
    setWizardOpen(false);
  }

  function setField<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setWizard((prev) => ({ ...prev, [key]: value }));
  }

  // Can the wizard go to the next step?
  function canGoNext(): boolean {
    switch (wizardStep) {
      case 1:
        return wizard.projectName.trim().length > 0;
      case 2:
        return wizard.apis.length > 0 && !isAddingApi;
      case 3:
        return true;
    }
  }

  function handleNext() {
    if (wizardStep < 3) setWizardStep((s) => (s + 1) as StepId);
  }
  function handleBack() {
    if (wizardStep > 1) setWizardStep((s) => (s - 1) as StepId);
  }

  // ── Connect & Test: test the API endpoint ──────────────────────────────────
  async function handleTestConnection() {
    const canIdentify = Boolean(apiForm.name.trim() && apiForm.baseUrl.trim());
    const canAuth =
      apiForm.authMode === 'none' ||
      (apiForm.authMode === 'bearer' && Boolean(apiForm.authValue.trim())) ||
      (apiForm.authMode === 'api_key' && Boolean(apiForm.authHeaderName.trim() && apiForm.authValue.trim()));

    if (!canIdentify) {
      toast.error('Enter the API name and domain first.');
      setApiConnectStep(0);
      return;
    }
    if (!canAuth) {
      toast.error('Complete the auth setup, or choose No auth.');
      setApiConnectStep(1);
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/monitored-apis/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(buildApiPayload(apiForm)),
      });
      const payload = (await response.json()) as { error?: string; result?: ConnectionTestResult };
      if (!response.ok || !payload.result) throw new Error(payload.error ?? 'Unable to test connection.');
      setTestResult(payload.result);
      setApiConnectStep(3); // Go straight to Details & Dates
      if (payload.result.ok) toast.success('Connection test passed.');
      else if (payload.result.status === 'warning') toast.warning('Connection test completed with warnings.');
      else toast.error(payload.result.error ?? 'Connection test failed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to test connection.');
    } finally {
      setIsTesting(false);
    }
  }

  // ── Connect & Save API to the list ──────────────────────────────────────────
  async function handleRegisterAndAttach() {
    if (!testResult) {
      toast.error('Test the connection first.');
      return;
    }
    if (testResult.status === 'critical') {
      toast.error('Fix the connection failure before saving.');
      return;
    }

    // In direct inventory upload, details/usage description is optional
    const isInventoryUpload = activeTab === 'monitored-apis' && !wizardOpen;
    if (!isInventoryUpload && !usageDescription.trim()) {
      toast.error('Add a description of the API function.');
      return;
    }

    setIsRegisteringApi(true);
    try {
      const response = await fetch('/api/monitored-apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(buildApiPayload(apiForm)),
      });
      const payload = (await response.json()) as { error?: string; api?: { id: string; name: string } };
      if (!response.ok || !payload.api) throw new Error(payload.error ?? 'Unable to register API.');

      // Auto-run first monitoring check
      await fetch(`/api/monitored-apis/${payload.api.id}`, { method: 'POST', credentials: 'same-origin' });

      if (wizardOpen) {
        // Save to local wizard list
        const newItem: AttachedApiItem = {
          monitoredApiId: payload.api.id,
          apiName: payload.api.name,
          usageDescription: usageDescription,
          criticality: criticality,
          expiryAt: expiryAt || null,
        };

        setWizard((prev) => ({
          ...prev,
          apis: [...prev.apis, newItem],
        }));

        toast.success(`"${payload.api.name}" attached to project.`);
      } else {
        // Direct upload to monitored inventory from tab
        toast.success(`"${payload.api.name}" registered successfully.`);
        const res = await fetch('/api/monitored-apis', { cache: 'no-store', credentials: 'same-origin' });
        const summary = (await res.json()) as MonitoringSummary;
        setApisList(summary.apis);
      }
      
      // Clean temporary states
      setApiForm(defaultApiForm());
      setTestResult(null);
      setApiConnectStep(0);
      setUsageDescription('');
      setCriticality('medium');
      setSubscriptionDate('');
      setExpiryAt('');
      setIsAddingApi(false);
      setWizardOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to register API.');
    } finally {
      setIsRegisteringApi(false);
    }
  }

  // ── Standalone Add API: register & attach to an existing project ───────────
  async function handleAttachToExistingProject() {
    if (!testResult) {
      toast.error('Test the connection first.');
      return;
    }
    if (testResult.status === 'critical') {
      toast.error('Fix the connection failure before saving.');
      return;
    }
    if (!usageDescription.trim()) {
      toast.error('Add a description of the API function.');
      return;
    }

    setIsRegisteringApi(true);
    try {
      // 1. Register API
      const registerRes = await fetch('/api/monitored-apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(buildApiPayload(apiForm)),
      });
      const registerPayload = (await registerRes.json()) as { error?: string; api?: { id: string; name: string } };
      if (!registerRes.ok || !registerPayload.api) throw new Error(registerPayload.error ?? 'Unable to register API.');

      // Auto-run first monitoring check
      await fetch(`/api/monitored-apis/${registerPayload.api.id}`, { method: 'POST', credentials: 'same-origin' });

      // 2. Attach to existing project
      const attachRes = await fetch(`/api/projects/${activeAddApiProjectId}/apis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          monitoredApiId: registerPayload.api.id,
          apiName: registerPayload.api.name,
          apiSlug: null,
          usageDescription: usageDescription,
          criticality: criticality,
          expiryAt: expiryAt || null,
        }),
      });
      const attachPayload = (await attachRes.json()) as { error?: string };
      if (!attachRes.ok) throw new Error(attachPayload.error ?? 'Unable to attach API to project.');

      await refreshProjects();
      router.refresh();
      toast.success(`"${registerPayload.api.name}" attached successfully to "${activeAddApiProjectName}".`);
      
      // Reset standalone add states
      setActiveAddApiProjectId(null);
      setApiForm(defaultApiForm());
      setTestResult(null);
      setApiConnectStep(0);
      setUsageDescription('');
      setCriticality('medium');
      setSubscriptionDate('');
      setExpiryAt('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to attach API.');
    } finally {
      setIsRegisteringApi(false);
    }
  }

  // ── Save project ──────────────────────────────────────────────────────────
  async function refreshProjects() {
    const response = await fetch('/api/projects', { cache: 'no-store', credentials: 'same-origin' });
    const payload = (await response.json()) as ProjectsSummary & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? 'Unable to load projects.');
    setProjects(payload);
    return payload;
  }

  async function handleSaveProject() {
    setIsSaving(true);
    try {
      // Create project
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name: wizard.projectName, description: wizard.projectDescription }),
      });
      const projectPayload = (await projectResponse.json()) as { error?: string; project?: { id: string; name: string } };
      if (!projectResponse.ok || !projectPayload.project)
        throw new Error(projectPayload.error ?? 'Unable to create project.');

      // Attach all APIs
      for (const apiItem of wizard.apis) {
        await fetch(`/api/projects/${projectPayload.project.id}/apis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(apiItem),
        });
      }

      await refreshProjects();
      router.refresh();
      toast.success(`"${projectPayload.project.name}" project created with ${wizard.apis.length} APIs.`);
      closeWizard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create project.');
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete API from project ───────────────────────────────────────────────
  async function handleDeleteApi(projectId: string, projectApiId: string) {
    setDeletingId(projectApiId);
    try {
      const response = await fetch(`/api/projects/${projectId}/apis/${projectApiId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to remove API.');
      await refreshProjects();
      router.refresh();
      toast.success(payload.message ?? 'API removed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to remove API.');
    } finally {
      setDeletingId(null);
    }
  }

  // ── Delete API permanently from monitored-apis inventory ────────────────
  async function handleDeleteMonitoredApi(apiId: string) {
    const api = apisList.find((a) => a.id === apiId);
    if (!api) return;

    if (
      !confirm(
        `Are you sure you want to permanently delete "${api.name}" from your monitored inventory? This will also remove it from any projects using it.`
      )
    ) {
      return;
    }

    setDeletingApiId(apiId);
    try {
      const response = await fetch(`/api/monitored-apis/${apiId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to delete API.');

      setApisList((prev) => prev.filter((a) => a.id !== apiId));
      await refreshProjects();
      router.refresh();
      toast.success(payload.message ?? 'API permanently deleted from workspace.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete API.');
    } finally {
      setDeletingApiId(null);
    }
  }

  if (projects.schemaMissing) {
    return (
      <div className="rounded-[28px] border border-[#5b2d1f] bg-[#2a1711] p-6 text-[#ffd3ba]">
        Project tables are not in Supabase yet. Run{' '}
        <span className="font-mono">supabase/migrations/20260529_workspace_projects.sql</span> before using project
        workspaces.
      </div>
    );
  }

  return (
    <>
      {/* ── Wizard modal ─────────────────────────────────────────────────── */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeWizard} />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[36px] border border-stone-300/70 bg-[#fff8ef]/96 shadow-[0_40px_80px_rgba(80,50,30,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c1620]/97 dark:shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            {/* Close */}
            <button
              type="button"
              onClick={closeWizard}
              className="absolute right-5 top-5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-500 transition hover:border-stone-900 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-white"
            >
              <X size={15} />
            </button>

            {/* Step progress */}
            <div className="border-b border-stone-300/70 px-8 py-6 dark:border-white/8">
              <div className="flex items-center gap-1">
                {STEPS.map((step, index) => {
                  const isCompleted = wizardStep > step.id;
                  const isActive = wizardStep === step.id;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-1 items-center gap-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                            isCompleted
                              ? 'border-[#d85f43] bg-[#d85f43] text-white'
                              : isActive
                                ? 'border-[#d85f43] bg-[#fff0e8] text-[#d85f43] dark:bg-[#2a1815] dark:text-[#efb28f]'
                                : 'border-stone-300/70 bg-white/60 text-stone-400 dark:border-white/10 dark:bg-white/5 dark:text-stone-500'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            isActive
                              ? 'text-[#d85f43] dark:text-[#efb28f]'
                              : isCompleted
                                ? 'text-stone-700 dark:text-stone-300'
                                : 'text-stone-400 dark:text-stone-600'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`mb-4 h-px flex-1 transition-all duration-500 ${
                            wizardStep > step.id ? 'bg-[#d85f43]' : 'bg-stone-300/70 dark:bg-white/10'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="max-h-[60vh] overflow-y-auto px-8 py-7">
              {wizardStep === 1 && <Step1ProjectName wizard={wizard} setField={setField} />}
              
              {wizardStep === 2 && (
                isAddingApi ? (
                  <Step2ConnectApi
                    apiForm={apiForm}
                    apiConnectStep={apiConnectStep}
                    setApiConnectStep={setApiConnectStep}
                    testResult={testResult}
                    isTesting={isTesting}
                    isRegisteringApi={isRegisteringApi}
                    updateApiForm={updateApiForm}
                    onTest={handleTestConnection}
                    onRegisterAndContinue={handleRegisterAndAttach}
                    onCancel={() => setIsAddingApi(false)}
                    usageDescription={usageDescription}
                    setUsageDescription={setUsageDescription}
                    criticality={criticality}
                    setCriticality={setCriticality}
                    subscriptionDate={subscriptionDate}
                    setSubscriptionDate={setSubscriptionDate}
                    expiryAt={expiryAt}
                    setExpiryAt={setExpiryAt}
                  />
                ) : (
                  <Step2AttachedApisList
                    apis={wizard.apis}
                    onStartAdd={() => {
                      setApiForm(defaultApiForm());
                      setTestResult(null);
                      setApiConnectStep(0);
                      setIsAddingApi(true);
                    }}
                    onRemove={(index) => {
                      const updated = [...wizard.apis];
                      updated.splice(index, 1);
                      setField('apis', updated);
                    }}
                  />
                )
              )}
              
              {wizardStep === 3 && <Step3Review wizard={wizard} />}
            </div>

            {/* Footer — hide default nav when adding/connecting an API since it has its own CTAs */}
            {!isAddingApi && (
              <div className="flex items-center justify-between border-t border-stone-300/70 px-8 py-5 dark:border-white/8">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={wizardStep === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>

                <span className="text-xs font-semibold text-stone-400 dark:text-stone-600">
                  Step {wizardStep} of {STEPS.length}
                </span>

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNext()}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Rocket size={15} />}
                    {isSaving ? 'Saving...' : 'Save & Launch'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Standalone Add API Modal (Existing Project) ──────────────────── */}
      {activeAddApiProjectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveAddApiProjectId(null)} />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[36px] border border-stone-300/70 bg-[#fff8ef]/96 shadow-[0_40px_80px_rgba(80,50,30,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c1620]/97 dark:shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            {/* Close */}
            <button
              type="button"
              onClick={() => setActiveAddApiProjectId(null)}
              className="absolute right-5 top-5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-500 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-white"
            >
              <X size={15} />
            </button>

            <div className="max-h-[80vh] overflow-y-auto px-8 py-8">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d85f43] dark:text-[#efb28f]">
                  Add API to Project
                </p>
                <h2 className="mt-1 font-display text-3xl text-stone-950 dark:text-stone-50">
                  Connect to "{activeAddApiProjectName}"
                </h2>
              </div>

              <Step2ConnectApi
                apiForm={apiForm}
                apiConnectStep={apiConnectStep}
                setApiConnectStep={setApiConnectStep}
                testResult={testResult}
                isTesting={isTesting}
                isRegisteringApi={isRegisteringApi}
                updateApiForm={updateApiForm}
                onTest={handleTestConnection}
                onRegisterAndContinue={handleAttachToExistingProject}
                onCancel={() => setActiveAddApiProjectId(null)}
                usageDescription={usageDescription}
                setUsageDescription={setUsageDescription}
                criticality={criticality}
                setCriticality={setCriticality}
                subscriptionDate={subscriptionDate}
                setSubscriptionDate={setSubscriptionDate}
                expiryAt={expiryAt}
                setExpiryAt={setExpiryAt}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Page body ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Metrics */}
        <section className="grid gap-4 md:grid-cols-5">
          <Metric label="Projects" value={projects.metrics.totalProjects} />
          <Metric label="Project APIs" value={projects.metrics.totalApis} />
          <Metric label="Critical" value={projects.metrics.criticalApis} />
          <Metric label="Expiring soon" value={projects.metrics.expiringSoon} />
          <Metric label="Vulnerable" value={projects.metrics.vulnerableApis} />
        </section>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-300/70 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === 'projects'
                ? 'border-[#d85f43] text-[#d85f43]'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Project Workspaces
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monitored-apis')}
            className={`px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === 'monitored-apis'
                ? 'border-[#d85f43] text-[#d85f43]'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            API Inventory ({apisList.length})
          </button>
        </div>

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-stone-950 dark:text-stone-55">Your projects</h2>
              <button
                type="button"
                id="create-project-btn"
                onClick={openWizard}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(216,95,67,0.35)] transition hover:shadow-[0_12px_32px_rgba(216,95,67,0.5)] active:scale-95"
              >
                <Plus size={15} />
                New project
              </button>
            </div>

            {projects.projects.length === 0 ? (
              <div className="flex flex-col items-center rounded-[32px] border border-dashed border-stone-300/70 bg-white/60 px-8 py-16 text-center dark:border-white/10 dark:bg-white/5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0e8] dark:bg-[#2a1815]">
                  <FolderKanban size={28} className="text-[#d85f43]" />
                </div>
                <p className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">No projects yet</p>
                <p className="mt-3 max-w-sm text-sm leading-7 text-stone-600 dark:text-stone-400">
                  Create a project to group the APIs your app relies on, then monitor their health, expiry, and
                  vulnerabilities from one place.
                </p>
                <button
                  type="button"
                  onClick={openWizard}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(216,95,67,0.35)] transition hover:shadow-[0_12px_32px_rgba(216,95,67,0.5)]"
                >
                  <Plus size={15} />
                  Create your first project
                </button>
              </div>
            ) : (
              projects.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  deletingId={deletingId}
                  onDeleteApi={handleDeleteApi}
                  onAddApi={(projectId, name) => {
                    setApiForm(defaultApiForm());
                    setTestResult(null);
                    setApiConnectStep(0);
                    setUsageDescription('');
                    setCriticality('medium');
                    setSubscriptionDate('');
                    setExpiryAt('');
                    setActiveAddApiProjectId(projectId);
                    setActiveAddApiProjectName(name);
                  }}
                />
              ))
            )}
          </section>
        )}

        {/* API INVENTORY TAB */}
        {activeTab === 'monitored-apis' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-stone-950 dark:text-stone-50">API Inventory</h2>
              <button
                type="button"
                onClick={() => {
                  setApiForm(defaultApiForm());
                  setTestResult(null);
                  setApiConnectStep(0);
                  setUsageDescription('');
                  setCriticality('medium');
                  setSubscriptionDate('');
                  setExpiryAt('');
                  setIsAddingApi(true);
                  setWizardStep(2); // open sub-flow
                  setWizardOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(216,95,67,0.35)] transition hover:shadow-[0_12px_32px_rgba(216,95,67,0.5)] active:scale-95"
              >
                <Plus size={15} />
                Register new API
              </button>
            </div>

            {apisList.length === 0 ? (
              <div className="flex flex-col items-center rounded-[32px] border border-dashed border-stone-300/70 bg-white/60 px-8 py-16 text-center dark:border-white/10 dark:bg-white/5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0e8] dark:bg-[#2a1815]">
                  <Zap size={28} className="text-[#d85f43]" />
                </div>
                <p className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">No APIs registered yet</p>
                <p className="mt-3 max-w-sm text-sm leading-7 text-stone-600 dark:text-stone-400">
                  Register an API you control to start tracking latency, uptime, security signals, and credential expiry.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {apisList.map((api) => (
                  <article key={api.id} className="rounded-[26px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5 transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">{api.slug}</p>
                        <h3 className="mt-3 break-words font-display text-3xl text-stone-950 dark:text-stone-55">{api.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass(api.latestStatus)}`}>
                          {api.latestStatus}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMonitoredApi(api.id)}
                          disabled={deletingApiId === api.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-500 hover:border-red-400 hover:text-red-500 transition disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:border-red-550/20"
                        >
                          {deletingApiId === api.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                      {api.baseUrl}{api.healthPath}
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Environment</p>
                        <p className="mt-2 break-words text-sm font-semibold text-stone-900 dark:text-stone-100">{api.environment === 'live' ? 'Live' : 'Sandbox'}</p>
                      </div>
                      <div className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Latency</p>
                        <p className="mt-2 break-words text-sm font-semibold text-stone-900 dark:text-stone-100">{typeof api.lastLatencyMs === 'number' ? `${api.lastLatencyMs} ms` : 'Pending'}</p>
                      </div>
                      <div className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Expiry</p>
                        <p className="mt-2 break-words text-sm font-semibold text-stone-900 dark:text-stone-100">{api.expiryAt ? new Date(api.expiryAt).toLocaleDateString('en-US') : 'Not set'}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

// ─── Wizard step components ───────────────────────────────────────────────────

function StepHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ef7d52,#d85f43)]">
        <Icon size={20} className="text-white" />
      </div>
      <p className="eyebrow text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-display text-3xl text-stone-950 dark:text-stone-55">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{subtitle}</p>
    </div>
  );
}

function Step1ProjectName({
  wizard,
  setField,
}: {
  wizard: WizardState;
  setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeader
        icon={FolderKanban}
        eyebrow="Step 1 of 3"
        title="Name your project"
        subtitle="Give this project a clear name so your team instantly knows what it represents."
      />
      <div className="relative">
        <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
        <input
          id="wizard-project-name"
          value={wizard.projectName}
          onChange={(e) => setField('projectName', e.target.value)}
          className={`${inputClass} pl-11`}
          placeholder="e.g. Payment Gateway, Auth Service..."
          autoFocus
        />
      </div>
      <textarea
        id="wizard-project-description"
        value={wizard.projectDescription}
        onChange={(e) => setField('projectDescription', e.target.value)}
        className={`${inputClass} min-h-[90px] resize-none`}
        placeholder="Brief description of what this project does (optional)"
      />
    </div>
  );
}

// ── Step 2: Attached APIs List ───────────────────────────────────────────────

function Step2AttachedApisList({
  apis,
  onStartAdd,
  onRemove,
}: {
  apis: AttachedApiItem[];
  onStartAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeader
        icon={Zap}
        eyebrow="Step 2 of 3"
        title="APIs in this project"
        subtitle="Attach the APIs this product relies on. You can add multiple APIs, each with its own role and dates."
      />

      {apis.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-stone-300/70 bg-white/50 py-12 text-center dark:border-white/10 dark:bg-white/5">
          <Zap size={28} className="text-stone-400 dark:text-stone-500" />
          <p className="mt-4 font-display text-2xl text-stone-950 dark:text-stone-50">No APIs attached yet</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600 dark:text-stone-400">
            Attach at least one API to monitor. You can attach multiple APIs to cover all the functions of your project.
          </p>
          <button
            type="button"
            onClick={onStartAdd}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95"
          >
            <Plus size={13} />
            Attach first API
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Attached APIs ({apis.length})
          </p>
          <div className="divide-y divide-stone-300/70 overflow-hidden rounded-[24px] border border-stone-300/70 bg-white/60 dark:divide-white/8 dark:border-white/10 dark:bg-white/5">
            {apis.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-4 transition hover:bg-stone-50/50 dark:hover:bg-white/2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{item.apiName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${statusClass(item.criticality)}`}>
                      {item.criticality}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-stone-600 dark:text-stone-400">{item.usageDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-950 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onStartAdd}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-stone-900 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20 dark:hover:text-white"
          >
            <Plus size={13} />
            Attach another API
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step 2 sub-flow: Connect & Test API ──────────────────────────────────────

function Step2ConnectApi({
  apiForm,
  apiConnectStep,
  setApiConnectStep,
  testResult,
  isTesting,
  isRegisteringApi,
  updateApiForm,
  onTest,
  onRegisterAndContinue,
  onCancel,
  usageDescription,
  setUsageDescription,
  criticality,
  setCriticality,
  subscriptionDate,
  setSubscriptionDate,
  expiryAt,
  setExpiryAt,
}: {
  apiForm: ApiConnectForm;
  apiConnectStep: 0 | 1 | 2 | 3;
  setApiConnectStep: (s: 0 | 1 | 2 | 3) => void;
  testResult: ConnectionTestResult | null;
  isTesting: boolean;
  isRegisteringApi: boolean;
  updateApiForm: (patch: Partial<ApiConnectForm>) => void;
  onTest: () => void;
  onRegisterAndContinue: () => void;
  onCancel: () => void;
  usageDescription: string;
  setUsageDescription: (v: string) => void;
  criticality: 'low' | 'medium' | 'high';
  setCriticality: (v: 'low' | 'medium' | 'high') => void;
  subscriptionDate: string;
  setSubscriptionDate: (v: string) => void;
  expiryAt: string;
  setExpiryAt: (v: string) => void;
}) {
  const subSteps = [
    { label: 'Identify', help: 'Name & domain' },
    { label: 'Authorize', help: 'Key or token' },
    { label: 'Test', help: 'Verify connection' },
    { label: 'Details', help: 'Use & dates' },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-step tabs */}
      <div className="grid grid-cols-4 gap-1.5">
        {subSteps.map((s, i) => {
          const isCurrent = apiConnectStep === i;
          const isDone = apiConnectStep > i;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                // Prevent jumping directly to details/test without identification
                if (i > 0 && (!apiForm.name.trim() || !apiForm.baseUrl.trim())) return;
                setApiConnectStep(i as 0 | 1 | 2 | 3);
              }}
              className={`rounded-xl border p-2.5 text-left transition ${
                isCurrent
                  ? 'border-[#d85f43]/60 bg-[#fff0df] dark:border-[#ef7d52]/35 dark:bg-[#2a1815]'
                  : isDone
                    ? 'border-[#2b8a7d]/40 bg-[#e7f3ef]/50 dark:border-[#2b8a7d]/20 dark:bg-[#10231f]/20'
                    : 'border-stone-300/70 bg-white/55 hover:border-stone-400 dark:border-white/10 dark:bg-white/5'
              }`}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Step {i + 1}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-stone-900 dark:text-stone-100">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Sub-step 0: Identify */}
      {apiConnectStep === 0 && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">API name</span>
              <input
                value={apiForm.name}
                onChange={(e) => {
                  const v = e.target.value;
                  updateApiForm({
                    name: v,
                    slug: v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  });
                }}
                className={inputClass}
                placeholder="Stripe Payments / Sarvam AI..."
                autoFocus
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">API domain</span>
              <input
                value={apiForm.baseUrl}
                onChange={(e) => updateApiForm({ baseUrl: e.target.value })}
                className={inputClass}
                placeholder="https://api.stripe.com"
              />
            </label>
          </div>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">Health path</span>
            <input
              value={apiForm.healthPath}
              onChange={(e) => updateApiForm({ healthPath: e.target.value })}
              className={inputClass}
              placeholder="/health"
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setApiConnectStep(1)}
              disabled={!apiForm.name.trim() || !apiForm.baseUrl.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next: Authorize
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Sub-step 1: Auth */}
      {apiConnectStep === 1 && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">Auth mode</span>
              <select
                value={apiForm.authMode}
                onChange={(e) => updateApiForm({ authMode: e.target.value as MonitoringAuthMode })}
                className={selectClass}
              >
                <option value="none">No auth</option>
                <option value="bearer">Bearer token</option>
                <option value="api_key">API key header</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">Environment</span>
              <select
                value={apiForm.environment}
                onChange={(e) => updateApiForm({ environment: e.target.value as MonitoredApiEnvironment })}
                className={selectClass}
              >
                <option value="live">Live</option>
                <option value="sandbox">Sandbox / test</option>
              </select>
            </label>
          </div>

          {apiForm.authMode !== 'none' ? (
            <div className="grid gap-3 md:grid-cols-2">
              {apiForm.authMode === 'api_key' && (
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">Header name</span>
                  <input
                    value={apiForm.authHeaderName}
                    onChange={(e) => updateApiForm({ authHeaderName: e.target.value })}
                    className={inputClass}
                    placeholder="x-api-key"
                  />
                </label>
              )}
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">
                  {apiForm.authMode === 'bearer' ? 'Bearer token' : 'API key'}
                </span>
                <input
                  type="password"
                  value={apiForm.authValue}
                  onChange={(e) => updateApiForm({ authValue: e.target.value })}
                  className={inputClass}
                  placeholder="Paste from your provider dashboard"
                />
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
              <KeyRound size={16} className="text-[#d68d2e]" />
              <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">No auth — public monitoring only</p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Choose this only if the health endpoint is intentionally public.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApiConnectStep(0)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={() => setApiConnectStep(2)}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Next: Test
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Sub-step 2: Test */}
      {apiConnectStep === 2 && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
            <ListChecks size={16} className="text-[#2b8a7d]" />
            <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">Test before saving</p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              APIverse will send one safe GET to{' '}
              <span className="font-mono text-stone-700 dark:text-stone-300">
                {apiForm.baseUrl || 'your-domain'}{apiForm.healthPath || '/health'}
              </span>
            </p>
          </div>

          {/* Test result card */}
          {testResult ? (
            <ConnectionTestResultCard result={testResult} onUseSuggestedPath={(p) => updateApiForm({ healthPath: p })} />
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300/70 bg-white/50 p-4 text-sm text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              Hit "Test connection" to verify reachability, status code, and latency.
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApiConnectStep(1)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={onTest}
              disabled={isTesting}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-900 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
            >
              {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              {isTesting ? 'Testing...' : 'Test connection'}
            </button>
            {testResult && testResult.status !== 'critical' && (
              <button
                type="button"
                onClick={() => setApiConnectStep(3)}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Next: Details
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-step 3: Details & Dates */}
      {apiConnectStep === 3 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
              API Role & Function
            </label>
            <textarea
              value={usageDescription}
              onChange={(e) => setUsageDescription(e.target.value)}
              className={`${inputClass} min-h-[90px] resize-none`}
              placeholder="Explain exactly what this API does (e.g. Handles payment verification and card refunds)..."
              autoFocus
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Subscription start date
              </label>
              <input type="date" value={subscriptionDate} onChange={(e) => setSubscriptionDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Expiry date
              </label>
              <input type="date" value={expiryAt} onChange={(e) => setExpiryAt(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Criticality</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCriticality(level)}
                  className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold capitalize transition ${
                    criticality === level
                      ? level === 'high'
                        ? 'border-[#d85f43] bg-[#fff0e8] text-[#d85f43] dark:bg-[#2a1815] dark:text-[#efb28f]'
                        : level === 'medium'
                          ? 'border-[#d68d2e] bg-[#f7f0dc] text-[#8b6712] dark:bg-[#231d10] dark:text-[#ecc56a]'
                          : 'border-[#2b8a7d] bg-[#e7f3ef] text-[#23695d] dark:bg-[#10231f] dark:text-[#82d2c7]'
                      : 'border-stone-300/70 bg-white/60 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApiConnectStep(2)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={onRegisterAndContinue}
              disabled={isRegisteringApi || !usageDescription.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRegisteringApi ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {isRegisteringApi ? 'Attaching...' : 'Attach API'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionTestResultCard({
  result,
  onUseSuggestedPath,
}: {
  result: ConnectionTestResult;
  onUseSuggestedPath: (path: string) => void;
}) {
  const Icon = result.status === 'healthy' ? CheckCircle2 : result.status === 'warning' ? AlertTriangle : XCircle;
  return (
    <div className={`rounded-2xl border p-4 ${testStatusClasses(result.status)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <p className="text-sm font-semibold">
            {result.status === 'healthy' ? 'Connection works' : result.status === 'warning' ? 'Needs review' : 'Failed'}
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded-full bg-black/10 px-2.5 py-1 dark:bg-white/10">HTTP {result.statusCode ?? '--'}</span>
          <span className="rounded-full bg-black/10 px-2.5 py-1 dark:bg-white/10">
            {typeof result.latencyMs === 'number' ? `${result.latencyMs} ms` : '--'}
          </span>
        </div>
      </div>
      {result.findings.map((f) => <p key={f} className="mt-2 text-sm opacity-85">{f}</p>)}
      {result.suggestedHealthPath && (
        <button
          type="button"
          onClick={() => onUseSuggestedPath(result.suggestedHealthPath!)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 text-xs font-semibold dark:bg-white/10"
        >
          Use suggested path {result.suggestedHealthPath}
          <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

function Step3Review({ wizard }: { wizard: WizardState }) {
  return (
    <div className="space-y-5">
      <StepHeader
        icon={Rocket}
        eyebrow="Step 3 of 3"
        title="Review & launch"
        subtitle="Double-check your project settings and attached APIs before deploying."
      />
      
      <div className="space-y-3.5">
        <div className="rounded-2xl border border-stone-300/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">
            Project name
          </p>
          <p className="mt-1 font-display text-2xl text-stone-950 dark:text-stone-55">{wizard.projectName}</p>
          
          {wizard.projectDescription && (
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{wizard.projectDescription}</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">
            Attached APIs ({wizard.apis.length})
          </p>
          
          <div className="space-y-2">
            {wizard.apis.map((api, idx) => (
              <div key={idx} className="rounded-2xl border border-stone-300/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-950 dark:text-stone-100">{api.apiName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${statusClass(api.criticality)}`}>
                    {api.criticality}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">{api.usageDescription}</p>
                {api.expiryAt && (
                  <p className="mt-2 text-[10px] text-stone-400 dark:text-stone-500">
                    Expires: {formatDate(api.expiryAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[26px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
      <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-4 font-display text-4xl text-stone-950 dark:text-stone-55">{value}</p>
    </article>
  );
}

function ProjectCard({
  project,
  deletingId,
  onDeleteApi,
  onAddApi,
}: {
  project: WorkspaceProjectView;
  deletingId: string | null;
  onDeleteApi: (projectId: string, projectApiId: string) => void;
  onAddApi: (projectId: string, projectName: string) => void;
}) {
  const alerts = project.apis.filter(
    (api) => api.latestStatus === 'critical' || api.vulnerabilityStatus === 'critical' || isExpiringSoon(api.expiryAt),
  );
  return (
    <article className="editorial-card rounded-[32px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Project</p>
          <h3 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-55">{project.name}</h3>
          {project.description ? <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{project.description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddApi(project.id, project.name)}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
          >
            <Plus size={13} />
            Add API
          </button>
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${alerts.length ? statusClass('warning') : statusClass('healthy')}`}>
            {alerts.length ? `${alerts.length} alert${alerts.length === 1 ? '' : 's'}` : 'clear'}
          </span>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-5 rounded-[22px] border border-[#f2c4b5] bg-[#fff4ee] p-4 text-sm leading-7 text-[#9d4d37] dark:border-[#4a2d24] dark:bg-[#201512] dark:text-[#efb28f]">
          <div className="flex items-center gap-2 font-semibold"><Bell size={15} /> Attention needed</div>
          <p className="mt-1">Review APIs with critical status, vulnerability warnings, or credentials expiring within 14 days.</p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {project.apis.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-stone-300/70 bg-white/55 p-5 text-sm text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
            No APIs attached yet. Click "Add API" to attach your first API!
          </div>
        ) : (
          project.apis.map((api) => (
            <div key={api.id} className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">{api.apiName}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{api.usageDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteApi(project.id, api.id)}
                  disabled={deletingId === api.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#f2c4b5] bg-[#fff4ee] px-3 py-2 text-xs font-semibold text-[#b8573f] transition hover:border-[#d85f43] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#4a2d24] dark:bg-[#201512] dark:text-[#efb28f]"
                >
                  {deletingId === api.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Remove
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <StatusTile label="Status" value={api.latestStatus} status={api.latestStatus} icon="status" />
                <StatusTile label="Criticality" value={api.criticality} status={api.criticality} icon="criticality" />
                <StatusTile label="Latency" value={typeof api.lastLatencyMs === 'number' ? `${api.lastLatencyMs} ms` : 'Pending'} status="healthy" icon="status" />
                <StatusTile label="Expiry" value={formatDate(api.expiryAt)} status={isExpiringSoon(api.expiryAt) ? 'warning' : 'healthy'} icon="expiry" />
              </div>
              <div className="mt-4 rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={15} className={api.vulnerabilityStatus === 'critical' ? 'text-[#d85f43]' : api.vulnerabilityStatus === 'warning' ? 'text-[#d68d2e]' : 'text-[#2b8a7d]'} />
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Vulnerability: {api.vulnerabilityStatus}</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{api.vulnerabilitySummary ?? 'No findings yet.'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function StatusTile({ label, value, status, icon }: { label: string; value: string; status: string; icon: 'status' | 'criticality' | 'expiry' }) {
  const Icon = status === 'critical' || status === 'high' || status === 'warning' ? AlertTriangle : CheckCircle2;
  return (
    <div className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-3 dark:border-white/8 dark:bg-black/10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Icon size={14} className={icon === 'expiry' && status === 'warning' ? 'text-[#d68d2e]' : status === 'critical' || status === 'high' ? 'text-[#d85f43]' : 'text-[#2b8a7d]'} />
        <p className="break-words text-sm font-semibold text-stone-900 dark:text-stone-100">{value}</p>
      </div>
    </div>
  );
}
