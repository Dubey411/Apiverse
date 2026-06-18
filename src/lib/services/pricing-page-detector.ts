// ============================================================
// pricing-page-detector.ts
// REAL pricing page change detection.
//
// How it works:
// 1. Each API has a pricing_url (the provider's actual pricing page)
// 2. We fetch that page, extract pricing-relevant text (prices, tiers, limits)
// 3. SHA-256 hash the extracted text
// 4. Compare with the previously stored hash
// 5. If hash differs → flag the API for human review + log to pricing_history
//
// This is NOT scraping prices automatically — pricing pages change layout
// constantly. We detect THAT something changed and alert, so a human can
// verify and update the price text in the DB.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { savePriceHistory } from '@/lib/repositories/api.repository';

// ---------------------------------------------------------------
// Real pricing page URLs for all 109 seeded API providers
// ---------------------------------------------------------------

export const PRICING_URLS: Record<string, string> = {
  // AI / ML
  'openai-responses':              'https://openai.com/api/pricing',
  'chatgpt-conversation-gateway':  'https://openai.com/api/pricing',
  'ai-claude':                     'https://www.anthropic.com/pricing',
  'ai-gemini':                     'https://ai.google.dev/pricing',
  'ai-mistral':                    'https://mistral.ai/technology/#pricing',
  'ai-cohere':                     'https://cohere.com/pricing',
  'ai-huggingface':                'https://huggingface.co/pricing',
  'ai-stability':                  'https://stability.ai/pricing',
  'ai-elevenlabs':                 'https://elevenlabs.io/pricing',
  'ai-deepgram':                   'https://deepgram.com/pricing',
  'ai-assemblyai':                 'https://www.assemblyai.com/pricing',
  'ai-replicate':                  'https://replicate.com/pricing',
  'ai-groq':                       'https://groq.com/pricing/',
  'ai-perplexity':                 'https://www.perplexity.ai/hub/faq/pplx-api-pro-pricing',
  'ai-together':                   'https://www.together.ai/pricing',
  'ai-fireworks':                  'https://fireworks.ai/pricing',
  'sarvam-indic-ai':               'https://www.sarvam.ai/apis',
  'ai-runway':                     'https://runwayml.com/pricing',
  'ai-pinecone':                   'https://www.pinecone.io/pricing/',
  'ai-vision':                     'https://cloud.google.com/vision/pricing',
  'ai-sentiment':                  'https://aws.amazon.com/comprehend/pricing/',

  // Payments
  'stripe-payments':               'https://stripe.com/pricing',
  'razorpay-payouts':              'https://razorpay.com/pricing/',
  'pay-stripe':                    'https://stripe.com/pricing',
  'pay-square':                    'https://squareup.com/us/en/payments/processing-fees',
  'pay-adyen':                     'https://www.adyen.com/pricing',
  'pay-cashfree':                  'https://www.cashfree.com/payment-gateway-charges/',
  'pay-phonepe':                   'https://www.phonepe.com/business-solutions/pricing/',
  'pay-upi':                       'https://www.npci.org.in/what-we-do/upi/product-overview',
  'pay-braintree':                 'https://www.braintreepayments.com/pricing',
  'pay-mollie':                    'https://www.mollie.com/en/pricing',
  'pay-bankverify':                'https://razorpay.com/pricing/',

  // Messaging
  'twilio-messaging':              'https://www.twilio.com/en-us/sms/pricing/in',
  'msg-twilio':                    'https://www.twilio.com/en-us/sms/pricing/in',
  'msg-mailgun':                   'https://www.mailgun.com/pricing/',
  'msg-postmark':                  'https://postmarkapp.com/pricing',
  'msg-vonage':                    'https://www.vonage.com/communications-apis/sms/pricing/',
  'msg-whatsapp':                  'https://developers.facebook.com/docs/whatsapp/pricing',
  'msg-slack':                     'https://slack.com/intl/en-in/pricing',
  'msg-discord':                   'https://discord.com/developers/docs/policies-and-agreements/terms-of-service',
  'msg-telegram':                  'https://core.telegram.org/bots/api',
  'msg-resend':                    'https://resend.com/pricing',
  'msg-sms-gw':                    'https://www.textlocal.in/pricing/',

  // Maps / Location
  'google-maps-places':            'https://mapsplatform.google.com/pricing/',
  'map-google':                    'https://mapsplatform.google.com/pricing/',
  'map-here':                      'https://www.here.com/platform/pricing',
  'map-tomtom':                    'https://developer.tomtom.com/pricing',
  'map-w3w':                       'https://developer.what3words.com/pricing',
  'map-ipinfo':                    'https://ipinfo.io/pricing',
  'map-radar':                     'https://radar.com/pricing',
  'map-opencage':                  'https://opencagedata.com/pricing',

  // Government / India
  'uidai-aadhaar-verify':          'https://uidai.gov.in/ecosystem/authentication-devices-documents/about-authentication.html',
  'gstin-taxpayer-search':         'https://gstn.org.in/',
  'nsdl-pan-verification':         'https://www.protean-tinpan.com/services/tan/tan.html',
  'digilocker-document-access':    'https://www.digilocker.gov.in/',
  'gov-aadhaar':                   'https://uidai.gov.in/',
  'gov-ecourts':                   'https://ecourts.gov.in/',
  'gov-epfo':                      'https://www.epfindia.gov.in/',
  'gov-ckyc':                      'https://ckycreg.com/',
  'gov-pincode':                   'https://data.gov.in/catalogs/postal',

  // Identity / KYC
  'clear-kyc-business':            'https://clear.in/business',
  'id-clear':                      'https://clear.in/business',
  'id-clerk':                      'https://clerk.com/pricing',
  'id-sumsub':                     'https://sumsub.com/pricing/',
  'id-onfido':                     'https://onfido.com/pricing/',
  'id-firebase-auth':              'https://firebase.google.com/pricing',
  'id-okta':                       'https://www.okta.com/pricing/',
  'id-jumio':                      'https://www.jumio.com/pricing/',

  // Fintech
  'fin-plaid':                     'https://plaid.com/pricing/',
  'fin-setu':                      'https://setu.co/pricing',
  'fin-truelayer':                 'https://truelayer.com/pricing/',
  'fin-yodlee':                    'https://www.yodlee.com/financial-apis/pricing',
  'fin-mx':                        'https://www.mx.com/pricing/',
  'fin-razorpayx':                 'https://razorpay.com/pricing/',
  'fin-coingecko':                 'https://www.coingecko.com/en/api/pricing',
  'fin-exchangerate':              'https://www.exchangerate-api.com/pricing',

  // Cloud
  'cloud-aws-s3':                  'https://aws.amazon.com/s3/pricing/',
  'cloud-cloudflare':              'https://www.cloudflare.com/plans/',
  'cloud-vercel':                  'https://vercel.com/pricing',
  'cloud-supabase':                'https://supabase.com/pricing',
  'cloud-do':                      'https://www.digitalocean.com/pricing',
  'cloud-railway':                 'https://railway.app/pricing',
  'cloud-render':                  'https://render.com/pricing',
  'cloud-flyio':                   'https://fly.io/docs/about/pricing/',
  'cloud-upstash':                 'https://upstash.com/pricing',
  'cloud-neon':                    'https://neon.tech/pricing',

  // Analytics
  'ana-mixpanel':                  'https://mixpanel.com/pricing/',
  'ana-amplitude':                 'https://amplitude.com/pricing',
  'ana-segment':                   'https://segment.com/pricing/',
  'ana-posthog':                   'https://posthog.com/pricing',
  'ana-sentry':                    'https://sentry.io/pricing/',
  'ana-datadog':                   'https://www.datadoghq.com/pricing/',
  'ana-logrocket':                 'https://logrocket.com/pricing/',

  // Search
  'src-algolia':                   'https://www.algolia.com/pricing/',
  'src-typesense':                 'https://cloud.typesense.org/pricing',
  'src-meilisearch':               'https://www.meilisearch.com/pricing',
  'src-elastic':                   'https://www.elastic.co/pricing/',

  // Social
  'soc-twitter':                   'https://developer.x.com/en/portal/products',
  'soc-github':                    'https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api',
  'soc-linkedin':                  'https://developer.linkedin.com/',
  'soc-instagram':                 'https://developers.facebook.com/docs/instagram-api/',
  'soc-youtube':                   'https://developers.google.com/youtube/v3/getting-started#quota',
  'soc-spotify':                   'https://developer.spotify.com/documentation/web-api/concepts/quota-modes',
  'soc-reddit':                    'https://www.reddit.com/dev/api/',
  'soc-tiktok':                    'https://developers.tiktok.com/doc/overview',

  // Weather / Data
  'data-weather':                  'https://openweathermap.org/price',
  'data-news':                     'https://newsapi.org/pricing',
  'data-imd':                      'https://mausam.imd.gov.in/',
  'data-gov-open-government':      'https://data.gov.in/',
};

