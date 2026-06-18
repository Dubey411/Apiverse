// /api/cron/monitor — POST
// Scheduled: health-check all API base URLs and record status/latency.

import { NextRequest, NextResponse } from 'next/server';
import { runHealthMonitoring } from '@/lib/services/health-monitoring.service';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runHealthMonitoring();
  return NextResponse.json({ message: 'Health monitor completed', ...result });
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use POST in production' }, { status: 405 });
  }
  return POST(request);
}
