import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { testMonitoredApiConnection } from '@/lib/api-monitoring/service';
import type {
  CreateMonitoredApiInput,
  MonitoringAuthMode,
  MonitoredApiEnvironment,
} from '@/lib/api-monitoring/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function toEnvironment(value: unknown): MonitoredApiEnvironment {
  return value === 'sandbox' ? 'sandbox' : 'live';
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
    ownershipConfirmed: true,
    monitoringConsent: true,
    securityScanEnabled: payload.securityScanEnabled !== false,
  };

  try {
    const result = await testMonitoredApiConnection(input);
    return NextResponse.json({
      result,
      message: result.ok
        ? 'Connection test passed.'
        : 'Connection test completed with warnings.',
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to test API connection.',
    }, { status: 400 });
  }
}
