import type {
  ConnectionCredentials,
  CreateConnectionInput,
  ProviderEnvironment,
  ProviderSyncResult,
  ProviderVerificationResult,
} from '@/lib/provider-connections/types';
import { getProviderDefinition } from '@/lib/provider-connections/catalog';

interface AdapterContext {
  baseUrl: string;
  credentials: ConnectionCredentials;
  environment: ProviderEnvironment;
}

interface ProviderAdapter {
  verify(context: AdapterContext): Promise<ProviderVerificationResult>;
  sync?(context: AdapterContext): Promise<ProviderSyncResult>;
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function expectJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || `Expected JSON but received ${contentType || 'an empty response'}.`);
  }

  return response.json() as Promise<T>;
}

async function safeText(response: Response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

const openAiAdapter: ProviderAdapter = {
  async verify({ baseUrl, credentials }) {
    const response = await fetch(buildUrl(baseUrl, '/v1/models'), {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `OpenAI rejected the key with ${response.status}.`,
      };
    }

    const payload = await expectJson<{ data?: Array<{ id: string }> }>(response);
    return {
      ok: true,
      message: `Verified against ${payload.data?.length ?? 0} available model records.`,
      accountLabel: 'OpenAI project',
      metadata: {
        modelCount: payload.data?.length ?? 0,
      },
    };
  },
  async sync({ baseUrl, credentials }) {
    const response = await fetch(buildUrl(baseUrl, '/v1/models'), {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        status: 'failed',
        message: `OpenAI sync failed with ${response.status}.`,
        summary: {},
      };
    }

    const payload = await expectJson<{ data?: Array<{ id: string }> }>(response);
    return {
      ok: true,
      status: 'limited',
      message: 'OpenAI connection is verified. Usage sync is currently limited to connection health because provider-side per-key usage exports are not available from this workspace.',
      summary: {
        usageQuantity: payload.data?.length ?? 0,
        usageUnit: 'models visible',
        lastUsedAt: new Date().toISOString(),
      },
      rawPayload: payload,
    };
  },
};

const stripeAdapter: ProviderAdapter = {
  async verify({ baseUrl, credentials }) {
    const response = await fetch(buildUrl(baseUrl, '/v1/account'), {
      headers: {
        Authorization: `Bearer ${credentials.secretKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Stripe rejected the key with ${response.status}.`,
      };
    }

    const payload = await expectJson<{ id?: string; business_profile?: { name?: string } }>(response);
    return {
      ok: true,
      message: 'Stripe account verified successfully.',
      accountLabel: payload.business_profile?.name ?? payload.id ?? 'Stripe account',
      accountRef: payload.id ?? null,
      metadata: payload,
    };
  },
  async sync({ baseUrl, credentials }) {
    const [paymentIntentsResponse, balanceTransactionsResponse] = await Promise.all([
      fetch(buildUrl(baseUrl, '/v1/payment_intents', { limit: 25 }), {
        headers: {
          Authorization: `Bearer ${credentials.secretKey}`,
        },
        cache: 'no-store',
      }),
      fetch(buildUrl(baseUrl, '/v1/balance_transactions', { limit: 25 }), {
        headers: {
          Authorization: `Bearer ${credentials.secretKey}`,
        },
        cache: 'no-store',
      }),
    ]);

    if (!paymentIntentsResponse.ok) {
      return {
        ok: false,
        status: 'failed',
        message: `Stripe usage sync failed with ${paymentIntentsResponse.status}.`,
        summary: {},
      };
    }

    const paymentIntents = await expectJson<{ data?: Array<{ status?: string; created?: number }> }>(paymentIntentsResponse);
    const balanceTransactions = balanceTransactionsResponse.ok
      ? await expectJson<{ data?: Array<{ fee?: number; currency?: string }> }>(balanceTransactionsResponse)
      : { data: [] };

    const intents = paymentIntents.data ?? [];
    const succeeded = intents.filter((item) => item.status === 'succeeded').length;
    const failed = intents.filter((item) => item.status && item.status !== 'succeeded' && item.status !== 'processing').length;
    const estimatedFees = (balanceTransactions.data ?? []).reduce((sum, item) => sum + (item.fee ?? 0), 0) / 100;
    const lastCreated = intents[0]?.created ? new Date(intents[0].created * 1000).toISOString() : new Date().toISOString();

    return {
      ok: true,
      status: 'synced',
      message: 'Stripe payment intents and balance transactions synced.',
      summary: {
        totalRequests: intents.length,
        successRate: intents.length > 0 ? (succeeded / intents.length) * 100 : 100,
        errorCount: failed,
        usageQuantity: intents.length,
        usageUnit: 'payment intents',
        estimatedSpend: estimatedFees,
        currency: balanceTransactions.data?.[0]?.currency?.toUpperCase() ?? 'USD',
        lastUsedAt: lastCreated,
      },
      rawPayload: {
        paymentIntents,
        balanceTransactions,
      },
    };
  },
};

const twilioAdapter: ProviderAdapter = {
  async verify({ baseUrl, credentials }) {
    const accountSid = credentials.accountSid;
    const authToken = credentials.authToken;
    const response = await fetch(buildUrl(baseUrl, `/2010-04-01/Accounts/${accountSid}.json`), {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Twilio rejected the credentials with ${response.status}.`,
      };
    }

    const payload = await expectJson<{ friendly_name?: string; sid?: string }>(response);
    return {
      ok: true,
      message: 'Twilio account verified successfully.',
      accountLabel: payload.friendly_name ?? payload.sid ?? 'Twilio account',
      accountRef: payload.sid ?? null,
      metadata: payload,
    };
  },
  async sync({ baseUrl, credentials }) {
    const accountSid = credentials.accountSid;
    const authToken = credentials.authToken;
    const response = await fetch(
      buildUrl(baseUrl, `/2010-04-01/Accounts/${accountSid}/Usage/Records/Today.json`, { Category: 'sms' }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        status: 'failed',
        message: `Twilio usage sync failed with ${response.status}.`,
        summary: {},
      };
    }

    const payload = await expectJson<{ usage_records?: Array<{ usage?: string; price?: string; price_unit?: string; end_date?: string }> }>(response);
    const record = payload.usage_records?.[0];
    const usageQuantity = record?.usage ? Number(record.usage) : null;
    const estimatedSpend = record?.price ? Math.abs(Number(record.price)) : null;

    return {
      ok: true,
      status: 'synced',
      message: 'Twilio usage records synced.',
      summary: {
        usageQuantity,
        usageUnit: 'messages today',
        estimatedSpend,
        currency: record?.price_unit ?? 'USD',
        lastUsedAt: record?.end_date ? new Date(record.end_date).toISOString() : new Date().toISOString(),
      },
      rawPayload: payload,
    };
  },
};

const sarvamAdapter: ProviderAdapter = {
  async verify({ baseUrl, credentials }) {
    const endpoints = ['/translate', '/v1/translate'];

    for (const path of endpoints) {
      const response = await fetch(buildUrl(baseUrl, path), {
        method: 'OPTIONS',
        headers: {
          'api-subscription-key': credentials.apiSubscriptionKey,
        },
        cache: 'no-store',
      });

      if (response.ok || response.status === 204 || response.status === 405) {
        return {
          ok: true,
          message: 'Sarvam key accepted by the provider edge. Usage sync remains limited until a provider reporting endpoint is available.',
          accountLabel: 'Sarvam workspace',
          metadata: { probePath: path, probeStatus: response.status },
        };
      }
    }

    return {
      ok: false,
      message: 'Sarvam verification probe did not succeed. Recheck the subscription key and base URL.',
    };
  },
  async sync() {
    return {
      ok: true,
      status: 'limited',
      message: 'Sarvam is connected, but provider-side usage sync is not exposed yet. APIverse is tracking connection health only.',
      summary: {
        lastUsedAt: new Date().toISOString(),
      },
    };
  },
};

const genericAdapter: ProviderAdapter = {
  async verify({ baseUrl, credentials }) {
    const verifyPath = credentials.verifyPath || '/';
    const response = await fetch(buildUrl(baseUrl, verifyPath), {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
      },
      cache: 'no-store',
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        message: `The provider rejected the key with ${response.status}.`,
      };
    }

    if (!response.ok && response.status >= 500) {
      return {
        ok: false,
        message: `The provider health probe failed with ${response.status}.`,
      };
    }

    return {
      ok: true,
      message: 'Bearer key probe succeeded.',
      metadata: {
        verifyPath,
        status: response.status,
      },
    };
  },
  async sync({ baseUrl, credentials }) {
    const verifyPath = credentials.verifyPath || '/';
    const response = await fetch(buildUrl(baseUrl, verifyPath), {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok && response.status >= 500) {
      return {
        ok: false,
        status: 'failed',
        message: `Generic provider sync failed with ${response.status}.`,
        summary: {},
      };
    }

    return {
      ok: true,
      status: 'limited',
      message: 'Generic provider sync only verifies the connected endpoint. Rich usage metrics depend on the provider offering reporting APIs.',
      summary: {
        lastUsedAt: new Date().toISOString(),
      },
      rawPayload: await safeText(response),
    };
  },
};

const providerAdapters: Record<string, ProviderAdapter> = {
  openai: openAiAdapter,
  stripe: stripeAdapter,
  twilio: twilioAdapter,
  sarvam: sarvamAdapter,
  generic: genericAdapter,
};

export function resolveBaseUrl(input: Pick<CreateConnectionInput, 'providerId' | 'baseUrl' | 'credentials'>) {
  const provider = getProviderDefinition(input.providerId);
  const candidateFromCredentials = typeof input.credentials.baseUrl === 'string' ? input.credentials.baseUrl : undefined;
  const resolved = input.baseUrl || candidateFromCredentials || provider?.defaultBaseUrl;

  if (!resolved) {
    throw new Error('A base URL is required for this provider connection.');
  }

  return resolved;
}

export function getProviderAdapter(providerId: string) {
  return providerAdapters[providerId] ?? genericAdapter;
}
