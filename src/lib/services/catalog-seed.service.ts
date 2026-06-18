// ============================================================
// catalog-seed.service.ts
// One-time service to seed Supabase from the static ALL_APIS,
// apiCatalog, and apiDetailContent objects.
// Designed to be idempotent — safe to re-run at any time.
// ============================================================

import {
  upsertApi,
  upsertPricing,
  upsertApiFeatures,
  upsertSdkSupport,
  upsertIntegration,
  upsertEndpoints,
} from '@/lib/repositories/api.repository';
import { ALL_APIS, apiCatalog, apiDetailContent, getUnifiedApiBySlug } from '@/lib/apiMarketplaceData';

export interface SeedResult {
  total: number;
  seeded: number;
  failed: string[];
  errors: Record<string, string>;
}

/** Derive a numeric price from the human-readable pricing string */
function parseNumericPrice(priceStr: string): number {
  if (!priceStr) return 0;
  const lower = priceStr.toLowerCase();
  if (lower.includes('free') && !lower.includes('+')) return 0;

  // Extract first number from string (handles '$0.25 / 1M', '2.9%', '$0.0075', etc.)
  const match = priceStr.match(/[\d]+\.?[\d]*/);
  if (match) return parseFloat(match[0]);
  return 0;
}

/** Map pricing string to tier enum */
function resolvePricingTier(tier: string): 'free' | 'freemium' | 'payg' | 'paid' {
  const t = tier.toLowerCase();
  if (t === 'free') return 'free';
  if (t === 'freemium') return 'freemium';
  if (t === 'payg') return 'payg';
  return 'paid';
}

/**
 * Seed all APIs from the static catalog into Supabase.
 * Call from /api/cron/seed-catalog or directly from a migration script.
 */
export async function seedCatalogFromStatic(): Promise<SeedResult> {
  const result: SeedResult = {
    total: ALL_APIS.length,
    seeded: 0,
    failed: [],
    errors: {},
  };

  console.log(`[catalog-seed] Starting seed for ${ALL_APIS.length} APIs...`);

  for (const baseApi of ALL_APIS) {
    const slug = baseApi.slug;
    try {
      const unified = getUnifiedApiBySlug(slug);
      if (!unified) {
        result.failed.push(slug);
        result.errors[slug] = 'getUnifiedApiBySlug returned null';
        continue;
      }

      const { base, catalog, detail } = unified;

      // 1. Upsert core API row
      const apiId = await upsertApi({
        slug,
        name: base.name,
        provider: base.provider,
        categorySlug: base.category,
        description: base.description,
        authMethod: detail.auth ?? 'Bearer API key',
        baseUrl: detail.baseUrl,
        version: base.version,
        uptime: base.uptime,
        latency: parseInt(base.latency) || 150,
        rating: base.rating,
        reviews: base.reviews,
        trending: base.trending,
        tags: base.tags,
        mark: catalog.mark,
        markClassName: catalog.markClassName,
        accent: catalog.accent,
        eyebrow: catalog.eyebrow,
        overview: catalog.overview,
        howItWorks: catalog.howItWorks,
        documentationUrl: detail.baseUrl,
        websiteUrl: detail.baseUrl,
      });

      if (!apiId) {
        result.failed.push(slug);
        result.errors[slug] = 'upsertApi returned null';
        continue;
      }

      // 2. Upsert pricing
      await upsertPricing({
        apiId,
        pricingTier: resolvePricingTier(base.pricingTier),
        price: catalog.price,
        numericPrice: parseNumericPrice(catalog.price),
        access: catalog.access,
        monthlyFree: base.monthlyFree !== 'None' ? base.monthlyFree : undefined,
        sandboxLimit: detail.sandboxLimit,
        premiumLimit: detail.premiumLimit,
        pricingNotes: detail.pricingNotes,
      });

      // 3. Upsert features
      await upsertApiFeatures(apiId, catalog.bestFor, catalog.freePlan, catalog.premiumPlan);

      // 4. Upsert SDK support
      if (base.sdks?.length) {
        await upsertSdkSupport(apiId, base.sdks);
      }

      // 5. Upsert integration steps
      if (catalog.steps?.length) {
        await upsertIntegration(apiId, catalog.steps);
      }

      // 6. Upsert endpoints
      await upsertEndpoints(apiId, [
        {
          endpoint: detail.endpoint,
          protocol: detail.protocol,
          sampleRequest: catalog.sampleRequest,
          sampleResponse: detail.sampleResponse,
          responseHighlights: detail.responseHighlights,
        },
      ]);

      result.seeded++;
      console.log(`[catalog-seed] ✓ ${slug} (${result.seeded}/${result.total})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.failed.push(slug);
      result.errors[slug] = msg;
      console.error(`[catalog-seed] ✗ ${slug}: ${msg}`);
    }
  }

  console.log(
    `[catalog-seed] Done. Seeded: ${result.seeded}, Failed: ${result.failed.length}`
  );
  return result;
}
