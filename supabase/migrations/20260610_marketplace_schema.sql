-- SQL Migration: 20260610_marketplace_schema.sql
-- Create extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create API Categories Table
CREATE TABLE IF NOT EXISTS public.api_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Create Core APIs Table
CREATE TABLE IF NOT EXISTS public.apis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.api_categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  documentation_url TEXT,
  website_url TEXT,
  auth_method TEXT NOT NULL, -- 'none', 'bearer', 'api_key', etc.
  base_url TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  uptime NUMERIC(5, 2) NOT NULL DEFAULT 99.90, -- e.g. 99.95%
  latency INT NOT NULL DEFAULT 150, -- in ms
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0, -- e.g. 4.85
  reviews INT NOT NULL DEFAULT 0,
  trending BOOLEAN NOT NULL DEFAULT false,
  mark TEXT, -- e.g. 'OA', 'CG'
  mark_class_name TEXT, -- CSS class names
  accent TEXT, -- e.g. 'from-[#201612] via-[#121a20] to-[#0d2530]'
  eyebrow TEXT,
  overview TEXT,
  how_it_works TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Index for searching and filtering APIs
CREATE INDEX IF NOT EXISTS apis_slug_idx ON public.apis(slug);
CREATE INDEX IF NOT EXISTS apis_category_id_idx ON public.apis(category_id);
CREATE INDEX IF NOT EXISTS apis_rating_idx ON public.apis(rating DESC);

-- 3. Create API Pricing Table
CREATE TABLE IF NOT EXISTS public.api_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE UNIQUE,
  pricing_tier TEXT NOT NULL CHECK (pricing_tier IN ('free', 'freemium', 'payg', 'paid')),
  price TEXT NOT NULL, -- formatted string e.g. '$0.25 / 1M input tokens'
  numeric_price NUMERIC(10, 4) NOT NULL DEFAULT 0.0, -- for change calculations
  access TEXT NOT NULL DEFAULT 'Free trial + premium',
  monthly_free TEXT, -- e.g. '$5 credits', '60 req/min'
  sandbox_limit TEXT,
  premium_limit TEXT,
  pricing_notes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Create Pricing History Table
CREATE TABLE IF NOT EXISTS public.pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE,
  old_price NUMERIC(10, 4) NOT NULL,
  new_price NUMERIC(10, 4) NOT NULL,
  old_price_text TEXT,
  new_price_text TEXT,
  change_amount NUMERIC(10, 4) NOT NULL,
  change_percentage NUMERIC(6, 2) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS pricing_history_api_idx ON public.pricing_history(api_id, changed_at DESC);

-- 5. Create API Features Table
CREATE TABLE IF NOT EXISTS public.api_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE UNIQUE,
  best_for TEXT[] NOT NULL DEFAULT '{}',
  free_plan TEXT[] NOT NULL DEFAULT '{}',
  premium_plan TEXT[] NOT NULL DEFAULT '{}'
);

-- 6. Create API Endpoints Table
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL, -- e.g. 'POST /v1/responses'
  protocol TEXT NOT NULL DEFAULT 'HTTPS + JSON',
  sample_request TEXT,
  sample_response TEXT,
  response_highlights TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS api_endpoints_api_idx ON public.api_endpoints(api_id);

-- 7. Create API SDK Support Table
CREATE TABLE IF NOT EXISTS public.api_sdk_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE UNIQUE,
  sdks TEXT[] NOT NULL DEFAULT '{}'
);

-- 8. Create API Status History Table
CREATE TABLE IF NOT EXISTS public.api_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'paused')),
  latency_ms INT NOT NULL DEFAULT 0,
  error_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS api_status_history_api_checked_idx ON public.api_status_history(api_id, checked_at DESC);

-- 9. Create API Reviews Table
CREATE TABLE IF NOT EXISTS public.api_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS api_reviews_api_idx ON public.api_reviews(api_id, created_at DESC);

-- 10. Create API Integrations Table
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES public.apis(id) ON DELETE CASCADE UNIQUE,
  steps TEXT[] NOT NULL DEFAULT '{}'
);

-- RLS & Policies Setup
ALTER TABLE public.api_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_sdk_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

-- Select policies (Allow anyone to view marketplace content)
CREATE POLICY "Allow public select on api_categories" ON public.api_categories FOR SELECT USING (true);
CREATE POLICY "Allow public select on apis" ON public.apis FOR SELECT USING (true);
CREATE POLICY "Allow public select on api_pricing" ON public.api_pricing FOR SELECT USING (true);
CREATE POLICY "Allow public select on pricing_history" ON public.pricing_history FOR SELECT USING (true);
CREATE POLICY "Allow public select on api_features" ON public.api_features FOR SELECT USING (true);
CREATE POLICY "Allow public select on api_endpoints" ON public.api_endpoints FOR SELECT USING (true);
CREATE POLICY "Allow public select on api_sdk_support" ON public.api_sdk_support FOR SELECT USING (true);
CREATE POLICY "Allow public select on api_status_history" ON public.api_status_history FOR SELECT USING (true);
CREATE POLICY "Allow public select on api_reviews" ON public.api_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public select on api_integrations" ON public.api_integrations FOR SELECT USING (true);

-- Drop procedure public.set_updated_at if exists since it was created in monitoring check
-- Trigger for setting updated_at
DROP TRIGGER IF EXISTS set_apis_updated_at ON public.apis;
CREATE TRIGGER set_apis_updated_at
BEFORE UPDATE ON public.apis
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_api_pricing_updated_at ON public.api_pricing;
CREATE TRIGGER set_api_pricing_updated_at
BEFORE UPDATE ON public.api_pricing
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
