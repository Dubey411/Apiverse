import { ALL_APIS } from '@/lib/apiMarketplaceData';
import { recommendApisForQuestionAsync, type ApiRecommendation } from '@/lib/api-recommendations';

const CAPABILITY_OPTIONS = [
  'AI chatbot',
  'Translation and voice',
  'Payments',
  'KYC and identity',
  'SMS, email, and OTP',
  'Maps and location',
  'Analytics and monitoring',
  'Search and discovery',
  'Cloud and database',
  'Social and content',
  'Weather and data',
];

const STAGE_OPTIONS = ['prototype', 'production', 'enterprise'] as const;
const REGION_OPTIONS = ['India focused', 'Global product', 'No preference'] as const;
const PRIORITY_OPTIONS = ['Low cost', 'Fast setup', 'Best quality', 'Lowest latency', 'Most reliable'] as const;

const CAPABILITY_CATEGORY_HINTS: Record<string, string[]> = {
  'AI chatbot': ['AI / ML', 'AI'],
  'Translation and voice': ['AI / ML', 'AI'],
  Payments: ['Payments', 'Fintech'],
  'KYC and identity': ['Identity', 'Government', 'Fintech'],
  'SMS, email, and OTP': ['Messaging'],
  'Maps and location': ['Maps'],
  'Analytics and monitoring': ['Analytics'],
  'Search and discovery': ['Search'],
  'Cloud and database': ['Cloud'],
  'Social and content': ['Social'],
  'Weather and data': ['Weather', 'Government'],
};

export interface ApiPlanCapability {
  name: string;
  whyNeeded: string;
  recommendations: ApiRecommendation[];
}

export interface ApiPlanResult {
  source: 'gemini' | 'sarvam' | 'fallback';
  projectSummary: string;
  projectType: string;
  stage: typeof STAGE_OPTIONS[number];
  region: typeof REGION_OPTIONS[number];
  priority: typeof PRIORITY_OPTIONS[number];
  capabilities: ApiPlanCapability[];
  followUpQuestions: string[];
}

interface ExtractedPlan {
  projectSummary: string;
  projectType: string;
  stage: typeof STAGE_OPTIONS[number];
  region: typeof REGION_OPTIONS[number];
  priority: typeof PRIORITY_OPTIONS[number];
  capabilities: Array<{
    name: string;
    whyNeeded: string;
    searchQuery: string;
  }>;
  followUpQuestions: string[];
}

function isConfiguredSecret(value: string | undefined, placeholder: string): value is string {
  return Boolean(value && value.trim() && !value.toLowerCase().includes(placeholder));
}

function normalizeOption<T extends readonly string[]>(value: unknown, options: T, fallback: T[number]): T[number] {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
    ? value as T[number]
    : fallback;
}

function normalizeCapabilityName(value: unknown) {
  if (typeof value !== 'string') return 'General API support';
  const direct = CAPABILITY_OPTIONS.find((option) => option.toLowerCase() === value.toLowerCase());
  return direct ?? (value.trim().slice(0, 80) || 'General API support');
}

function parseModelJsonText(text: string | undefined): ExtractedPlan | null {
  if (!text) return null;

  try {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const normalized = firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;
    const parsed = JSON.parse(normalized) as Record<string, unknown>;
    const capabilities = Array.isArray(parsed.capabilities) ? parsed.capabilities : [];
    return {
      projectSummary: typeof parsed.projectSummary === 'string' ? parsed.projectSummary : 'Project requirements extracted from the user message.',
      projectType: typeof parsed.projectType === 'string' ? parsed.projectType : 'Application',
      stage: normalizeOption(parsed.stage, STAGE_OPTIONS, 'prototype'),
      region: normalizeOption(parsed.region, REGION_OPTIONS, 'No preference'),
      priority: normalizeOption(parsed.priority, PRIORITY_OPTIONS, 'Fast setup'),
      capabilities: capabilities.slice(0, 8).map((item) => {
        const capability = item as Record<string, unknown>;
        const name = normalizeCapabilityName(capability.name);
        return {
          name,
          whyNeeded: typeof capability.whyNeeded === 'string'
            ? capability.whyNeeded
            : `${name} is likely needed for this project.`,
          searchQuery: typeof capability.searchQuery === 'string'
            ? capability.searchQuery
            : name,
        };
      }),
      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions.filter((item): item is string => typeof item === 'string').slice(0, 3)
        : [],
    };
  } catch {
    return null;
  }
}