// ---------------------------------------------------------------
// Extract pricing-relevant text from a fetched HTML page
// Focuses on numbers, percentages, dollar/rupee amounts, and
// tier labels — strips boilerplate navigation/footer noise
// ---------------------------------------------------------------

function extractPricingText(html: string): string {
  // Remove scripts, styles, SVG, and HTML comments
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')  // Remove all remaining HTML tags
    .replace(/\s+/g, ' ')
    .trim();

  // Extract lines that contain price-signal tokens
  const pricingKeywords = /(\$|₹|€|£|%|per|month|year|free|plan|token|request|call|credit|limit|tier|basic|pro|enterprise|startup|team|scale|unlimited|pay|pricing|cost)/i;
  const lines = stripped.split(/[.!?\n]/).filter(line => pricingKeywords.test(line));

  return lines.slice(0, 80).join('\n').slice(0, 8000);
}

// ---------------------------------------------------------------
// SHA-256 hash using Web Crypto (available in Node.js 18+)
// ---------------------------------------------------------------

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------
// Fetch a pricing page with timeout
// ---------------------------------------------------------------

async function fetchPricingPage(url: string, timeoutMs = 12000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'APIverse-PricingBot/1.0 (pricing change monitor)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[pricing-detector] HTTP ${res.status} for ${url}`);
      return null;
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('html') && !contentType.includes('text')) {
      return null;
    }

    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === 'AbortError') {
      console.warn(`[pricing-detector] Timeout fetching ${url}`);
    }
    return null;
  }
}

