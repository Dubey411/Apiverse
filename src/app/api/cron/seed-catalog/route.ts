// /api/cron/seed-catalog — POST
// One-time seed: populate Supabase from static ALL_APIS catalog.
// Protect with CRON_SECRET env var.

import { NextRequest, NextResponse } from 'next/server';
import { seedCatalogFromStatic } from '@/lib/services/catalog-seed.service';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min timeout for large catalog

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[/api/cron/seed-catalog] Starting catalog seed...');
  const result = await seedCatalogFromStatic();

  return NextResponse.json({
    message: 'Seed completed',
    ...result,
  });
}

// Allow GET for manual browser trigger in dev
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use POST in production' }, { status: 405 });
  }
  return POST(request);
}
