'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Compass,
  ExternalLink,
  Grid3X3,
  List,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { ALL_APIS, getOfficialProviderUrl } from '@/lib/apiMarketplaceData';
import { PriceChangeIndicator, UnifiedApiBase } from '@/lib/types/marketplace.types';

type APIItem = (typeof ALL_APIS)[0];
type RecommendationResult = {
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
};
type ApiPlanResult = {
  source: 'gemini' | 'sarvam' | 'fallback';
  projectSummary: string;
  projectType: string;
  stage: string;
  region: string;
  priority: string;
  capabilities: Array<{
    name: string;
    whyNeeded: string;
    recommendations: RecommendationResult[];
  }>;
  followUpQuestions: string[];
};

const CATEGORY_LABELS = ['All', 'AI / ML', 'Payments', 'Messaging', 'Maps', 'Government', 'Identity', 'Fintech', 'Cloud', 'Analytics', 'Search', 'Social', 'Weather'];
const PRICING_FILTERS = [
  { label: 'All pricing', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Freemium', value: 'freemium' },
  { label: 'Pay as you go', value: 'payg' },
  { label: 'Paid', value: 'paid' },
];

const pricingColors: Record<string, string> = {
  free: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-400/10',
  freemium: 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-400/10',
  payg: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-400/10',
  paid: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-400/10',
};

const categoryColors: Record<string, string> = {
  'AI / ML': 'bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300',
  Payments: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
  Messaging: 'bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
  Maps: 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-300',
  Government: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300',
  Identity: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300',
  Fintech: 'bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300',
  Cloud: 'bg-slate-100 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300',
  Analytics: 'bg-pink-100 text-pink-700 dark:bg-pink-400/10 dark:text-pink-300',
  Search: 'bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300',
  Social: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/10 dark:text-fuchsia-300',
  Weather: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300',
};

const countFormatter = new Intl.NumberFormat('en-US');

const planSourceLabels: Record<ApiPlanResult['source'], string> = {
  gemini: 'Gemini extracted plan',
  sarvam: 'Sarvam extracted plan',
  fallback: 'Fallback extracted plan',
};

const API_NEED_OPTIONS = [
  { id: 'ai-chatbot', label: 'AI chatbot', prompt: 'AI chatbot assistant copilot question answering content generation' },
  { id: 'translation-voice', label: 'Translation / voice', prompt: 'translation voice speech text to speech speech to text Indic language multilingual' },
  { id: 'payments', label: 'Payments', prompt: 'payments checkout subscription billing payout UPI transaction' },
  { id: 'kyc-identity', label: 'KYC / identity', prompt: 'KYC identity verification onboarding Aadhaar PAN GST compliance' },
  { id: 'messages', label: 'SMS / email / OTP', prompt: 'SMS email OTP notification messaging delivery user verification' },
  { id: 'maps', label: 'Maps / location', prompt: 'maps location places address geocoding route planning' },
  { id: 'analytics', label: 'Analytics / monitoring', prompt: 'analytics monitoring events errors logs performance tracking observability' },
  { id: 'search', label: 'Search / discovery', prompt: 'search discovery recommendations full text typo tolerance faceted search' },
];

const PROJECT_STAGE_OPTIONS = [
  { id: 'prototype', label: 'Prototype', prompt: 'free tier easy setup beginner friendly SDK examples' },
  { id: 'production', label: 'Production', prompt: 'production reliability uptime monitoring security rate limits' },
  { id: 'enterprise', label: 'Enterprise', prompt: 'enterprise compliance audit support high volume SLA' },
];

const REGION_OPTIONS = [
  { id: 'india', label: 'India focused', prompt: 'India Indian UPI Aadhaar PAN GST Indic local compliance' },
  { id: 'global', label: 'Global product', prompt: 'global regions international coverage multi region' },
  { id: 'no-preference', label: 'No preference', prompt: 'general purpose API' },
];

const DECISION_OPTIONS = [
  { id: 'cost', label: 'Lowest cost', prompt: 'low cost free freemium generous free tier' },
  { id: 'easy', label: 'Fast setup', prompt: 'easy setup simple auth SDK documentation quick integration' },
  { id: 'quality', label: 'Best quality', prompt: 'best quality high rating mature provider advanced capabilities' },
  { id: 'speed', label: 'Lowest latency', prompt: 'low latency fast response high performance' },
  { id: 'reliability', label: 'Most reliable', prompt: 'reliable uptime stable production monitoring' },
];

export default function MarketplaceContent() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePricing, setActivePricing] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [assistantStep, setAssistantStep] = useState(0);
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [questionResults, setQuestionResults] = useState<RecommendationResult[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [projectMessage, setProjectMessage] = useState('');
  const [apiPlan, setApiPlan] = useState<ApiPlanResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningError, setPlanningError] = useState<string | null>(null);
  // Dynamic DB data — overlays on top of static ALL_APIS
  const [dbApis, setDbApis] = useState<UnifiedApiBase[]>([]);
  const [priceChanges, setPriceChanges] = useState<Record<string, PriceChangeIndicator>>({});
  const [dataSource, setDataSource] = useState<'database' | 'static_fallback'>('static_fallback');
  const { addApi, itemCount, toggleCart, hasItem } = useCart();

  useEffect(() => {
    fetch('/api/apis')
      .then((res) => res.json())
      .then((payload) => {
        if (payload.apis && Array.isArray(payload.apis) && payload.apis.length > 0) {
          setDbApis(payload.apis);
          setPriceChanges(payload.priceChanges ?? {});
          setDataSource(payload.source ?? 'static_fallback');
        }
      })
      .catch(() => {
        // Silent — static fallback remains active
      });
  }, []);

  // Merge DB data over static — DB wins when available
  const mergedApis = useMemo(() => {
    if (dataSource === 'database' && dbApis.length > 0) return dbApis;
    return ALL_APIS as unknown as UnifiedApiBase[];
  }, [dbApis, dataSource]);

  const filtered = useMemo(() => {
    let result = mergedApis;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((api) =>
        api.name.toLowerCase().includes(query) ||
        api.provider.toLowerCase().includes(query) ||
        api.description.toLowerCase().includes(query) ||
        api.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (activeCategory !== 'All') {
      result = result.filter((api) => api.category === activeCategory);
    }

    if (activePricing !== 'all') {
      result = result.filter((api) => api.pricingTier === activePricing);
    }

    return [...result].sort((left, right) => {
      if (sortBy === 'rating') return right.rating - left.rating;
      if (sortBy === 'reviews') return right.reviews - left.reviews;
      if (sortBy === 'uptime') return right.uptime - left.uptime;
      if (sortBy === 'latency') return parseFloat(left.latency) - parseFloat(right.latency);
      return 0;
    });
  }, [mergedApis, activeCategory, activePricing, search, sortBy]);

  const hasFilters = Boolean(search) || activeCategory !== 'All' || activePricing !== 'all';
  const selectedNeed = API_NEED_OPTIONS.find((option) => option.id === selectedNeedId) ?? null;
  const selectedStage = PROJECT_STAGE_OPTIONS.find((option) => option.id === selectedStageId) ?? null;
  const selectedRegion = REGION_OPTIONS.find((option) => option.id === selectedRegionId) ?? null;
  const selectedDecision = DECISION_OPTIONS.find((option) => option.id === selectedDecisionId) ?? null;
  const assistantComplete = Boolean(selectedNeed && selectedStage && selectedRegion && selectedDecision);

  const hasAssistantProgress = Boolean(selectedNeed || selectedStage || selectedRegion || selectedDecision);

  const currentAssistantQuestion = assistantStep === 0
    ? {
        label: 'Which type of API do you need?',
        options: API_NEED_OPTIONS,
        onSelect: (id: string) => {
          setSelectedNeedId(id);
          setSelectedStageId(null);
          setSelectedRegionId(null);
          setSelectedDecisionId(null);
          setQuestionResults([]);
          setAssistantStep(1);
        },
      }
    : assistantStep === 1
      ? {
          label: `Is this ${selectedNeed?.label ?? 'API'} for a prototype, production app, or enterprise workflow?`,
          options: PROJECT_STAGE_OPTIONS,
          onSelect: (id: string) => {
            setSelectedStageId(id);
            setSelectedRegionId(null);
            setSelectedDecisionId(null);
            setQuestionResults([]);
            setAssistantStep(2);
          },
        }
      : assistantStep === 2
        ? {
            label: selectedStage?.id === 'production' || selectedStage?.id === 'enterprise'
              ? 'Any region or compliance preference for this launch?'
              : 'Any region preference for this experiment?',
            options: REGION_OPTIONS,
            onSelect: (id: string) => {
              setSelectedRegionId(id);
              setSelectedDecisionId(null);
              setQuestionResults([]);
              setAssistantStep(3);
            },
          }
        : assistantStep === 3
          ? {
              label: `For ${selectedNeed?.label ?? 'this API'}, what should APIverse optimize for first?`,
              options: DECISION_OPTIONS,
              onSelect: (id: string) => {
                setSelectedDecisionId(id);
                setQuestionResults([]);
                setAssistantStep(4);
              },
            }
          : null;

  async function handleGuidedRecommendation() {
    if (!selectedNeed || !selectedStage || !selectedRegion || !selectedDecision) {
      setRecommendationError('Answer the assistant questions first.');
      return;
    }

    const syntheticQuestion = [
      `User needs ${selectedNeed.prompt}.`,
      `Project stage is ${selectedStage.prompt}.`,
      `Region requirement is ${selectedRegion.prompt}.`,
      `Decision priority is ${selectedDecision.prompt}.`,
    ].join(' ');

    setIsRecommending(true);
    setRecommendationError(null);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: syntheticQuestion, limit: 5 }),
      });
      const payload = await response.json() as {
        error?: string;
        recommendations?: RecommendationResult[];
      };
      if (!response.ok || !payload.recommendations) {
        throw new Error(payload.error ?? 'Unable to recommend APIs.');
      }
      setQuestionResults(payload.recommendations);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to recommend APIs.';
      setRecommendationError(message);
      setQuestionResults([]);
    } finally {
      setIsRecommending(false);
    }
  }

  async function handleProjectPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = projectMessage.trim();
    if (!message) return;

    setIsPlanning(true);
    setPlanningError(null);
    try {
      const response = await fetch('/api/api-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json() as ApiPlanResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to plan API bundle.');
      setApiPlan(payload);
      setQuestionResults([]);
    } catch (error) {
      setPlanningError(error instanceof Error ? error.message : 'Unable to plan API bundle.');
      setApiPlan(null);
    } finally {
      setIsPlanning(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-stone-300/70 bg-[#fffaf3]/86 p-5 shadow-[0_18px_45px_rgba(34,24,16,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/88">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow inline-flex items-center gap-2 text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                  <Compass size={13} />
                  Find My API
                </p>
                <h2 className="mt-2 font-display text-3xl text-stone-950 dark:text-stone-50">Tell APIverse what you are building</h2>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  The AI planner understands the project, extracts needed capabilities, and recommends API bundles from the APIverse catalog.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
              <form onSubmit={handleProjectPlan} className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">API planning assistant</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Describe the app in normal language. APIverse will return all API categories worth considering.</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111c24] text-xs font-bold text-white dark:bg-stone-100 dark:text-stone-950">
                    AI
                  </div>
                  <div className="min-w-0 flex-1 rounded-[20px] rounded-tl-md border border-stone-300/70 bg-[#fffaf3]/85 p-3 dark:border-white/10 dark:bg-black/10">
                    <textarea
                      value={projectMessage}
                      onChange={(event) => setProjectMessage(event.target.value)}
                      placeholder="Example: I am building a food delivery app in India. Users need OTP login, restaurants receive orders, customers pay online, delivery partners need maps, and we need analytics."
                      className="min-h-28 w-full resize-none bg-transparent text-sm leading-7 text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Ride booking app in India with payments, maps, OTP, and driver tracking',
                      'Fintech app with KYC, subscriptions, alerts, and analytics',
                      'AI support chatbot with search, email alerts, and monitoring',
                    ].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setProjectMessage(example)}
                        className="rounded-full border border-stone-300/70 bg-white/70 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:border-stone-500 hover:text-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
                      >
                        {example.split(' with ')[0]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isPlanning || !projectMessage.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPlanning ? 'Planning...' : 'Plan API bundle'}
                    <Sparkles size={15} />
                  </button>
                </div>
              </form>

              {planningError ? (
                <p className="mt-3 text-sm text-[#b8573f] dark:text-[#efb28f]">{planningError}</p>
              ) : null}

              {recommendationError ? (
                <p className="mt-3 text-sm text-[#b8573f] dark:text-[#efb28f]">{recommendationError}</p>
              ) : null}

              {apiPlan ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
                          {planSourceLabels[apiPlan.source]}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-stone-950 dark:text-stone-50">{apiPlan.projectType}</h3>
                        <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{apiPlan.projectSummary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="rounded-full bg-white px-3 py-1 text-stone-700 dark:bg-white/10 dark:text-stone-200">{apiPlan.stage}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-stone-700 dark:bg-white/10 dark:text-stone-200">{apiPlan.region}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-stone-700 dark:bg-white/10 dark:text-stone-200">{apiPlan.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {apiPlan.capabilities.map((capability) => (
                      <article key={capability.name} className="rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                        <p className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Needed capability</p>
                        <h3 className="mt-1 text-lg font-semibold text-stone-950 dark:text-stone-50">{capability.name}</h3>
                        <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{capability.whyNeeded}</p>
                        <div className="mt-4 grid gap-3 lg:grid-cols-3">
                          {capability.recommendations.map((result) => (
                            <div key={result.slug} className="rounded-[18px] border border-stone-300/70 bg-white/72 p-3 dark:border-white/8 dark:bg-white/5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-xs uppercase text-stone-500 dark:text-stone-400">{result.provider}</p>
                                  <p className="mt-1 text-sm font-semibold text-stone-950 dark:text-stone-50">{result.name}</p>
                                </div>
                                <span className="rounded-full bg-[#111c24] px-2 py-1 text-[11px] font-bold text-white dark:bg-stone-100 dark:text-stone-950">{result.score}%</span>
                              </div>
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-600 dark:text-stone-400">{result.description}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => addApi(result.slug)}
                                  className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-3 py-1.5 text-[11px] font-semibold text-white"
                                >
                                  <ShoppingBag size={12} />
                                  {hasItem(result.slug) ? 'Saved' : 'Save'}
                                </button>
                                <Link
                                  href={`/api-marketplace/${result.slug}`}
                                  className="inline-flex items-center gap-1 rounded-full border border-stone-300/70 bg-white/75 px-3 py-1.5 text-[11px] font-semibold text-stone-800 transition hover:border-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100"
                                >
                                  Details
                                  <ArrowRight size={12} />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>

                  {apiPlan.followUpQuestions.length > 0 ? (
                    <div className="rounded-[20px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Good next questions</p>
                      <div className="mt-2 space-y-1 text-sm leading-6 text-stone-600 dark:text-stone-400">
                        {apiPlan.followUpQuestions.map((question) => (
                          <p key={question}>{question}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {questionResults.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {questionResults.map((result) => (
                    <article key={result.slug} className="rounded-[20px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">{result.provider} - {result.category}</p>
                          <h3 className="mt-1 text-lg font-semibold text-stone-950 dark:text-stone-50">{result.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{result.description}</p>
                        </div>
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#111c24] text-sm font-bold text-white dark:bg-stone-100 dark:text-stone-950">
                          {result.score}%
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="rounded-full bg-white px-3 py-1 text-stone-700 dark:bg-white/10 dark:text-stone-200">{result.confidence} confidence</span>
                        <span className="rounded-full bg-white px-3 py-1 text-stone-700 dark:bg-white/10 dark:text-stone-200">{result.pricing}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-stone-700 dark:bg-white/10 dark:text-stone-200">{result.latency}</span>
                      </div>
                      <div className="mt-3 space-y-1 text-sm leading-6 text-stone-600 dark:text-stone-400">
                        {result.reasons.slice(0, 3).map((reason) => (
                          <p key={reason} className="flex gap-2">
                            <CheckCircle2 size={13} className="mt-1 shrink-0 text-[#2b8a7d]" />
                            <span>{reason}</span>
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => addApi(result.slug)}
                          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-4 py-2 text-xs font-semibold text-white"
                        >
                          <ShoppingBag size={13} />
                          {hasItem(result.slug) ? 'Saved' : 'Save'}
                        </button>
                        <Link
                          href={`/api-marketplace/${result.slug}`}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-2 text-xs font-semibold text-stone-800 transition hover:border-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
                        >
                          View details
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>

          </div>

          <div className="rounded-[28px] border border-stone-300/70 bg-[#fffaf3]/82 p-5 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/86">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
              <input
                id="api-search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search APIs, providers, regions, or use-cases"
                className="w-full rounded-2xl border border-stone-300/70 bg-white/80 py-3 pl-11 pr-10 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-white/20"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-700 dark:hover:text-stone-200"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1">
              {CATEGORY_LABELS.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                    activeCategory === category
                      ? 'border-stone-950 bg-stone-950 text-stone-50 dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950'
                      : 'border-stone-300/70 bg-white/70 text-stone-600 hover:border-stone-500 hover:text-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-stone-900 dark:text-stone-100">{filtered.length}</span> APIs ready to compare
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <SelectControl
                  value={activePricing}
                  onChange={setActivePricing}
                  options={PRICING_FILTERS}
                />
                <SelectControl
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { label: 'Top rated', value: 'rating' },
                    { label: 'Most reviewed', value: 'reviews' },
                    { label: 'Best uptime', value: 'uptime' },
                    { label: 'Fastest', value: 'latency' },
                  ]}
                />
                <div className="flex rounded-xl border border-stone-300/70 bg-white/80 p-0.5 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg p-1.5 transition ${
                      viewMode === 'grid'
                        ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950'
                        : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`rounded-lg p-1.5 transition ${
                      viewMode === 'list'
                        ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950'
                        : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                    }`}
                    aria-label="List view"
                  >
                    <List size={13} />
                  </button>
                </div>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setActiveCategory('All');
                      setActivePricing('all');
                    }}
                    className="rounded-xl border border-stone-300/70 bg-white/80 px-3 py-2 text-xs text-stone-500 transition hover:text-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:text-stone-100"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[28px] border border-stone-300/70 bg-[#fffaf3]/82 px-6 py-16 text-center dark:border-white/8 dark:bg-[#0b1520]/86">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-white/5">
                <Search size={22} className="text-stone-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">No APIs matched that filter</h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Try a broader category or reset the search.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((api, index) => (
                <MarketplaceCard
                  key={api.slug}
                  api={api as APIItem}
                  index={index}
                  inCart={hasItem(api.slug)}
                  onAdd={() => addApi(api.slug)}
                  priceChange={priceChanges[api.slug]}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((api, index) => (
                <MarketplaceRow
                  key={api.slug}
                  api={api as APIItem}
                  index={index}
                  inCart={hasItem(api.slug)}
                  onAdd={() => addApi(api.slug)}
                  priceChange={priceChanges[api.slug]}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-28 rounded-[32px] border border-stone-300/70 bg-[#fffaf3]/84 p-6 shadow-[0_20px_60px_rgba(38,28,18,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/88">
            <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Saved shortlist</p>
            <h2 className="mt-3 font-display text-3xl text-stone-950 dark:text-stone-50">Lead-gen workspace for APIs</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
              Save APIs as you browse, compare the docs in one place, then either visit the official provider or connect your own key inside APIverse.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[24px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Items</p>
                <p className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">{itemCount}</p>
              </div>
              <div className="rounded-[24px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Next actions</p>
                <p className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">{itemCount * 2}</p>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Possible provider visits or key connections</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCart}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.28)]"
            >
              <ShoppingBag size={15} />
              Open shortlist
            </button>

            <div className="mt-5 rounded-[24px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
              <p className="text-sm text-stone-700 dark:text-stone-300">
                Save first, then compare docs, visit the official provider, or connect your own key from the dashboard.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {itemCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 px-4">
          <div className="pointer-events-auto mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full border border-white/20 bg-[#111c24]/92 px-5 py-4 shadow-[0_24px_60px_rgba(4,10,16,0.42)] backdrop-blur-xl">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Shortlist live</p>
              <p className="truncate text-sm text-stone-100">
                {itemCount} API{itemCount > 1 ? 's' : ''} saved for compare, visit, or connect
              </p>
            </div>
            <button
              type="button"
              onClick={toggleCart}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white"
            >
              View shortlist
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-xl border border-stone-300/70 bg-white/80 py-2 pl-3 pr-7 text-xs text-stone-700 outline-none [color-scheme:light] dark:border-white/10 dark:bg-[#111c24] dark:text-stone-200 dark:[color-scheme:dark]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={10} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400" />
    </div>
  );
}

function ChoiceGroup({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111c24] text-xs font-bold text-white dark:bg-stone-100 dark:text-stone-950">
          AI
        </div>
        <div className="max-w-[760px] rounded-[20px] rounded-tl-md border border-stone-300/70 bg-white/80 px-4 py-3 text-sm font-semibold text-stone-800 dark:border-white/10 dark:bg-white/8 dark:text-stone-100">
          {label}
        </div>
      </div>

      <div className="ml-0 flex flex-wrap gap-2 md:ml-12">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className="rounded-full border border-stone-300/70 bg-white/70 px-3.5 py-2 text-xs font-semibold text-stone-600 transition hover:border-stone-500 hover:text-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-white/20"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MarketplaceCard({
  api,
  index,
  inCart,
  onAdd,
  priceChange,
}: {
  api: APIItem;
  index: number;
  inCart: boolean;
  onAdd: () => void;
  priceChange?: PriceChangeIndicator;
}) {
  const href = `/api-marketplace/${api.slug}`;
  const providerUrl = getOfficialProviderUrl(api.slug, api.provider);

  return (
    <article
      className="card-entrance group flex h-full flex-col rounded-[28px] border border-stone-300/70 bg-[#fffaf3]/86 p-5 shadow-[0_18px_45px_rgba(34,24,16,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(34,24,16,0.13)] dark:border-white/8 dark:bg-[#0b1520]/88 dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
      style={{ animationDelay: `${Math.min(index * 30, 600)}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{api.provider}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950 transition group-hover:text-[#d85f43] dark:text-stone-50 dark:group-hover:text-[#ef7d52]">
            {api.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-stone-300/70 bg-white/70 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {api.rating}
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-7 text-stone-600 dark:text-stone-400">{api.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${categoryColors[api.category] ?? 'bg-stone-100 text-stone-700 dark:bg-white/8 dark:text-stone-300'}`}>
          {api.category}
        </span>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${pricingColors[api.pricingTier]}`}>
          {api.pricing}
        </span>
        {api.trending ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff2d9] px-3 py-1 text-[11px] font-semibold text-[#b36a00] dark:bg-[#3b2a0d] dark:text-[#f3c36d]">
            <TrendingUp size={11} />
            Trending
          </span>
        ) : null}
        {priceChange && priceChange.direction !== 'none' ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
            priceChange.direction === 'down'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
          }`}>
            {priceChange.direction === 'down' ? '↓' : '↑'} {priceChange.changePercentage.toFixed(0)}% price {priceChange.direction === 'down' ? 'drop' : 'rise'}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-[24px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
        <Stat label="Uptime" value={`${api.uptime}%`} accent="success" />
        <Stat label="Latency" value={api.latency} accent="info" />
        <Stat label="Reviews" value={countFormatter.format(api.reviews)} accent="neutral" />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.24)]"
        >
          <ShoppingBag size={14} />
          {inCart ? 'Saved' : 'Save'}
        </button>
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-full border border-stone-300/70 bg-white/70 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
        >
          View
        </Link>
      </div>
      <Link
        href={providerUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#d85f43] transition hover:text-[#a94931] dark:text-[#efb28f] dark:hover:text-[#ffd0b7]"
      >
        Visit provider
        <ExternalLink size={13} />
      </Link>
    </article>
  );
}

function MarketplaceRow({
  api,
  index,
  inCart,
  onAdd,
  priceChange,
}: {
  api: APIItem;
  index: number;
  inCart: boolean;
  onAdd: () => void;
  priceChange?: PriceChangeIndicator;
}) {
  const href = `/api-marketplace/${api.slug}`;
  const providerUrl = getOfficialProviderUrl(api.slug, api.provider);

  return (
    <article
      className="card-entrance flex flex-col gap-4 rounded-[26px] border border-stone-300/70 bg-[#fffaf3]/86 p-5 shadow-[0_14px_35px_rgba(34,24,16,0.07)] dark:border-white/8 dark:bg-[#0b1520]/88 lg:flex-row lg:items-center"
      style={{ animationDelay: `${Math.min(index * 20, 420)}ms` }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{api.name}</p>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryColors[api.category] ?? 'bg-stone-100 text-stone-700 dark:bg-white/8 dark:text-stone-300'}`}>
            {api.category}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pricingColors[api.pricingTier]}`}>
            {api.pricing}
          </span>
          {priceChange && priceChange.direction !== 'none' ? (
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              priceChange.direction === 'down'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
            }`}>
              {priceChange.direction === 'down' ? '↓' : '↑'} {priceChange.changePercentage.toFixed(0)}%
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {api.provider} • {api.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
        <span className="inline-flex items-center gap-1.5">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          {api.rating}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-500" />
          {api.uptime}%
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Zap size={13} className="text-sky-500" />
          {api.latency}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-4 py-3 text-sm font-semibold text-white"
        >
          <ShoppingBag size={14} />
          {inCart ? 'Saved' : 'Save'}
        </button>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
        >
          Open
          <ArrowRight size={13} />
        </Link>
        <Link
          href={providerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
        >
          Provider
          <ExternalLink size={13} />
        </Link>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'success' | 'info' | 'neutral';
}) {
  const accentClass =
    accent === 'success'
      ? 'text-emerald-600 dark:text-emerald-300'
      : accent === 'info'
        ? 'text-sky-600 dark:text-sky-300'
        : 'text-stone-900 dark:text-stone-100';

  return (
    <div>
      <p className="eyebrow text-[9px] font-semibold text-stone-500 dark:text-stone-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}