// ---------------------------------------------------------------
// Result types
// ---------------------------------------------------------------

export interface PricingDetectionResult {
  total: number;
  checked: number;
  unchanged: number;
  changed: number;
  unreachable: number;
  changedSlugs: string[];
  unreachableSlugs: string[];
  errors: string[];
}

// ---------------------------------------------------------------
// Main: run pricing page change detection for all APIs
// ---------------------------------------------------------------

export async function runPricingPageDetection(
  slugFilter?: string[]  // optional: only check specific slugs
): Promise<PricingDetectionResult> {
  const result: PricingDetectionResult = {
    total: 0,
    checked: 0,
    unchanged: 0,
    changed: 0,
    unreachable: 0,
    changedSlugs: [],
    unreachableSlugs: [],
    errors: [],
  };

  const admin = createAdminClient();

  // Fetch APIs that have a pricing_url OR are in our PRICING_URLS map
  const { data: apis, error } = await admin
    .from('apis')
    .select('id, slug, pricing_url, pricing_page_hash, api_pricing(id, numeric_price, price)')
    .order('pricing_page_checked_at', { ascending: true, nullsFirst: true });

  if (error || !apis) {
    console.error('[pricing-detector] Failed to fetch APIs:', error);
    return result;
  }

  // Determine which APIs to check
  const toCheck = (apis as unknown as {
    id: string;
    slug: string;
    pricing_url: string | null;
    pricing_page_hash: string | null;
    api_pricing: { id: string; numeric_price: number; price: string } | null;
  }[]).filter(api => {
    const hasUrl = !!api.pricing_url || !!PRICING_URLS[api.slug];
    const matchesFilter = !slugFilter || slugFilter.includes(api.slug);
    return hasUrl && matchesFilter;
  });

  result.total = toCheck.length;
  console.log(`[pricing-detector] Checking ${toCheck.length} APIs for pricing page changes...`);

  // Process in batches of 5 to avoid hammering providers
  const BATCH = 5;
  for (let i = 0; i < toCheck.length; i += BATCH) {
    const batch = toCheck.slice(i, i + BATCH);
    await Promise.all(batch.map(api => checkApiPricingPage(api, result, admin)));
  }

  console.log(
    `[pricing-detector] Done. Checked: ${result.checked}, Changed: ${result.changed}, Unreachable: ${result.unreachable}`
  );

  return result;
}

