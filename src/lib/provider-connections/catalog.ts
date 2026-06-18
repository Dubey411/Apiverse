import type { ProviderDefinition } from '@/lib/provider-connections/types';

export const providerCatalog: ProviderDefinition[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'Verify an OpenAI API key and keep a lightweight connection record in APIverse.',
    authType: 'Bearer API key',
    docsUrl: 'https://platform.openai.com/docs/',
    defaultBaseUrl: 'https://api.openai.com',
    supportsUsageSync: true,
    fields: [
      { key: 'apiKey', label: 'API key', placeholder: 'sk-...', secret: true, helpText: 'Project or service account key from OpenAI.' },
    ],
  },
  {
    id: 'stripe',
    label: 'Stripe',
    description: 'Connect a Stripe secret key and sync payment intent activity.',
    authType: 'Secret key',
    docsUrl: 'https://docs.stripe.com/api',
    defaultBaseUrl: 'https://api.stripe.com',
    supportsUsageSync: true,
    fields: [
      { key: 'secretKey', label: 'Secret key', placeholder: 'sk_live_...', secret: true, helpText: 'Use a test key for sandbox and a live key for production.' },
    ],
  },
  {
    id: 'twilio',
    label: 'Twilio',
    description: 'Connect Twilio account credentials and sync usage records.',
    authType: 'Account SID + Auth Token',
    docsUrl: 'https://www.twilio.com/docs/usage/api/usage-record',
    defaultBaseUrl: 'https://api.twilio.com',
    supportsUsageSync: true,
    fields: [
      { key: 'accountSid', label: 'Account SID', placeholder: 'AC...', helpText: 'Found in your Twilio console.' },
      { key: 'authToken', label: 'Auth Token', placeholder: 'Your auth token', secret: true, helpText: 'Twilio auth token for this account.' },
    ],
  },
  {
    id: 'sarvam',
    label: 'Sarvam AI',
    description: 'Connect a Sarvam API subscription key for verification and connection tracking.',
    authType: 'API Subscription Key',
    docsUrl: 'https://docs.sarvam.ai/api-reference-docs/authentication',
    defaultBaseUrl: 'https://api.sarvam.ai',
    supportsUsageSync: false,
    fields: [
      { key: 'apiSubscriptionKey', label: 'API Subscription Key', placeholder: 'Your Sarvam key', secret: true, helpText: 'Passed as api-subscription-key.' },
    ],
  },
  {
    id: 'generic',
    label: 'Generic HTTP API',
    description: 'Connect any HTTP API with a bearer key and optional health endpoint.',
    authType: 'Bearer API key',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication',
    supportsUsageSync: false,
    fields: [
      { key: 'apiKey', label: 'API key', placeholder: 'Bearer or token value', secret: true },
      { key: 'baseUrl', label: 'Base URL', placeholder: 'https://api.example.com' },
      { key: 'verifyPath', label: 'Verification path', placeholder: '/health or /v1/me', helpText: 'GET path used to validate the key.' },
    ],
  },
];

export function getProviderDefinition(providerId: string) {
  return providerCatalog.find((provider) => provider.id === providerId) ?? null;
}
