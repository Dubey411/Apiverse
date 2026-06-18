// /api/apis/compare?slugs=openai-responses,stripe-payments
// Returns multiple unified API objects for side-by-side comparison.

import { NextRequest, NextResponse } from 'next/server';
import { getDbApisBySlugs } from '@/lib/repositories/api.repository';
import { getUnifiedApiBySlug } from '@/lib/apiMarketplaceData';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get('slugs') ?? '';
  const slugs = slugsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5); // max 5

  if (slugs.length === 0) {
    return NextResponse.json({ error: 'Provide at least one slug via ?slugs=' }, { status: 400 });
  }

  try {
    const { apis: dbApis, source } = await getDbApisBySlugs(slugs);

    if (dbApis.length > 0) {
      return NextResponse.json({ apis: dbApis, source });
    }

    // Static fallback
    const fallback = slugs
      .map((s) => getUnifiedApiBySlug(s))
      .filter(Boolean);

    return NextResponse.json({
      apis: fallback,
      source: 'static_fallback',
    });
  } catch (err) {
    console.error('[/api/apis/compare] Error:', err);
    const fallback = slugs.map((s) => getUnifiedApiBySlug(s)).filter(Boolean);
    return NextResponse.json({ apis: fallback, source: 'static_fallback' });
  }
}