async function checkApiPricingPage(
  api: {
    id: string;
    slug: string;
    pricing_url: string | null;
    pricing_page_hash: string | null;
    api_pricing: { id: string; numeric_price: number; price: string } | null;
  },
  result: PricingDetectionResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any
): Promise<void> {
  const pricingUrl = api.pricing_url ?? PRICING_URLS[api.slug];
  if (!pricingUrl) return;

  result.checked++;

  try {
    // Fetch the pricing page
    const html = await fetchPricingPage(pricingUrl);

    if (!html) {
      result.unreachable++;
      result.unreachableSlugs.push(api.slug);

      // Mark as unreachable but don't reset hash
      await admin.from('apis').update({
        pricing_url: pricingUrl,
        pricing_page_checked_at: new Date().toISOString(),
      }).eq('id', api.id);

      console.log(`[pricing-detector] ⚠ Unreachable: ${api.slug}`);
      return;
    }

    // Extract pricing-relevant text and hash it
    const pricingText = extractPricingText(html);
    const newHash = await sha256(pricingText);
    const oldHash = api.pricing_page_hash;

    const now = new Date().toISOString();

    if (!oldHash) {
      // First time checking — just store the hash as baseline
      await admin.from('apis').update({
        pricing_url: pricingUrl,
        pricing_page_hash: newHash,
        pricing_page_checked_at: now,
        pricing_changed_flag: false,
      }).eq('id', api.id);

      console.log(`[pricing-detector] 📌 Baseline stored: ${api.slug}`);
      result.unchanged++;

    } else if (newHash !== oldHash) {
      // Hash changed — pricing page content is different!
      result.changed++;
      result.changedSlugs.push(api.slug);

      // Update the hash and flag for human review
      await admin.from('apis').update({
        pricing_url: pricingUrl,
        pricing_page_hash: newHash,
        pricing_page_checked_at: now,
        pricing_changed_flag: true,  // Flagged for human review
      }).eq('id', api.id);

      // Log the change to pricing_history (as a page-hash change, not a numeric price change)
      // Use numeric_price = 0 vs -1 trick to record the event without fake price data
      if (api.api_pricing) {
        await admin.from('pricing_history').insert({
          api_id: api.id,
          old_price: api.api_pricing.numeric_price,
          new_price: api.api_pricing.numeric_price, // Same price — change is unconfirmed
          old_price_text: api.api_pricing.price,
          new_price_text: null, // Unknown until human verifies
          change_amount: 0,
          change_percentage: 0,
          change_type: 'page_hash_change',
          notes: `Pricing page content changed at ${pricingUrl} — manual verification required`,
        });
      }

      console.log(`[pricing-detector] 🔴 PRICING PAGE CHANGED: ${api.slug} → ${pricingUrl}`);

    } else {
      // Hash matches — no change
      result.unchanged++;

      await admin.from('apis').update({
        pricing_url: pricingUrl,
        pricing_page_checked_at: now,
        pricing_changed_flag: false,
      }).eq('id', api.id);

      console.log(`[pricing-detector] ✓ No change: ${api.slug}`);
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`${api.slug}: ${msg}`);
    console.error(`[pricing-detector] ✗ Error checking ${api.slug}:`, msg);
  }
}

// ---------------------------------------------------------------
// Update pricing URLs in DB from the static PRICING_URLS map
// (Call this once to seed the pricing_url column)
// ---------------------------------------------------------------

export async function seedPricingUrls(): Promise<{ updated: number; errors: number }> {
  const admin = createAdminClient();
  let updated = 0;
  let errors = 0;

  const entries = Object.entries(PRICING_URLS);
  console.log(`[pricing-detector] Seeding ${entries.length} pricing URLs into DB...`);

  const BATCH = 10;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async ([slug, url]) => {
        const { error } = await admin
          .from('apis')
          .update({ pricing_url: url })
          .eq('slug', slug);

        if (error) {
          console.error(`[pricing-detector] Failed to set pricing_url for ${slug}:`, error.message);
          errors++;
        } else {
          updated++;
        }
      })
    );
  }

  console.log(`[pricing-detector] Seeded ${updated} pricing URLs, ${errors} errors`);
  return { updated, errors };
}
