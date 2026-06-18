import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createProviderConnection,
  getConnectionsSummary,
  getConnectableProviders,
} from '@/lib/provider-connections/service';
import type { CreateConnectionInput, ProviderEnvironment } from '@/lib/provider-connections/types';

function toEnvironment(value: unknown): ProviderEnvironment {
  return value === 'live' ? 'live' : 'sandbox';
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await getConnectionsSummary(supabase, user.id);

  return NextResponse.json({
    schemaMissing: summary.schemaMissing,
    metrics: summary.metrics,
    connections: summary.connections,
    providers: getConnectableProviders(),
  });
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

  const input: CreateConnectionInput = {
    providerId: typeof payload.providerId === 'string' ? payload.providerId : '',
    apiSlug: typeof payload.apiSlug === 'string' ? payload.apiSlug : undefined,
    displayName:
      typeof payload.displayName === 'string' && payload.displayName.trim()
        ? payload.displayName.trim()
        : '',
    environment: toEnvironment(payload.environment),
    baseUrl: typeof payload.baseUrl === 'string' && payload.baseUrl.trim() ? payload.baseUrl.trim() : undefined,
    credentials:
      payload.credentials && typeof payload.credentials === 'object'
        ? Object.fromEntries(
            Object.entries(payload.credentials as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '')]),
          )
        : {},
  };

  if (!input.providerId || !input.displayName) {
    return NextResponse.json({ error: 'providerId and displayName are required.' }, { status: 400 });
  }

  try {
    const { connection, provider } = await createProviderConnection(supabase, user.id, input);

    return NextResponse.json({
      connection,
      provider,
      message: `Connected ${provider.label} in ${input.environment} mode.`,
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Unable to create the provider connection.';
    const message =
      rawMessage.includes('relation') || rawMessage.includes('does not exist') || rawMessage.includes('Could not find the table')
        ? 'The provider connection tables are not in Supabase yet. Run the SQL migration first.'
        : rawMessage;
    const status =
      message.includes('PROVIDER_CREDENTIALS_SECRET') || message.includes('tables are not in Supabase')
        ? 500
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
