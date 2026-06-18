// ============================================================
// api.repository.ts
// Repository pattern for querying and mutating marketplace
// data in Supabase. Falls back to static catalog on failure.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import {
  DbApiEnriched,
  DbPricingHistory,
  DbApiReview,
  DbApiStatusHistory,
  UnifiedApiBase,
  UnifiedApiCatalog,
  UnifiedApiDetail,
  UnifiedApi,
  UpsertApiInput,
  UpsertPricingInput,
  PriceChangeIndicator,
} from '@/lib/types/marketplace.types';

// ---------------------------------------------------------------
// Mapper helpers — DB rows → unified UI model
// ---------------------------------------------------------------

function dbToUnifiedBase(row: DbApiEnriched): UnifiedApiBase {
  const pricing = row.api_pricing;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    provider: row.provider,
    category: row.api_categories?.name ?? '',
    description: row.description,
    tags: row.tags,
    pricing: pricing?.price ?? 'Contact for pricing',
    pricingTier: pricing?.pricing_tier ?? 'free',
    rating: Number(row.rating),
    reviews: row.reviews,
    uptime: Number(row.uptime),
    latency: `${row.latency}ms`,
    version: row.version,
    trending: row.trending,
    sdks: row.api_sdk_support?.sdks ?? [],
    monthlyFree: pricing?.monthly_free ?? 'None',
  };
}

function dbToUnifiedCatalog(row: DbApiEnriched): UnifiedApiCatalog {
  const pricing = row.api_pricing;
  const features = row.api_features;
  const endpoints = row.api_endpoints ?? [];
  const integration = row.api_integrations;
  const firstEndpoint = endpoints[0];

  const accessLabel =
    pricing?.pricing_tier === 'payg'
      ? 'Free sandbox + premium usage'
      : pricing?.pricing_tier === 'free'
      ? 'Free usage'
      : pricing?.pricing_tier === 'freemium'
      ? 'Free tier + paid upgrades'
      : 'Paid access';

  return {
    slug: row.slug,
    provider: row.provider,
    product: row.name,
    category: row.api_categories?.name ?? '',
    price: pricing?.price ?? 'Contact for pricing',
    access: pricing?.access ?? accessLabel,
    metric: String(row.rating),
    metricLabel: `${row.reviews} reviews`,
    latency: `${row.latency}ms`,
    description: row.description,
    howItWorks:
      row.how_it_works ??
      'Open the detail page, review the integration components, test the request shape, and integrate it straight into your products.',
    mark: row.mark ?? row.provider.substring(0, 2).toUpperCase(),
    markClassName: row.mark_class_name ?? 'bg-stone-900 text-white',
    accent: row.accent ?? 'from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]',
    eyebrow: row.eyebrow ?? (row.tags[0] ? `${row.tags[0]} workflow` : 'Developer workflow'),
    overview: row.overview ?? row.description,
    bestFor: features?.best_for ?? row.tags,
    freePlan: features?.free_plan ?? ['Test usage', 'Sandbox docs', 'Basic examples'],
    premiumPlan: features?.premium_plan ?? ['Production capacity', 'Higher throughput', 'Priority support'],
    steps: integration?.steps ?? [
      'Review endpoints',
      'Generate your access key',
      'Send a test request',
      'Implement in production',
    ],
    sampleRequest:
      firstEndpoint?.sample_request ??
      `GET /v1/example HTTP/1.1\nHost: api.${row.provider.toLowerCase().replace(/\s/g, '')}.com\nAccept: application/json`,
  };
}

