import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { addApiToProjectForUser } from '@/lib/projects/repository';
import { isSchemaMissingError } from '@/lib/api-monitoring/repository';
import type { ProjectApiCriticality } from '@/lib/projects/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function toCriticality(value: unknown): ProjectApiCriticality {
  if (value === 'low' || value === 'high') return value;
  return 'medium';
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const api = await addApiToProjectForUser(admin, user.id, {
      projectId: id,
      monitoredApiId: typeof payload.monitoredApiId === 'string' ? payload.monitoredApiId : null,
      apiName: typeof payload.apiName === 'string' ? payload.apiName : '',
      apiSlug: typeof payload.apiSlug === 'string' ? payload.apiSlug : null,
      usageDescription: typeof payload.usageDescription === 'string' ? payload.usageDescription : '',
      criticality: toCriticality(payload.criticality),
      expiryAt: typeof payload.expiryAt === 'string' && payload.expiryAt ? payload.expiryAt : null,
    });
    return NextResponse.json({ api, message: `${api.api_name} added to project.` });
  } catch (error) {
    return NextResponse.json({
      error: isSchemaMissingError(error as { code?: string; message?: string })
        ? 'Project tables are not in Supabase yet. Run the latest migration first.'
        : error instanceof Error
          ? error.message
          : 'Unable to add API to project.',
    }, { status: 400 });
  }
}
