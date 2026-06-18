import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revokeWorkspaceApiKey } from '@/lib/apiverse-keys/service';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const key = await revokeWorkspaceApiKey(supabase, user.id, id);
    return NextResponse.json({
      key,
      message: `${key.apiName} key revoked.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to revoke this API key.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