function dbToUnifiedDetail(row: DbApiEnriched): UnifiedApiDetail {
  const pricing = row.api_pricing;
  const endpoints = row.api_endpoints ?? [];
  const firstEndpoint = endpoints[0];
  const statusHistory = row.api_status_history ?? [];
  const latestStatus = statusHistory[0];

  return {
    baseUrl: row.base_url,
    endpoint: firstEndpoint?.endpoint ?? `GET /v1/${row.slug.split('-').pop()}`,
    auth: row.auth_method,
    protocol: firstEndpoint?.protocol ?? 'HTTPS + JSON',
    sandboxLimit: pricing?.sandbox_limit ?? pricing?.monthly_free ?? 'Limited',
    premiumLimit: pricing?.premium_limit ?? 'Volume based tier',
    successRate: latestStatus
      ? `${(100 - Number(latestStatus.error_rate)).toFixed(2)}%`
      : `${Number(row.uptime).toFixed(2)}%`,
    regions: ['Global'],
    responseHighlights:
      firstEndpoint?.response_highlights ?? ['status', 'data', 'timestamp', 'request_id'],
    pricingNotes:
      pricing?.pricing_notes?.length
        ? pricing.pricing_notes
        : [
            `Pricing tier: ${pricing?.price ?? 'Contact for pricing'}`,
            pricing?.monthly_free && pricing.monthly_free !== 'None'
              ? `Includes ${pricing.monthly_free}`
              : 'No free trial provided',
            'Contact provider for large volume',
          ],
    sampleResponse:
      firstEndpoint?.sample_response ?? '{\n  "status": "success",\n  "data": {}\n}',
  };
}

function dbToUnifiedApi(row: DbApiEnriched): UnifiedApi {
  return {
    base: dbToUnifiedBase(row),
    catalog: dbToUnifiedCatalog(row),
    detail: dbToUnifiedDetail(row),
  };
}

// ---------------------------------------------------------------
// The enriched query — selects all related tables in one call
// ---------------------------------------------------------------

const ENRICHED_SELECT = `
  *,
  api_categories(*),
  api_pricing(*),
  api_features(*),
  api_sdk_support(*),
  api_integrations(*),
  api_endpoints(*),
  api_status_history(status, latency_ms, error_rate, checked_at)
`;

// ---------------------------------------------------------------
// Public repository functions
// ---------------------------------------------------------------

/**
 * Fetch all APIs with all their related tables joined.
 * Returns an array of unified base objects suitable for the marketplace list view.
 */
export async function getAllApis(): Promise<{
  apis: UnifiedApiBase[];
  source: 'database' | 'static_fallback';
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('apis')
      .select(ENRICHED_SELECT)
      .order('rating', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No APIs in DB');

    const apis = (data as DbApiEnriched[]).map(dbToUnifiedBase);
    return { apis, source: 'database' };
  } catch (err) {
    console.warn('[api.repository] getAllApis DB error, using static fallback:', err);
    return { apis: [], source: 'static_fallback' };
  }
}

/**
 * Fetch a single API by slug with all detail data.
 * Returns the unified model matching what getUnifiedApiBySlug() returns from static data.
 */
export async function getDbApiBySlug(slug: string): Promise<{
  api: UnifiedApi | null;
  source: 'database' | 'static_fallback';
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('apis')
      .select(ENRICHED_SELECT)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    if (!data) return { api: null, source: 'static_fallback' };

    return { api: dbToUnifiedApi(data as DbApiEnriched), source: 'database' };
  } catch (err) {
    console.warn(`[api.repository] getDbApiBySlug(${slug}) DB error:`, err);
    return { api: null, source: 'static_fallback' };
  }
}

/**
 * Fetch multiple APIs by their slugs for the compare endpoint.
 */
export async function getDbApisBySlugs(slugs: string[]): Promise<{
  apis: UnifiedApi[];
  source: 'database' | 'static_fallback';
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('apis')
      .select(ENRICHED_SELECT)
      .in('slug', slugs);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No APIs found');

    const apis = (data as DbApiEnriched[]).map(dbToUnifiedApi);
    return { apis, source: 'database' };
  } catch (err) {
    console.warn('[api.repository] getDbApisBySlugs DB error:', err);
    return { apis: [], source: 'static_fallback' };
  }
}

/**
 * Fetch pricing history for an API within the last N days.
 */
