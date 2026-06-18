// /api/apis — GET: list all marketplace APIs with search, filter, price change indicators
// Falls back to static catalog if DB is unavailable.

import { NextRequest, NextResponse } from 'next/server';
import { getAllApis, getRecentPriceChanges } from '@/lib/repositories/api.repository';
import { ALL_APIS } from '@/lib/apiMarketplaceData';
import { UnifiedApiBase } from '@/lib/types/marketplace.types';

export const runtime = 'nodejs';
export const revalidate = 300; // 5 minutes

function staticFallback(): UnifiedApiBase[] {
  return ALL_APIS.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    provider: a.provider,
    category: a.category,
    description: a.description,
    tags: a.tags,
    pricing: a.pricing,
    pricingTier: a.pricingTier as UnifiedApiBase['pricingTier'],
    rating: a.rating,
    reviews: a.reviews,
    uptime: a.uptime,
    latency: a.latency,
    version: a.version,
    trending: a.trending,
    sdks: a.sdks,
    monthlyFree: a.monthlyFree,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() ?? '';
  const category = searchParams.get('category') ?? '';
  const tier = searchParams.get('tier') ?? '';

  try {
    const [dbResult, priceChanges] = await Promise.all([
      getAllApis(),
      getRecentPriceChanges(),
    ]);

    let apis: UnifiedApiBase[] =
      dbResult.source === 'database' && dbResult.apis.length > 0
        ? dbResult.apis
        : staticFallback();

    const source = dbResult.source === 'database' && dbResult.apis.length > 0
      ? 'database'
      : 'static_fallback';

    // Apply filters
    if (search) {
      apis = apis.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.provider.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search) ||
          a.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    if (category && category !== 'All APIs') {
      apis = apis.filter((a) => a.category === category);
    }

    if (tier) {
      apis = apis.filter((a) => a.pricingTier === tier);
    }

    // Build price change map keyed by slug
    const priceChangeMap = Object.fromEntries(
      priceChanges.map((c) => [c.slug, c])
    );

    return NextResponse.json(
      {
        apis,
        total: apis.length,
        source,
        priceChanges: priceChangeMap,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('[/api/apis] Unexpected error, serving static fallback:', err);
    const apis = staticFallback();
    return NextResponse.json({
      apis,
      total: apis.length,
      source: 'static_fallback',
      priceChanges: {},
    });
  }
}
