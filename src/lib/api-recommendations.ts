import { ALL_APIS, getOfficialProviderUrl } from '@/lib/apiMarketplaceData';

type ApiItem = (typeof ALL_APIS)[number];

// Lightweight shape for DB-sourced APIs (subset of UnifiedApiBase)
interface DbApiItem {
  slug: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  tags: string[];
  pricing: string;
  pricingTier: string;
  rating: number;
  reviews: number;
  uptime: number;
  latency: string;
  version: string;
  trending: boolean;
  sdks: string[];
  monthlyFree: string;
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'api',
  'apis',
  'app',
  'application',
  'build',
  'building',
  'for',
  'from',
  'i',
  'in',
  'into',
  'is',
  'my',
  'need',
  'of',
  'on',
  'our',
  'please',
  'project',
  'system',
  'that',
  'the',
  'to',
  'user',
  'users',
  'want',
  'we',
  'with',
]);

const INTENT_KEYWORDS: Record<string, string[]> = {
  ai: ['ai', 'chatbot', 'assistant', 'copilot', 'llm', 'prompt', 'summarize', 'generate', 'agent', 'model'],
  translation: ['translate', 'translation', 'language', 'indic', 'hindi', 'voice', 'speech', 'tts', 'stt', 'transliteration'],
  payments: ['payment', 'checkout', 'subscription', 'billing', 'invoice', 'payout', 'upi', 'settlement', 'transaction'],
  identity: ['kyc', 'identity', 'verify', 'verification', 'aadhaar', 'pan', 'gst', 'onboarding', 'compliance'],
  messaging: ['sms', 'email', 'otp', 'message', 'notification', 'whatsapp', 'delivery'],
  maps: ['map', 'maps', 'location', 'place', 'places', 'address', 'route', 'geocode', 'geo'],
  analytics: ['analytics', 'events', 'monitor', 'monitoring', 'error', 'logs', 'observability', 'funnel', 'tracking'],
  search: ['search', 'recommend', 'recommendation', 'index', 'query', 'fulltext', 'full-text'],
  data: ['weather', 'news', 'dataset', 'data', 'government', 'open data'],
};

export interface ApiRecommendation {
  slug: string;
  name: string;
  provider: string;
  category: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  description: string;
  pricing: string;
  latency: string;
  uptime: number;
  monthlyFree: string;
  providerUrl: string;
  reasons: string[];
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#. -]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function apiDocument(api: DbApiItem) {
  return [
    api.name,
    api.provider,
    api.description,
    api.category,
    api.pricing,
    api.monthlyFree,
    api.version,
    ...api.tags,
    ...api.sdks,
  ].join(' ');
}

function termFrequency(tokens: string[]) {
  const map = new Map<string, number>();
  for (const token of tokens) {
    map.set(token, (map.get(token) ?? 0) + 1);
  }
  return map;
}

function cosineScore(queryTokens: string[], apiTokens: string[], documentFrequencies: Map<string, number>, totalDocs: number) {
  const queryTf = termFrequency(queryTokens);
  const apiTf = termFrequency(apiTokens);
  const vocabulary = new Set([...queryTf.keys(), ...apiTf.keys()]);
  let dot = 0;
  let queryNorm = 0;
  let apiNorm = 0;

  for (const token of vocabulary) {
    const idf = Math.log((totalDocs + 1) / ((documentFrequencies.get(token) ?? 0) + 1)) + 1;
    const queryWeight = (queryTf.get(token) ?? 0) * idf;
    const apiWeight = (apiTf.get(token) ?? 0) * idf;
    dot += queryWeight * apiWeight;
    queryNorm += queryWeight ** 2;
    apiNorm += apiWeight ** 2;
  }

  if (!queryNorm || !apiNorm) return 0;
  return dot / (Math.sqrt(queryNorm) * Math.sqrt(apiNorm));
}

function detectIntents(queryTokens: string[]) {
  const queryText = queryTokens.join(' ');
  return Object.entries(INTENT_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => queryText.includes(keyword)))
    .map(([intent]) => intent);
}

