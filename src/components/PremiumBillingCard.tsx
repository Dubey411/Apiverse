'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, KeyRound, Bookmark } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import type { BillingPlan } from '@/lib/billing';
import { getOfficialProviderUrl } from '@/lib/apiMarketplaceData';

interface PremiumBillingCardProps {
  apiSlug: string;
  apiName: string;
  plans: BillingPlan[];
}

interface SessionState {
  authenticated: boolean;
  user: {
    email: string;
    name: string;
  } | null;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function PremiumBillingCard({ apiSlug, apiName, plans }: PremiumBillingCardProps) {
  const [session, setSession] = useState<SessionState | null>(null);
  const { addApi, items } = useCart();
  const providerUrl = useMemo(() => getOfficialProviderUrl(apiSlug), [apiSlug]);
  const shortlistItem = items.find((item) => item.slug === apiSlug);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data: SessionState) => {
        if (isMounted) {
          setSession(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession({ authenticated: false, user: null });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const leadText = useMemo(() => {
    if (session?.authenticated && session.user?.email) {
      return `Shortlist this API, then connect your own provider key inside the workspace owned by ${session.user.email}.`;
    }

    return 'Shortlist this API first, then log in when you are ready to connect your own provider key.';
  }, [session]);

  return (
    <article className="editorial-card rounded-[34px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Access model</p>
          <h2 className="mt-3 break-words font-display text-3xl text-stone-950 dark:text-stone-50 sm:text-4xl">Compare {apiName} and decide how to adopt it</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-400">{leadText}</p>
        </div>
        <div className="rounded-full border border-stone-300/70 bg-white/75 px-4 py-2 text-xs font-semibold text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
          Lead-gen marketplace flow
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="min-w-0 rounded-[28px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
            <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">{plan.name}</p>
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <p className="break-words font-display text-4xl text-stone-950 dark:text-stone-50">
                {plan.price.monthly === 0 ? 'Free' : currency.format(plan.price.monthly)}
              </p>
              {plan.price.monthly > 0 ? <span className="pb-1 text-sm text-stone-500 dark:text-stone-400">public entry signal</span> : null}
            </div>
            <p className="mt-2 break-words text-xs font-semibold text-[#d85f43] dark:text-[#efb28f]">{plan.yearlyDiscountLabel}</p>
            <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-400">{plan.description}</p>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300">
                <CheckCircle2 size={16} className="mt-1 text-[#2b8a7d]" />
                <span>{plan.includedUsage}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300">
                <CheckCircle2 size={16} className="mt-1 text-[#2b8a7d]" />
                <span>{plan.support}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
        <div className="min-w-0">
          <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Shortlist status</p>
          <p className="mt-2 break-words text-sm text-stone-700 dark:text-stone-300">
            {shortlistItem
              ? `${apiName} is already saved in your shortlist.`
              : 'Save this API if you want to compare it with other providers before connecting keys.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => addApi(apiSlug)}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.28)]"
          >
            <Bookmark size={14} />
            {shortlistItem ? 'Saved in shortlist' : 'Save to shortlist'}
          </button>
          <Link
            href={session?.authenticated ? `/developer-dashboard/projects?apiSlug=${apiSlug}` : '/login'}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
          >
            <KeyRound size={14} />
            Connect your key
          </Link>
          <Link
            href={providerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
          >
            Visit provider
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
        <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">What APIverse does</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Compare</p>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Cleaner docs, request/response examples, and shortlist-driven research across providers.</p>
          </div>
          <div className="rounded-[22px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Connect</p>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Bring your own provider credentials into one workspace when you are ready to test or ship.</p>
          </div>
          <div className="rounded-[22px] border border-stone-300/70 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Visit official source</p>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Go to the official provider for signup, legal terms, billing, or partner-specific access requirements.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
