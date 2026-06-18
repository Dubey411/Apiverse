// ============================================================
// pricing-sync.service.ts
// Detects pricing changes for APIs in the DB vs current values.
// In production you would fetch live prices from provider pages.
// Here we compare DB numeric_price vs a computed expected value
// and log any changes to pricing_history.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { savePriceHistory } from '@/lib/repositories/api.repository';

export interface PriceSyncResult {
  checked: number;
  changed: number;
  changedSlugs: string[];
  errors: string[];
}

/** Placeholder: In production, fetch the current price from a provider API or web scraper.
 *  Here we simulate by returning the existing value (no change) to avoid false positives.
 *  Replace this function body per-provider in a real implementation.
 */
async function fetchCurrentProviderPrice(
  _slug: string,
  _baseUrl: string,
  existingNumericPrice: number
): Promise<{ numericPrice: number; priceText: string }> {
  // TODO: Integrate real provider price fetchers here per slug
  // e.g., fetch openai.com/api/pricing, parse response, return value
  return {
    numericPrice: existingNumericPrice, // No change in simulation
    priceText: '', // Will use existing text
  };
}

/**
 * Compare stored pricing with fetched provider pricing.
 * Logs any changes to pricing_history.
 */
export async function runPricingSync(): Promise<PriceSyncResult> {
  const result: PriceSyncResult = {
    checked: 0,
    changed: 0,
    changedSlugs: [],
    errors: [],
  };

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('apis')
    .select('id, slug, base_url, api_pricing(id, numeric_price, price)')
    .not('api_pricing', 'is', null);

  if (error || !data) {
    console.error('[pricing-sync] Failed to fetch APIs with pricing:', error);
    return result;
  }

  for (const api of (data as unknown) as { id: string; slug: string; base_url: string; api_pricing: { id: string; numeric_price: number; price: string } | null }[]) {
    const pricingRow = api.api_pricing;
    if (!pricingRow) continue;

    result.checked++;

    try {
      const { numericPrice: freshPrice, priceText: freshText } =
        await fetchCurrentProviderPrice(api.slug, api.base_url, pricingRow.numeric_price);

      if (freshPrice !== pricingRow.numeric_price && freshPrice > 0) {
        // Price changed — update the pricing row and log history
        await admin
          .from('api_pricing')
          .update({ numeric_price: freshPrice, price: freshText || pricingRow.price })
          .eq('api_id', api.id);

        await savePriceHistory(
          api.id,
          pricingRow.numeric_price,
          freshPrice,
          pricingRow.price,
          freshText || pricingRow.price
        );

        result.changed++;
        result.changedSlugs.push(api.slug);
        console.log(
          `[pricing-sync] Price changed for ${api.slug}: ${pricingRow.numeric_price} → ${freshPrice}`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${api.slug}: ${msg}`);
      console.error(`[pricing-sync] Error checking ${api.slug}:`, msg);
    }
  }

  console.log(
    `[pricing-sync] Completed. Checked: ${result.checked}, Changed: ${result.changed}`
  );
  return result;
}