export async function getApiPricingHistory(
  apiId: string,
  days: number = 90
): Promise<DbPricingHistory[]> {
  try {
    const admin = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await admin
      .from('pricing_history')
      .select('*')
      .eq('api_id', apiId)
      .gte('changed_at', since.toISOString())
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as DbPricingHistory[];
  } catch (err) {
    console.warn('[api.repository] getApiPricingHistory error:', err);
    return [];
  }
}

/**
 * Get the latest pricing history entry per API for badge/indicator display.
 * Only returns entries changed within the last 30 days.
 */
export async function getRecentPriceChanges(): Promise<PriceChangeIndicator[]> {
  try {
    const admin = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await admin
      .from('pricing_history')
      .select('*, apis(slug)')
      .gte('changed_at', since.toISOString())
      .order('changed_at', { ascending: false });

    if (error) throw error;

    // De-duplicate: keep only the most recent change per API
    const seen = new Set<string>();
    const changes: PriceChangeIndicator[] = [];

    for (const row of (data ?? []) as (DbPricingHistory & { apis: { slug: string } })[]) {
      const slug = row.apis?.slug;
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);

      changes.push({
        slug,
        direction:
          row.change_amount < 0 ? 'down' : row.change_amount > 0 ? 'up' : 'none',
        changePercentage: Math.abs(Number(row.change_percentage)),
        changeAmount: Math.abs(Number(row.change_amount)),
        changedAt: row.changed_at,
        oldPriceText: row.old_price_text,
        newPriceText: row.new_price_text,
      });
    }

    return changes;
  } catch (err) {
    console.warn('[api.repository] getRecentPriceChanges error:', err);
    return [];
  }
}

/**
 * Fetch reviews for a specific API.
 */
export async function getApiReviews(apiId: string, limit: number = 10): Promise<DbApiReview[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('api_reviews')
      .select('*')
      .eq('api_id', apiId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as DbApiReview[];
  } catch (err) {
    console.warn('[api.repository] getApiReviews error:', err);
    return [];
  }
}

/**
 * Fetch the most recent status check for an API.
 */
export async function getLatestApiStatus(apiId: string): Promise<DbApiStatusHistory | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('api_status_history')
      .select('*')
      .eq('api_id', apiId)
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data as DbApiStatusHistory;
  } catch {
    return null;
  }
}

/**
 * Upsert an API record. Used by the discovery and seed services.
 * Returns the inserted/updated row id.
 */
export async function upsertApi(input: UpsertApiInput): Promise<string | null> {
  try {
    const admin = createAdminClient();

    // Ensure category exists
    const { data: catData, error: catError } = await admin
      .from('api_categories')
      .upsert({ name: input.categorySlug, slug: input.categorySlug.toLowerCase().replace(/\s+/g, '-') }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (catError) throw catError;
    const categoryId = catData.id;

    const upsertRow = {
      slug: input.slug,
      name: input.name,
      provider: input.provider,
      category_id: categoryId,
      description: input.description,
      auth_method: input.authMethod,
      base_url: input.baseUrl,
      version: input.version ?? '1.0',
      uptime: input.uptime ?? 99.9,
      latency: input.latency ?? 150,
      rating: input.rating ?? 4.5,
      reviews: input.reviews ?? 0,
      trending: input.trending ?? false,
      tags: input.tags ?? [],
      mark: input.mark ?? null,
      mark_class_name: input.markClassName ?? null,
      accent: input.accent ?? null,
      eyebrow: input.eyebrow ?? null,
      overview: input.overview ?? null,
      how_it_works: input.howItWorks ?? null,
      documentation_url: input.documentationUrl ?? null,
      website_url: input.websiteUrl ?? null,
    };

    const { data, error } = await admin
      .from('apis')
      .upsert(upsertRow, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error('[api.repository] upsertApi error:', err);
    return null;
  }
}

/**
 * Upsert API pricing. Called during seed and pricing sync.
 */
export async function upsertPricing(input: UpsertPricingInput): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('api_pricing').upsert(
      {
        api_id: input.apiId,
        pricing_tier: input.pricingTier,
        price: input.price,
        numeric_price: input.numericPrice,
        access: input.access,
        monthly_free: input.monthlyFree ?? null,
        sandbox_limit: input.sandboxLimit ?? null,
        premium_limit: input.premiumLimit ?? null,
        pricing_notes: input.pricingNotes ?? [],
      },
      { onConflict: 'api_id' }
    );
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[api.repository] upsertPricing error:', err);
    return false;
  }
}

