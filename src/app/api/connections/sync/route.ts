import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getConnectionsSummary, syncProviderConnection } from '@/lib/provider-connections/service';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await getConnectionsSummary(supabase, user.id);
  const results = [];

  for (const connection of summary.connections) {
    const synced = await syncProviderConnection(supabase, user.id, connection.id);
    results.push({
      id: connection.id,
      displayName: connection.displayName,
      synced: Boolean(synced),
    });
  }

  const refreshed = await getConnectionsSummary(supabase, user.id);

  return NextResponse.json({
    results,
    metrics: refreshed.metrics,
    connections: refreshed.connections,
  });
}
