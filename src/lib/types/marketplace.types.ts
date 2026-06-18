// ============================================================
// marketplace.types.ts
// TypeScript interfaces matching the Supabase DB schema and
// the unified model consumed by the existing UI components.
// ============================================================

// --------------- Raw DB Row Types ---------------

export interface DbApiCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface DbApi {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category_id: string;
  description: string;
  documentation_url: string | null;
  website_url: string | null;
  auth_method: string;
  base_url: string;
  version: string;
  uptime: number;
  latency: number; // ms
  rating: number;
  reviews: number;
  trending: boolean;
  mark: string | null;
  mark_class_name: string | null;
  accent: string | null;
  eyebrow: string | null;
  overview: string | null;
  how_it_works: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DbApiPricing {
  id: string;
  api_id: string;
  pricing_tier: 'free' | 'freemium' | 'payg' | 'paid';
  price: string;
  numeric_price: number;
  access: string;
  monthly_free: string | null;
  sandbox_limit: string | null;
  premium_limit: string | null;
  pricing_notes: string[];
  created_at: string;
  updated_at: string;
}

export interface DbPricingHistory {
  id: string;
  api_id: string;
  old_price: number;
  new_price: number;
  old_price_text: string | null;
  new_price_text: string | null;
  change_amount: number;
  change_percentage: number;
  changed_at: string;
}

export interface DbApiFeatures {
  id: string;
  api_id: string;
  best_for: string[];
  free_plan: string[];
  premium_plan: string[];
}

export interface DbApiEndpoint {
  id: string;
  api_id: string;
  endpoint: string;
  protocol: string;
  sample_request: string | null;
  sample_response: string | null;
  response_highlights: string[];
  created_at: string;
}

export interface DbApiSdkSupport {
  id: string;
  api_id: string;
  sdks: string[];
}

export interface DbApiStatusHistory {
  id: string;
  api_id: string;
  status: 'healthy' | 'warning' | 'critical' | 'paused';
  latency_ms: number;
  error_rate: number;
  checked_at: string;
}

export interface DbApiReview {
  id: string;
  api_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
}

export interface DbApiIntegration {
  id: string;
  api_id: string;
  steps: string[];
}

// --------------- Enriched DB Row (joined query) ---------------

export interface DbApiEnriched extends DbApi {
  api_categories: DbApiCategory;
  api_pricing: DbApiPricing | null;
  api_features: DbApiFeatures | null;
  api_sdk_support: DbApiSdkSupport | null;
  api_status_history: DbApiStatusHistory[] | null;
  api_endpoints: DbApiEndpoint[] | null;
  api_integrations: DbApiIntegration | null;
}

// --------------- Unified UI Model (matches existing component expectations) ---------------

/** Matches the ALL_APIS "base" shape from apiMarketplaceData.ts */
export interface UnifiedApiBase {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  tags: string[];
  pricing: string;
  pricingTier: 'free' | 'freemium' | 'payg' | 'paid';
  rating: number;
  reviews: number;
  uptime: number;
  latency: string;
  version: string;
  trending: boolean;
  sdks: string[];
  monthlyFree: string;
}

/** Matches ApiCatalogItem from apiMarketplaceData.ts */
export interface UnifiedApiCatalog {
  slug: string;
  provider: string;
  product: string;
  category: string;
  price: string;
  access: string;
  metric: string;
  metricLabel: string;
  latency: string;
  description: string;
  howItWorks: string;
  mark: string;
  markClassName: string;
  accent: string;
  eyebrow: string;
  overview: string;
  bestFor: string[];
  freePlan: string[];
  premiumPlan: string[];
  steps: string[];
  sampleRequest: string;
}

/** Matches ApiDetailContent from apiMarketplaceData.ts */
export interface UnifiedApiDetail {
  baseUrl: string;
  endpoint: string;
  auth: string;
  protocol: string;
  sandboxLimit: string;
  premiumLimit: string;
  successRate: string;
  regions: string[];
  responseHighlights: string[];
  pricingNotes: string[];
  sampleResponse: string;
}

/** Full unified model returned by the repository – identical structure to getUnifiedApiBySlug() */
export interface UnifiedApi {
  base: UnifiedApiBase;
  catalog: UnifiedApiCatalog;
  detail: UnifiedApiDetail;
}

// --------------- Price Change Indicator (for UI badges) ---------------

export interface PriceChangeIndicator {
  slug: string;
  direction: 'up' | 'down' | 'none';
  changePercentage: number;
  changeAmount: number;
  changedAt: string;
  oldPriceText: string | null;
  newPriceText: string | null;
}

// --------------- Category Price Intelligence ---------------

export interface CategoryPriceIntelligence {
  category: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  recentChanges: number;
}

// --------------- Repository Input Types ---------------

export interface UpsertApiInput {
  slug: string;
  name: string;
  provider: string;
  categorySlug: string;
  description: string;
  authMethod: string;
  baseUrl: string;
  version?: string;
  uptime?: number;
  latency?: number;
  rating?: number;
  reviews?: number;
  trending?: boolean;
  tags?: string[];
  mark?: string;
  markClassName?: string;
  accent?: string;
  eyebrow?: string;
  overview?: string;
  howItWorks?: string;
  documentationUrl?: string;
  websiteUrl?: string;
}

export interface UpsertPricingInput {
  apiId: string;
  pricingTier: 'free' | 'freemium' | 'payg' | 'paid';
  price: string;
  numericPrice: number;
  access: string;
  monthlyFree?: string;
  sandboxLimit?: string;
  premiumLimit?: string;
  pricingNotes?: string[];
}

// --------------- API Route Response Shapes ---------------

export interface ApiListResponse {
  apis: UnifiedApiBase[];
  total: number;
  source: 'database' | 'static_fallback';
}

export interface ApiDetailResponse {
  api: UnifiedApi;
  pricingHistory: DbPricingHistory[];
  reviews: DbApiReview[];
  recentStatusCheck: DbApiStatusHistory | null;
  source: 'database' | 'static_fallback';
}

export interface ApiCompareResponse {
  apis: UnifiedApi[];
  source: 'database' | 'static_fallback';
}