function intentBoost(api: DbApiItem, intents: string[]) {
  const text = apiDocument(api).toLowerCase();
  let boost = 0;
  const reasons: string[] = [];

  for (const intent of intents) {
    const keywords = INTENT_KEYWORDS[intent] ?? [];
    const matches = keywords.filter((keyword) => text.includes(keyword));
    if (matches.length > 0) {
      boost += Math.min(matches.length * 5, 18);
      reasons.push(`Matches ${intent} intent through ${matches.slice(0, 2).join(', ')}.`);
    }
  }

  return { boost, reasons };
}

function qualityBoost(api: DbApiItem) {
  let boost = 0;
  const reasons: string[] = [];

  if (api.rating >= 4.7) {
    boost += 7;
    reasons.push(`Strong rating signal: ${api.rating}/5.`);
  }
  if (api.uptime >= 99.9) {
    boost += 6;
    reasons.push(`${api.uptime}% uptime signal.`);
  }
  if (api.pricingTier === 'free' || api.pricingTier === 'freemium') {
    boost += 5;
    reasons.push(`Easy evaluation path: ${api.pricing}.`);
  }
  if (api.sdks.length >= 4) {
    boost += 4;
    reasons.push(`SDK coverage includes ${api.sdks.slice(0, 3).join(', ')}.`);
  }

  return { boost, reasons };
}

function scoreApis(apis: DbApiItem[], question: string, limit: number): ApiRecommendation[] {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return [];

  const apiTokensBySlug = new Map(apis.map((api) => [api.slug, tokenize(apiDocument(api))]));
  const documentFrequencies = new Map<string, number>();

  for (const tokens of apiTokensBySlug.values()) {
    for (const token of new Set(tokens)) {
      documentFrequencies.set(token, (documentFrequencies.get(token) ?? 0) + 1);
    }
  }

  const intents = detectIntents(queryTokens);
  const totalDocs = apis.length;

  return apis
    .map((api) => {
      const apiTokens = apiTokensBySlug.get(api.slug) ?? [];
      const semanticScore = cosineScore(queryTokens, apiTokens, documentFrequencies, totalDocs) * 62;
      const boostedIntent = intentBoost(api, intents);
      const boostedQuality = qualityBoost(api);
      const exactMatches = queryTokens.filter((token) => apiTokens.includes(token));
      const score = Math.min(99, Math.round(semanticScore + boostedIntent.boost + boostedQuality.boost + Math.min(exactMatches.length * 3, 12)));
      const reasons = [
        ...boostedIntent.reasons,
        exactMatches.length ? `Directly matches ${exactMatches.slice(0, 3).join(', ')} from the question.` : '',
        ...boostedQuality.reasons,
      ].filter(Boolean).slice(0, 4);

      return {
        slug: api.slug,
        name: api.name,
        provider: api.provider,
        category: api.category,
        score,
        confidence: score >= 72 ? 'high' as const : score >= 48 ? 'medium' as const : 'low' as const,
        description: api.description,
        pricing: api.pricing,
        latency: api.latency,
        uptime: api.uptime,
        monthlyFree: api.monthlyFree,
        providerUrl: getOfficialProviderUrl(api.slug, api.provider),
        reasons: reasons.length ? reasons : ['General metadata match from API description, tags, and provider profile.'],
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

/** Synchronous version using static catalog — used by client-side code and as fallback */
export function recommendApisForQuestion(question: string, limit = 6): ApiRecommendation[] {
  return scoreApis(ALL_APIS as unknown as DbApiItem[], question, limit);
}

/**
 * Async version that tries DB data first, falls back to static.
 * Safe to call from server-side API routes.
 */
export async function recommendApisForQuestionAsync(question: string, limit = 6): Promise<ApiRecommendation[]> {
  try {
    // Lazy import to avoid pulling DB deps into client bundles
    const { getAllApis } = await import('@/lib/repositories/api.repository');
    const { apis, source } = await getAllApis();
    if (source === 'database' && apis.length > 0) {
      return scoreApis(apis as unknown as DbApiItem[], question, limit);
    }
  } catch {
    // Fall through to static
  }
  return recommendApisForQuestion(question, limit);
}
