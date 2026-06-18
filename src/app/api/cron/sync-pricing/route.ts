// /api/cron/sync-pricing — POST
// Scheduled: compare stored prices vs live provider prices and log changes.

import { NextRequest, NextResponse } from 'next/server';
import { runPricingSync } from '@/lib/services/pricing-sync.service';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runPricingSync();
  return NextResponse.json({ message: 'Pricing sync completed', ...result });
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use POST in production' }, { status: 405 });
  }
  return POST(request);
}
