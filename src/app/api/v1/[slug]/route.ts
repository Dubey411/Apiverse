import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { buildSandboxFixtureResponse } from '@/lib/apiverse-keys/responses';
import { hashWorkspaceApiKey } from '@/lib/apiverse-keys/crypto';
import { findWorkspaceApiKeyForAdminByHash, recordWorkspaceApiUsageForAdmin } from '@/lib/apiverse-keys/repository';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUnifiedApiBySlug } from '@/lib/apiMarketplaceData';

function getPlainKey(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return request.headers.get('x-api-key')?.trim() ?? '';
}

async function parseBody(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function handleTrackedRequest(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startedAt = Date.now();
  const { slug } = await params;
  const requestId = randomUUID();
  const api = getUnifiedApiBySlug(slug);

  if (!api) {
    return NextResponse.json({ error: 'Unknown API.' }, { status: 404 });
  }

  const plainKey = getPlainKey(request);
  if (!plainKey) {
    return NextResponse.json({
      error: 'Missing API key. Send Authorization: Bearer <key> or X-API-Key.',
      request_id: requestId,
    }, { status: 401 });
  }

  const body = await parseBody(request);
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());

  // Single admin client shared across auth + usage recording.
  const admin = createAdminClient();
  const keyHash = hashWorkspaceApiKey(plainKey);
  const keyRow = await findWorkspaceApiKeyForAdminByHash(admin, keyHash);

  if (!keyRow || keyRow.api_slug !== slug) {
    return NextResponse.json({
      error: 'Invalid API key for this API.',
      request_id: requestId,
    }, { status: 403 });
  }

  let statusCode = 200;
  let responseBody: Record<string, unknown>;

  if (keyRow.environment === 'live') {
    statusCode = 501;
    responseBody = {
      success: false,
      request_id: requestId,
      api: {
        slug,
        name: api.catalog.product,
      },
      error: 'Live passthrough is not configured yet for this API.',
      meta: {
        tracked_by: 'APIverse',
        environment_mode: 'live_pending_provider_passthrough',
        note: 'This key is real and analytics is real, but upstream provider forwarding is not configured yet. Sandbox keys return APIverse-owned fixtures.',
        docs_path: `/api-marketplace/${slug}`,
      },
    };
  } else {
    responseBody = buildSandboxFixtureResponse({
      slug,
      body,
      query,
      requestId,
    });
  }

  const latencyMs = Math.max(Date.now() - startedAt, 1);

  // Reuse the already-fetched keyRow — zero extra DB reads here.
  const trackedKey = await recordWorkspaceApiUsageForAdmin(admin, keyRow, {
    statusCode,
    latencyMs,
    requestMethod: request.method,
    requestPath: `/api/v1/${slug}`,
    requestId,
  });

  return NextResponse.json({
    ...responseBody,
    workspace: {
      environment: trackedKey?.environment ?? keyRow.environment,
      tracked_calls: trackedKey?.totalRequests ?? keyRow.total_requests ?? 0,
      key_prefix: trackedKey?.keyPrefix ?? keyRow.key_prefix,
    },
  }, { status: statusCode });
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  return handleTrackedRequest(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  return handleTrackedRequest(request, context);
}
