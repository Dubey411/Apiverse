// /api/apis/[slug] — GET: full detail for a single API
// Falls back to static data if DB unavailable.

import { NextRequest, NextResponse } from 'next/server';
import { getDbApiBySlug, getApiPricingHistory, getApiReviews, getLatestApiStatus, getApiIdBySlug } from '@/lib/repositories/api.repository';
import { getUnifiedApiBySlug } from '@/lib/apiMarketplaceData';
import { DbPricingHistory, DbApiReview, DbApiStatusHistory } from '@/lib/types/marketplace.types';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const { api: dbApi, source } = await getDbApiBySlug(slug);

    let api = dbApi;
    let pricingHistory: DbPricingHistory[] = [];
    let reviews: DbApiReview[] = [];
    let recentStatusCheck: DbApiStatusHistory | null = null;

    if (dbApi) {
      // Fetch enrichment data in parallel
      const apiId = await getApiIdBySlug(slug);
      if (apiId) {
        [pricingHistory, reviews, recentStatusCheck] = await Promise.all([
          getApiPricingHistory(apiId, 90),
          getApiReviews(apiId, 5),
          getLatestApiStatus(apiId),
        ]);
      }
    } else {
      // Static fallback
      const staticData = getUnifiedApiBySlug(slug);
      if (!staticData) {
        return NextResponse.json({ error: 'API not found' }, { status: 404 });
      }
      // Cast static data to UnifiedApi (pricingTier is a validated literal in ALL_APIS)
      api = staticData as unknown as typeof dbApi;
    }

    return NextResponse.json(
      { api, pricingHistory, reviews, recentStatusCheck, source },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error(`[/api/apis/${slug}] Error:`, err);

    // Hard fallback
    const staticApi = getUnifiedApiBySlug(slug);
    if (!staticApi) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({
      api: staticApi as unknown,
      pricingHistory: [] as DbPricingHistory[],
      reviews: [] as DbApiReview[],
      recentStatusCheck: null,
      source: 'static_fallback',
    });
  }
}
