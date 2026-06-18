import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteProviderConnection, getConnectionsSummary } from '@/lib/provider-connections/service';

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
    await deleteProviderConnection(supabase, user.id, id);
    const summary = await getConnectionsSummary(supabase, user.id);

    return NextResponse.json({
      deleted: true,
      metrics: summary.metrics,
      connections: summary.connections,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete this connection.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
