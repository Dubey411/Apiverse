import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findApisDueForMonitoring } from '@/lib/api-monitoring/repository';
import { runMonitoringCheck } from '@/lib/api-monitoring/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret && process.env.NODE_ENV !== 'production') return true;

  const authHeader = request.headers.get('authorization');
  const headerSecret = request.headers.get('x-cron-secret');
  const bearer = authHeader?.replace(/^Bearer\s+/i, '');

  return Boolean(cronSecret && (bearer === cronSecret || headerSecret === cronSecret));
}

async function runMonitorPoll(request: Request) {
  if (!isAuthorized(request)) {
    console.warn('[APIverse Cron] Unauthorized monitor-poll attempt.');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const admin = createAdminClient();

  try {
    const intervalMinutes = Number(process.env.MONITOR_POLL_INTERVAL_MINUTES ?? 5);
    const dueApis = await findApisDueForMonitoring(
      admin,
      Number.isFinite(intervalMinutes) && intervalMinutes > 0 ? intervalMinutes : 5,
    );

    if (dueApis.length === 0) {
      return NextResponse.json({ message: 'No APIs due for monitoring.', checkedCount: 0 });
    }

    const results = await Promise.allSettled(
      dueApis.map((api) => runMonitoringCheck(admin, api.user_id, api.id)),
    );

    const failures = results.flatMap((result, index) => {
      if (result.status === 'fulfilled') return [];
      return [{
        apiId: dueApis[index]?.id,
        reason: result.reason instanceof Error ? result.reason.message : 'Monitoring check failed.',
      }];
    });

    return NextResponse.json({
      message: 'Cron check completed.',
      checkedCount: dueApis.length,
      successful: results.length - failures.length,
      failed: failures.length,
      failures,
    });
  } catch (error) {
    console.error('[APIverse Cron] Error during monitor-poll:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to run monitoring poll.',
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return runMonitorPoll(request);
}

export async function POST(request: Request) {
  return runMonitorPoll(request);
}