function extractGeminiText(payload: unknown) {
  const response = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();
}

function extractSarvamText(payload: unknown) {
  const response = payload as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ text?: string; type?: string }>;
      };
    }>;
  };
  const content = response.choices?.[0]?.message?.content;

  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => item.text ?? '')
      .join('')
      .trim();
  }

  return undefined;
}

function buildPlannerPrompt(message: string) {
  const catalogCategories = Array.from(new Set(ALL_APIS.map((api) => api.category))).join(', ');

  return {
    system: `You extract API planning requirements for APIverse. Do not invent provider names. Return only valid JSON with no markdown. Available catalog categories: ${catalogCategories}. Capability names should be chosen from: ${CAPABILITY_OPTIONS.join(', ')}.`,
    user: `Project description: ${message}`,
  };
}

const plannerSchema = {
  type: 'object',
  properties: {
    projectSummary: { type: 'string' },
    projectType: { type: 'string' },
    stage: { type: 'string', enum: STAGE_OPTIONS },
    region: { type: 'string', enum: REGION_OPTIONS },
    priority: { type: 'string', enum: PRIORITY_OPTIONS },
    capabilities: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          whyNeeded: { type: 'string' },
          searchQuery: { type: 'string' },
        },
        required: ['name', 'whyNeeded', 'searchQuery'],
      },
    },
    followUpQuestions: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string' },
    },
  },
  required: ['projectSummary', 'projectType', 'stage', 'region', 'priority', 'capabilities', 'followUpQuestions'],
};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function inferFallbackPlan(message: string): ExtractedPlan {
  const lower = message.toLowerCase();
  const capabilities: ExtractedPlan['capabilities'] = [];

  const add = (name: string, whyNeeded: string, searchQuery: string) => {
    if (!capabilities.some((capability) => capability.name === name)) {
      capabilities.push({ name, whyNeeded, searchQuery });
    }
  };

  if (/(chat|assistant|ai|copilot|llm|generate|summar)/.test(lower)) {
    add('AI chatbot', 'The product needs model reasoning, generation, or conversational behavior.', 'AI chatbot assistant LLM generation');
  }
  if (/(translate|translation|voice|speech|tts|stt|language|hindi|indic)/.test(lower)) {
    add('Translation and voice', 'The product mentions language, speech, or voice workflows.', 'translation voice speech language Indic multilingual');
  }
  if (/(pay|payment|checkout|billing|subscription|payout|upi|transaction)/.test(lower)) {
    add('Payments', 'The product needs money movement, checkout, billing, or payouts.', 'payment checkout billing subscription payout UPI transaction');
  }
  if (/(kyc|identity|verify|verification|aadhaar|pan|gst|compliance|onboard)/.test(lower)) {
    add('KYC and identity', 'The product needs user, merchant, or business verification.', 'KYC identity verification onboarding Aadhaar PAN GST compliance');
  }
  if (/(otp|sms|email|notification|message|whatsapp|alert)/.test(lower)) {
    add('SMS, email, and OTP', 'The product needs user notifications, OTP, or transactional messaging.', 'OTP SMS email notification messaging delivery');
  }
  if (/(map|maps|location|delivery|route|address|geo|place)/.test(lower)) {
    add('Maps and location', 'The product needs location search, routing, addresses, or delivery movement.', 'maps location route tracking address geocoding places');
  }
  if (/(analytics|monitor|tracking|error|logs|observability|metric)/.test(lower)) {
    add('Analytics and monitoring', 'The product needs usage, reliability, or error visibility.', 'analytics monitoring error tracking observability logs metrics');
  }
  if (/(search|recommend|discover|catalog|filter)/.test(lower)) {
    add('Search and discovery', 'The product needs searchable content, recommendations, or discovery.', 'search discovery recommendation full text faceted search');
  }
  if (/(database|storage|cloud|serverless|postgres|redis|host)/.test(lower)) {
    add('Cloud and database', 'The product mentions backend infrastructure, storage, or hosting needs.', 'cloud database serverless storage postgres redis hosting');
  }
  if (/(weather|news|dataset|data)/.test(lower)) {
    add('Weather and data', 'The product needs external data feeds or public datasets.', 'weather news data dataset government data');
  }

  if (capabilities.length === 0) {
    add('Search and discovery', 'The requirement is broad, so start with discovery APIs and compare adjacent categories.', message);
  }

  return {
    projectSummary: message.slice(0, 220),
    projectType: lower.includes('delivery') ? 'Delivery application' : lower.includes('fintech') ? 'Fintech application' : 'Application',
    stage: lower.includes('enterprise') ? 'enterprise' : lower.includes('production') || lower.includes('live') ? 'production' : 'prototype',
    region: /(india|indian|upi|aadhaar|pan|gst|hindi|indic)/.test(lower) ? 'India focused' : 'No preference',
    priority: lower.includes('cheap') || lower.includes('free') || lower.includes('cost') ? 'Low cost' : lower.includes('reliable') || lower.includes('stable') ? 'Most reliable' : 'Fast setup',
    capabilities,
    followUpQuestions: [
      'Do you need production SLAs or is this still a prototype?',
      'Will users be mainly in India or global?',
      'Do you prefer lowest cost or fastest setup?',
    ],
  };
}

