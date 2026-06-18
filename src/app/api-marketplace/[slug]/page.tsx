import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Clock3,
  Layers3,
  Sparkles,
  Star,
} from 'lucide-react';

import LandingFooter from '@/app/landing-page/components/LandingFooter';
import LandingNav from '@/components/LandingNav';
import CodeSnippetCard from '@/components/CodeSnippetCard';
import PremiumBillingCard from '@/components/PremiumBillingCard';
import { getApiBillingPlans } from '@/lib/billing';
import { getAllApiSlugs, getOfficialProviderUrl, getUnifiedApiBySlug } from '@/lib/apiMarketplaceData';
import { getDbApiBySlug, getApiPricingHistory, getApiIdBySlug } from '@/lib/repositories/api.repository';
import { DbPricingHistory } from '@/lib/types/marketplace.types';

function toCurlSnippet(baseUrl: string, sampleRequest: string, auth: string) {
  const [firstLine, ...bodyLines] = sampleRequest.split('\n');
  const trimmedFirstLine = firstLine.trim();
  const method = trimmedFirstLine.split(' ')[0] || 'GET';
  const rawPath = trimmedFirstLine.slice(method.length).trim();
  const requestUrl = rawPath.startsWith('http')
    ? rawPath
    : `${baseUrl}${rawPath.startsWith('/') ? rawPath : `/${rawPath}`}`;
  const body = bodyLines.join('\n').trim();

  const headers = [
    `curl --request ${method.toUpperCase()} '${requestUrl}'`,
    `  --header 'Accept: application/json'`,
  ];

  if (auth.toLowerCase().includes('bearer')) {
    headers.push(`  --header 'Authorization: Bearer YOUR_API_KEY'`);
  } else if (auth.toLowerCase().includes('key')) {
    headers.push(`  --header 'X-API-Key: YOUR_API_KEY'`);
  }

  if (body) {
    headers.push(`  --header 'Content-Type: application/json'`);
    headers.push(`  --data-raw '${body.replace(/'/g, "\\'")}'`);
  }

  return headers.join(' \\\n');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function generateStaticParams() {
  return getAllApiSlugs().map((slug) => ({ slug }));
}

export default async function ApiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try DB first, fall back to static
  let unifiedApi: ReturnType<typeof getUnifiedApiBySlug> = null;
  let pricingHistory: DbPricingHistory[] = [];

  const { api: dbApi } = await getDbApiBySlug(slug);
  if (dbApi) {
    unifiedApi = dbApi;
    const apiId = await getApiIdBySlug(slug);
    if (apiId) {
      pricingHistory = await getApiPricingHistory(apiId, 90);
    }
  } else {
    unifiedApi = getUnifiedApiBySlug(slug);
  }

  if (!unifiedApi) {
    notFound();
  }

  const { base, catalog: api, detail } = unifiedApi;
  const billingPlans = getApiBillingPlans(api.category);
  const requestSnippet = toCurlSnippet(detail.baseUrl, api.sampleRequest, detail.auth);
  const providerUrl = getOfficialProviderUrl(api.slug, api.provider);

  return (
    <div className="min-h-screen">
      <LandingNav />

      <main className="mx-auto max-w-screen-2xl px-6 pb-10 pt-28 lg:px-8 xl:px-10 2xl:px-16">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/api-marketplace" className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2 text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-white/20">
            <ArrowLeft size={14} />
            Back to marketplace
          </Link>
          <span className="rounded-full bg-[#f4e4d8] px-3 py-1 text-xs font-medium text-[#a44d38] dark:bg-[#261815] dark:text-[#efb28f]">
            {api.category}
          </span>
          <span className="rounded-full bg-[#e8f4ec] px-3 py-1 text-xs font-medium text-[#25684f] dark:bg-[#12231b] dark:text-[#88d3b4]">
            {api.access}
          </span>
        </div>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className={`relative overflow-hidden rounded-[36px] border border-stone-300/70 bg-gradient-to-br ${api.accent} p-8 text-stone-50 shadow-[0_30px_70px_rgba(5,11,16,0.32)] sm:p-10`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(239,125,82,0.18),transparent_30%)]" />

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-base font-bold tracking-[0.08em] shadow-sm ${api.markClassName}`}>
                  {api.mark}
                </div>
                <div className="rounded-full border border-white/12 bg-black/14 px-3 py-1 text-xs font-semibold text-stone-100 backdrop-blur-sm">
                  {api.eyebrow}
                </div>
              </div>

              <p className="mt-8 text-sm text-stone-200">{api.provider}</p>
              <h1 className="mt-3 break-words font-display text-4xl leading-tight sm:text-5xl">{api.product}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-200">{api.overview}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                <div className="min-w-0 rounded-[24px] border border-white/12 bg-black/14 p-4 backdrop-blur-sm">
                  <p className="eyebrow text-[10px] font-semibold text-stone-300">Endpoint</p>
                  <p className="mt-3 break-all text-base font-semibold leading-7 sm:text-lg">{detail.endpoint}</p>
                </div>
                <div className="min-w-0 rounded-[24px] border border-white/12 bg-black/14 p-4 backdrop-blur-sm">
                  <p className="eyebrow text-[10px] font-semibold text-stone-300">Starting price</p>
                  <p className="mt-3 break-words text-base font-semibold leading-7 sm:text-lg">{api.price}</p>
                </div>
                <div className="min-w-0 rounded-[24px] border border-white/12 bg-black/14 p-4 backdrop-blur-sm">
                  <p className="eyebrow text-[10px] font-semibold text-stone-300">Latency</p>
                  <p className="mt-3 break-words text-base font-semibold leading-7 sm:text-lg">{api.latency}</p>
                </div>
                <div className="min-w-0 rounded-[24px] border border-white/12 bg-black/14 p-4 backdrop-blur-sm">
                  <p className="eyebrow text-[10px] font-semibold text-stone-300">Uptime</p>
                  <p className="mt-3 break-words text-base font-semibold leading-7 sm:text-lg">{base.uptime}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-5">
            <article className="editorial-card rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-[#f3e8dc] dark:bg-[#f3e8dc] dark:text-[#12212b]">
                  <Layers3 size={20} />
                </div>
                <span className="flex items-center gap-1 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[11px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {base.rating} ({new Intl.NumberFormat('en-US').format(base.reviews)} reviews)
                </span>
              </div>
              <h2 className="mt-5 break-words font-display text-2xl text-stone-950 dark:text-stone-50 sm:text-3xl">Tech specs</h2>
              
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Version</p>
                  <p className="mt-2 break-words text-sm font-medium text-stone-900 dark:text-stone-100">{base.version}</p>
                </div>
                <div className="min-w-0 rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Format</p>
                  <p className="mt-2 break-words text-sm font-medium text-stone-900 dark:text-stone-100">{detail.protocol}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="eyebrow mb-2 text-[10px] font-semibold text-stone-500 dark:text-stone-400">Supported SDKs</p>
                <div className="flex flex-wrap gap-2">
                  {base.sdks.map((sdk: string) => (
                    <span key={sdk} className="rounded-full bg-stone-100 border border-stone-300/70 px-3 py-1 text-xs font-medium text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                      {sdk}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            <article className="editorial-card rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-[#f3e8dc] dark:bg-[#f3e8dc] dark:text-[#12212b]">
                  <BookOpenText size={20} />
                </div>
                <span className="rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[11px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                  API detail dashboard
                </span>
              </div>
              <h2 className="mt-5 break-words font-display text-2xl text-stone-950 dark:text-stone-50 sm:text-3xl">How it works</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">{api.howItWorks}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Base URL</p>
                  <p className="mt-2 break-all text-sm font-medium text-stone-900 dark:text-stone-100">{detail.baseUrl}</p>
                </div>
                <div className="min-w-0 rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Auth</p>
                  <p className="mt-2 break-words text-sm font-medium text-stone-900 dark:text-stone-100">{detail.auth}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="editorial-card rounded-[34px] p-8">
            <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Adoption options</p>
            <h2 className="mt-3 font-display text-4xl text-stone-950 dark:text-stone-50">Understand the free path before you talk to the provider</h2>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-[28px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Free access</p>
                <p className="mt-2 text-sm font-medium text-stone-900 dark:text-stone-100">{detail.sandboxLimit}</p>
                <ul className="mt-4 space-y-3">
                  {api.freePlan.map((item: string) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300">
                      <CheckCircle2 size={16} className="mt-1 text-[#2b8a7d]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Premium access</p>
                <p className="mt-2 text-sm font-medium text-stone-900 dark:text-stone-100">{detail.premiumLimit}</p>
                <ul className="mt-4 space-y-3">
                  {api.premiumPlan.map((item: string) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300">
                      <Sparkles size={16} className="mt-1 text-[#d85f43]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={providerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.28)]">
                Visit official provider
                <ArrowRight size={14} />
              </Link>
              <Link href={`/developer-dashboard/projects?apiSlug=${api.slug}`} className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20">
                Register for monitoring
              </Link>
            </div>

            <div className="mt-8 rounded-[28px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Provider notes</p>
              <ul className="mt-4 space-y-3">
                {detail.pricingNotes.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300">
                    <Sparkles size={16} className="mt-1 text-[#d85f43]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="editorial-card rounded-[34px] p-8">
            <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Integration flow</p>
            <h2 className="mt-3 font-display text-4xl text-stone-950 dark:text-stone-50">What your team does next</h2>

            <div className="mt-8 grid gap-4">
              {api.steps.map((step: string, index: number) => (
                <div key={step} className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Step {index + 1}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-700 dark:text-stone-300">{step}</p>
                </div>
              ))}
            </div>

            <CodeSnippetCard label="Sample request" code={requestSnippet} />
            <div className="mt-5">
              <CodeSnippetCard label="Sample response" code={detail.sampleResponse} />
            </div>
          </article>
        </section>

        <section className="mt-10">
          <PremiumBillingCard apiSlug={api.slug} apiName={api.product} plans={billingPlans} />
        </section>

        {/* Pricing History — only rendered when DB data is available */}
        {pricingHistory.length > 0 ? (
          <section className="mt-10">
            <article className="editorial-card rounded-[34px] p-8">
              <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Price intelligence</p>
              <h2 className="mt-3 font-display text-4xl text-stone-950 dark:text-stone-50">Pricing history (last 90 days)</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                Track every price change for this API. We monitor provider pricing and log updates automatically.
              </p>
              <div className="mt-8 space-y-3">
                {pricingHistory.map((entry) => {
                  const isDecrease = entry.change_amount < 0;
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isDecrease
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300'
                        }`}>
                          {isDecrease ? '↓' : '↑'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {entry.old_price_text ?? `$${entry.old_price}`}
                            {' → '}
                            {entry.new_price_text ?? `$${entry.new_price}`}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                            {formatDate(entry.changed_at)}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isDecrease
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
                      }`}>
                        {isDecrease ? '' : '+'}{Number(entry.change_percentage).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
        ) : null}

        <section className="mt-10 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
          <article className="editorial-card rounded-[30px] p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-[#f3e8dc] dark:bg-[#f3e8dc] dark:text-[#12212b]">
                <Clock3 size={20} />
              </div>
              <span className="rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[11px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                {api.metricLabel}
              </span>
            </div>
            <h3 className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">Best for</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {api.bestFor.map((item: string) => (
                <span key={item} className="rounded-full bg-[#f4e4d8] px-3 py-1 text-xs font-medium text-[#a44d38] dark:bg-[#261815] dark:text-[#efb28f]">
                  {item}
                </span>
              ))}
            </div>
          </article>
          <article className="editorial-card rounded-[30px] p-6">
            <h3 className="font-display text-3xl text-stone-950 dark:text-stone-50">Supported regions</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {detail.regions.map((region: string) => (
                <span key={region} className="rounded-full bg-[#e7f3ef] px-3 py-1 text-xs font-medium text-[#23695d] dark:bg-[#10231f] dark:text-[#82d2c7]">
                  {region}
                </span>
              ))}
            </div>
            
            <h3 className="mt-8 font-display text-xl text-stone-950 dark:text-stone-50">Response highlights</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {detail.responseHighlights.map((item: string) => (
                <span key={item} className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 dark:border-white/10 dark:text-stone-300">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
