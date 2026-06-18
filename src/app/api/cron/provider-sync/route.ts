import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncAllConnectionsForAdmin } from '@/lib/provider-connections/service';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error('Missing CRON_SECRET. Add it before calling the provider sync cron route.');
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const headerSecret = request.headers.get('x-cron-secret');

  return bearer === secret || headerSecret === secret;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const results = await syncAllConnectionsForAdmin(supabase);

    return NextResponse.json({
      synced: results.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to run provider sync.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