async function extractWithGemini(message: string): Promise<ExtractedPlan | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isConfiguredSecret(apiKey, 'your-gemini-api-key')) return null;

  const { system, user } = buildPlannerPrompt(message);
  const model = process.env.GEMINI_API_MODEL || 'gemini-2.5-flash-lite';
  try {
    const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: system }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: user }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: 'application/json',
          response_schema: plannerSchema,
        },
      }),
    }, 8000);

    if (!response.ok) return null;
    return parseModelJsonText(extractGeminiText(await response.json()));
  } catch (error) {
    console.warn('[APIverse Planner] Gemini unavailable:', error);
    return null;
  }
}

async function extractWithSarvam(message: string): Promise<ExtractedPlan | null> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!isConfiguredSecret(apiKey, 'your-sarvam-api-key')) return null;

  const { system, user } = buildPlannerPrompt(message);
  try {
    const response = await fetchWithTimeout('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        model: process.env.SARVAM_API_MODEL || 'sarvam-30b',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      }),
    }, 6000);

    if (!response.ok) return null;
    return parseModelJsonText(extractSarvamText(await response.json()));
  } catch (error) {
    console.warn('[APIverse Planner] Sarvam unavailable:', error);
    return null;
  }
}

async function buildPlan(extracted: ExtractedPlan, source: ApiPlanResult['source']): Promise<ApiPlanResult> {
  const capabilities = (
    await Promise.all(
      extracted.capabilities.map(async (capability) => {
        const query = [
          capability.searchQuery,
          capability.name,
          extracted.stage,
          extracted.region,
          extracted.priority,
        ].join(' ');
        const allMatches = await recommendApisForQuestionAsync(query, 18);
        const categoryHints = CAPABILITY_CATEGORY_HINTS[capability.name] ?? [];
        const categoryMatches = categoryHints.length
          ? allMatches.filter((recommendation) => categoryHints.includes(recommendation.category))
          : allMatches;
        return {
          name: capability.name,
          whyNeeded: capability.whyNeeded,
          recommendations: (categoryMatches.length >= 3 ? categoryMatches : allMatches).slice(0, 3),
        };
      })
    )
  ).filter((capability) => capability.recommendations.length > 0);

  return {
    source,
    projectSummary: extracted.projectSummary,
    projectType: extracted.projectType,
    stage: extracted.stage,
    region: extracted.region,
    priority: extracted.priority,
    capabilities,
    followUpQuestions: extracted.followUpQuestions,
  };
}

export async function planApisForProject(message: string): Promise<ApiPlanResult> {
  const geminiPlan = await extractWithGemini(message);
  if (geminiPlan) return buildPlan(geminiPlan, 'gemini');

  const sarvamPlan = await extractWithSarvam(message);
  if (sarvamPlan) return buildPlan(sarvamPlan, 'sarvam');

  return buildPlan(inferFallbackPlan(message), 'fallback');
}

