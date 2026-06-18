import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteProjectApiForUser } from '@/lib/projects/repository';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ apiId: string }> },
) {
  const { apiId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const admin = createAdminClient();
    await deleteProjectApiForUser(admin, user.id, apiId);
    return NextResponse.json({ message: 'API removed from project.' });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to remove API from project.',
    }, { status: 400 });
  }
}
