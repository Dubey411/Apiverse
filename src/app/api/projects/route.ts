import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createProjectForUser, listProjectsForUser } from '@/lib/projects/repository';
import { isSchemaMissingError } from '@/lib/api-monitoring/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const admin = createAdminClient();
    return NextResponse.json(await listProjectsForUser(admin, user.id));
  } catch (error) {
    return NextResponse.json({
      error: isSchemaMissingError(error as { code?: string; message?: string })
        ? 'Project tables are not in Supabase yet. Run the latest migration first.'
        : error instanceof Error
          ? error.message
          : 'Unable to load projects.',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const project = await createProjectForUser(admin, user.id, {
      name: typeof payload.name === 'string' ? payload.name : '',
      description: typeof payload.description === 'string' ? payload.description : null,
    });
    return NextResponse.json({ project, message: `${project.name} created.` });
  } catch (error) {
    return NextResponse.json({
      error: isSchemaMissingError(error as { code?: string; message?: string })
        ? 'Project tables are not in Supabase yet. Run the latest migration first.'
        : error instanceof Error
          ? error.message
          : 'Unable to create project.',
    }, { status: 400 });
  }
}
