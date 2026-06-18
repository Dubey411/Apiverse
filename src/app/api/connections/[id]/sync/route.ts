import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getConnectionsSummary, syncProviderConnection } from '@/lib/provider-connections/service';

export async function POST(
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
    const connection = await syncProviderConnection(supabase, user.id, id);
    const summary = await getConnectionsSummary(supabase, user.id);

    return NextResponse.json({
      connection: connection ?? null,
      metrics: summary.metrics,
      connections: summary.connections,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sync this connection.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
