import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getApiKeyCatalogOptions,
  getWorkspaceAnalyticsSummary,
  issueWorkspaceApiKey,
  isSchemaMissingError,
} from '@/lib/apiverse-keys/service';
import type { CreateWorkspaceApiKeyInput, WorkspaceKeyEnvironment } from '@/lib/apiverse-keys/types';

function toEnvironment(value: unknown): WorkspaceKeyEnvironment {
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

  const summary = await getWorkspaceAnalyticsSummary(supabase, user.id);

  return NextResponse.json({
    ...summary,
    apis: getApiKeyCatalogOptions(),
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

  const input: CreateWorkspaceApiKeyInput = {
    apiSlug: typeof payload.apiSlug === 'string' ? payload.apiSlug : '',
    displayName: typeof payload.displayName === 'string' ? payload.displayName.trim() : '',
    environment: toEnvironment(payload.environment),
  };

  if (!input.apiSlug || !input.displayName) {
    return NextResponse.json({ error: 'apiSlug and displayName are required.' }, { status: 400 });
  }

  try {
    const issued = await issueWorkspaceApiKey(supabase, user.id, input);
    return NextResponse.json({
      key: issued.key,
      plainKey: issued.plainKey,
      apiName: issued.apiName,
      message: `${issued.apiName} key issued in ${input.environment} mode.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to issue an API key.';
    const status = isSchemaMissingError(error as { code?: string; message?: string }) ? 500 : 400;
    return NextResponse.json({
      error: status === 500
        ? 'The workspace API key tables are not in Supabase yet. Run the SQL migration first.'
        : message,
    }, { status });
  }
}