/**
 * Log a price change into pricing_history.
 * Only logs if old and new numeric prices differ.
 */
export async function savePriceHistory(
  apiId: string,
  oldPrice: number,
  newPrice: number,
  oldPriceText?: string,
  newPriceText?: string
): Promise<boolean> {
  if (oldPrice === newPrice) return false;

  try {
    const admin = createAdminClient();
    const changeAmount = newPrice - oldPrice;
    const changePercentage = oldPrice !== 0 ? (changeAmount / oldPrice) * 100 : 0;

    const { error } = await admin.from('pricing_history').insert({
      api_id: apiId,
      old_price: oldPrice,
      new_price: newPrice,
      old_price_text: oldPriceText ?? null,
      new_price_text: newPriceText ?? null,
      change_amount: changeAmount,
      change_percentage: changePercentage,
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[api.repository] savePriceHistory error:', err);
    return false;
  }
}

/**
 * Log a health status check result.
 */
export async function saveStatusCheck(
  apiId: string,
  status: 'healthy' | 'warning' | 'critical' | 'paused',
  latencyMs: number,
  errorRate: number
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('api_status_history').insert({
      api_id: apiId,
      status,
      latency_ms: latencyMs,
      error_rate: errorRate,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[api.repository] saveStatusCheck error:', err);
    return false;
  }
}

/**
 * Upsert features (best_for, free_plan, premium_plan) for an API.
 */
export async function upsertApiFeatures(
  apiId: string,
  bestFor: string[],
  freePlan: string[],
  premiumPlan: string[]
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('api_features').upsert(
      { api_id: apiId, best_for: bestFor, free_plan: freePlan, premium_plan: premiumPlan },
      { onConflict: 'api_id' }
    );
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[api.repository] upsertApiFeatures error:', err);
    return false;
  }
}

/**
 * Upsert SDK list for an API.
 */
export async function upsertSdkSupport(apiId: string, sdks: string[]): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from('api_sdk_support')
      .upsert({ api_id: apiId, sdks }, { onConflict: 'api_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[api.repository] upsertSdkSupport error:', err);
    return false;
  }
}

/**
 * Upsert integration steps for an API.
 */
export async function upsertIntegration(apiId: string, steps: string[]): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from('api_integrations')
      .upsert({ api_id: apiId, steps }, { onConflict: 'api_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[api.repository] upsertIntegration error:', err);
    return false;
  }
}

/**
 * Upsert endpoints for an API. Replaces all existing endpoints.
 */
export async function upsertEndpoints(
  apiId: string,
  endpoints: {
    endpoint: string;
    protocol?: string;
    sampleRequest?: string;
    sampleResponse?: string;
    responseHighlights?: string[];
  }[]
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    // Delete existing endpoints first
    await admin.from('api_endpoints').delete().eq('api_id', apiId);

    if (endpoints.length === 0) return true;

    const rows = endpoints.map((e) => ({
      api_id: apiId,
      endpoint: e.endpoint,
      protocol: e.protocol ?? 'HTTPS + JSON',
      sample_request: e.sampleRequest ?? null,
      sample_response: e.sampleResponse ?? null,
      response_highlights: e.responseHighlights ?? ['status', 'data'],
    }));

    const { error } = await admin.from('api_endpoints').insert(rows);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[api.repository] upsertEndpoints error:', err);
    return false;
  }
}

/**
 * Get the internal DB id for an API by slug.
 */
export async function getApiIdBySlug(slug: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('apis')
      .select('id')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data?.id ?? null;
  } catch {
    return null;
  }
}
