import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  createMonitoredApi,
  getMonitoringSummary,
  isSchemaMissingError,
} from '@/lib/api-monitoring/service';
import type { CreateMonitoredApiInput, MonitoringAuthMode, MonitoredApiEnvironment } from '@/lib/api-monitoring/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function toEnvironment(value: unknown): MonitoredApiEnvironment {
  return value === 'live' ? 'live' : 'sandbox';
}

function toAuthMode(value: unknown): MonitoringAuthMode {
  if (value === 'bearer' || value === 'api_key') return value;
  return 'none';
}

function toNullableNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await getMonitoringSummary(supabase, user.id);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[monitored-apis GET Error]', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const input: CreateMonitoredApiInput = {
    name: typeof payload.name === 'string' ? payload.name : '',
    slug: typeof payload.slug === 'string' ? payload.slug : '',
    baseUrl: typeof payload.baseUrl === 'string' ? payload.baseUrl : '',
    healthPath: typeof payload.healthPath === 'string' && payload.healthPath.trim() ? payload.healthPath : '/health',
    docsUrl: typeof payload.docsUrl === 'string' ? payload.docsUrl : null,
    environment: toEnvironment(payload.environment),
    authMode: toAuthMode(payload.authMode),
    authHeaderName: typeof payload.authHeaderName === 'string' ? payload.authHeaderName : null,
    authValue: typeof payload.authValue === 'string' ? payload.authValue : null,
    quotaLimit: toNullableNumber(payload.quotaLimit),
    quotaRemainingHeader: typeof payload.quotaRemainingHeader === 'string' ? payload.quotaRemainingHeader : null,
    quotaLimitHeader: typeof payload.quotaLimitHeader === 'string' ? payload.quotaLimitHeader : null,
    quotaResetHeader: typeof payload.quotaResetHeader === 'string' ? payload.quotaResetHeader : null,
    expiryAt: typeof payload.expiryAt === 'string' ? payload.expiryAt : null,
    alertEmail: typeof payload.alertEmail === 'string' ? payload.alertEmail : null,
    ownershipConfirmed: payload.ownershipConfirmed !== false,
    monitoringConsent: payload.monitoringConsent !== false,
    securityScanEnabled: payload.securityScanEnabled !== false,
  };

  try {
    const writeClient = createAdminClient();
    const api = await createMonitoredApi(writeClient, user.id, input);
    return NextResponse.json({
      api,
      message: `${api.name} is now registered for monitoring.`,
    });
  } catch (error) {
    const typedError = error as { code?: string; message?: string };
    console.error('monitored-api-registration-failed', {
      userId: user.id,
      name: input.name,
      slug: input.slug,
      baseUrl: input.baseUrl,
      code: typedError?.code,
      message: typedError?.message,
    });
    const status = isSchemaMissingError(typedError)
      ? 500
      : typedError?.code === '23505'
        ? 409
        : 400;
    const message = error instanceof Error
      ? error.message
      : typedError?.message || 'Unable to register API.';
    return NextResponse.json({
      error: status === 500
        ? 'The monitored API tables are not in Supabase yet. Run the SQL migration first.'
        : status === 409
          ? 'An API with this name/slug already exists in your workspace. Change the API name or open Advanced options and set a different slug.'
        : message,
    }, { status });
  }
}
