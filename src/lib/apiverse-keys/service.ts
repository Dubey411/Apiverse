import { apiCatalog, getUnifiedApiBySlug } from '@/lib/apiMarketplaceData';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  buildWorkspaceKeyFragments,
  generateWorkspaceApiKey,
  hashWorkspaceApiKey,
} from '@/lib/apiverse-keys/crypto';
import {
  findWorkspaceApiKeyForAdminByHash,
  insertWorkspaceApiKey,
  isSchemaMissingError,
  listWorkspaceAnalyticsForUser,
  recordWorkspaceApiUsageForAdmin,
  revokeWorkspaceApiKeyForUser,
} from '@/lib/apiverse-keys/repository';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ApiKeyCatalogOption,
  CreateWorkspaceApiKeyInput,
  WorkspaceAnalyticsSummary,
} from '@/lib/apiverse-keys/types';

type WorkspaceApiKeyLookup = NonNullable<Awaited<ReturnType<typeof findWorkspaceApiKeyForAdminByHash>>>;
type WorkspaceUsageRecord = Awaited<ReturnType<typeof recordWorkspaceApiUsageForAdmin>>;

export function getApiKeyCatalogOptions(): ApiKeyCatalogOption[] {
  return apiCatalog
    .map((item) => ({
      slug: item.slug,
      provider: item.provider,
      product: item.product,
      category: item.category,
    }))
    .sort((a, b) => a.product.localeCompare(b.product));
}

export async function getWorkspaceAnalyticsSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<WorkspaceAnalyticsSummary> {
  const adminClient = createAdminClient();
  return listWorkspaceAnalyticsForUser(adminClient, userId);
}

export async function issueWorkspaceApiKey(
  supabase: Parameters<typeof insertWorkspaceApiKey>[0],
  userId: string,
  input: CreateWorkspaceApiKeyInput,
) {
  const api = getUnifiedApiBySlug(input.apiSlug);

  if (!api) {
    throw new Error('Unknown API. Pick one of the listed APIverse APIs first.');
  }

  const plainKey = generateWorkspaceApiKey(input.environment);
  const keyHash = hashWorkspaceApiKey(plainKey);
  const fragments = buildWorkspaceKeyFragments(plainKey);

  const key = await insertWorkspaceApiKey(supabase, userId, {
    ...input,
    apiName: api.catalog.product,
    keyPrefix: fragments.keyPrefix,
    keyHash,
    lastFour: fragments.lastFour,
  });

  return {
    key,
    plainKey,
    apiName: api.catalog.product,
  };
}

export async function revokeWorkspaceApiKey(
  supabase: Parameters<typeof revokeWorkspaceApiKeyForUser>[0],
  userId: string,
  keyId: string,
) {
  return revokeWorkspaceApiKeyForUser(supabase, userId, keyId);
}

/**
 * Authenticates the plain key against the given API slug and — if valid —
 * records the usage event in a single logical transaction (1 read + 1 insert
 * + 1 update). This replaces the old two-function pattern that called
 * findWorkspaceApiKeyForAdminByHash twice per proxied request.
 */
export async function authenticateAndRecord({
  plainKey,
  slug,
  requestMethod,
  requestPath,
  latencyMs,
  statusCode,
  requestId,
  usageQuantity,
}: {
  plainKey: string;
  slug: string;
  requestMethod: string;
  requestPath: string;
  latencyMs: number;
  statusCode: number;
  requestId: string;
  usageQuantity?: number;
}): Promise<{ key: WorkspaceApiKeyLookup; tracked: WorkspaceUsageRecord } | null> {
  const admin = createAdminClient();
  const keyHash = hashWorkspaceApiKey(plainKey);
  const row = await findWorkspaceApiKeyForAdminByHash(admin, keyHash);

  if (!row || row.api_slug !== slug) {
    return null;
  }

  const tracked = await recordWorkspaceApiUsageForAdmin(admin, row, {
    statusCode,
    latencyMs,
    requestMethod,
    requestPath,
    requestId,
    usageQuantity,
  });

  return { key: row, tracked };
}

/** @deprecated Use authenticateAndRecord instead to avoid a double DB round-trip. */
export async function authenticateAndTrackWorkspaceRequest({
  plainKey,
  slug,
}: {
  plainKey: string;
  slug: string;
}) {
  const admin = createAdminClient();
  const keyHash = hashWorkspaceApiKey(plainKey);
  const row = await findWorkspaceApiKeyForAdminByHash(admin, keyHash);

  if (!row || row.api_slug !== slug) {
    return null;
  }

  return row;
}

/** @deprecated Use authenticateAndRecord instead to avoid a double DB round-trip. */
export async function recordTrackedWorkspaceRequest({
  plainKey,
  slug,
  requestMethod,
  requestPath,
  latencyMs,
  statusCode,
  requestId,
  usageQuantity,
}: {
  plainKey: string;
  slug: string;
  requestMethod: string;
  requestPath: string;
  latencyMs: number;
  statusCode: number;
  requestId: string;
  usageQuantity?: number;
}) {
  const admin = createAdminClient();
  const keyHash = hashWorkspaceApiKey(plainKey);
  const row = await findWorkspaceApiKeyForAdminByHash(admin, keyHash);

  if (!row || row.api_slug !== slug) {
    return null;
  }

  return recordWorkspaceApiUsageForAdmin(admin, row, {
    statusCode,
    latencyMs,
    requestMethod,
    requestPath,
    requestId,
    usageQuantity,
  });
}

export { isSchemaMissingError };
