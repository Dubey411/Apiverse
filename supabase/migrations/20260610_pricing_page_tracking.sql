-- Migration: 20260610_pricing_page_tracking.sql
-- Adds real-time pricing page change detection columns

-- Add pricing_url and hash columns to apis table
ALTER TABLE public.apis
  ADD COLUMN IF NOT EXISTS pricing_url TEXT,
  ADD COLUMN IF NOT EXISTS pricing_page_hash TEXT,
  ADD COLUMN IF NOT EXISTS pricing_page_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pricing_changed_flag BOOLEAN NOT NULL DEFAULT false;

-- Add change_type to pricing_history so we can track automated vs manual
ALTER TABLE public.pricing_history
  ADD COLUMN IF NOT EXISTS change_type TEXT NOT NULL DEFAULT 'auto_detected' CHECK (change_type IN ('auto_detected', 'page_hash_change', 'manual')),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index for finding APIs that need pricing checks
CREATE INDEX IF NOT EXISTS apis_pricing_checked_idx ON public.apis(pricing_page_checked_at ASC NULLS FIRST);
CREATE INDEX IF NOT EXISTS apis_pricing_changed_idx ON public.apis(pricing_changed_flag) WHERE pricing_changed_flag = true;
