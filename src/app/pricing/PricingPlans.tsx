'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';

import { workspacePlans } from '@/lib/billing';

type BillingCycle = 'monthly' | 'yearly';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function PricingPlans() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <>
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-stone-300/70 bg-white/75 p-1 dark:border-white/10 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setCycle('monthly')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              cycle === 'monthly'
                ? 'bg-stone-950 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setCycle('yearly')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              cycle === 'yearly'
                ? 'bg-stone-950 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {workspacePlans.map((plan) => {
          const amount = plan[cycle];
          const displayPrice = amount === 0 ? 'Free' : currency.format(amount);

          return (
            <article
              key={plan.name}
              className={`rounded-[34px] border p-7 transition-all ${
                plan.featured
                  ? 'hero-gradient border-stone-300/70 text-stone-900 shadow-[0_30px_70px_rgba(96,70,42,0.12)] dark:border-black/10 dark:text-stone-100 dark:shadow-[0_30px_70px_rgba(6,12,16,0.38)]'
                  : 'editorial-card'
              }`}
            >
              <p className={`eyebrow text-[10px] font-semibold ${plan.featured ? 'text-stone-600 dark:text-stone-300' : 'text-stone-500 dark:text-stone-400'}`}>
                {plan.name}
              </p>
              <div className="mt-5 flex items-end gap-2">
                <span className={`font-display text-5xl ${plan.featured ? 'text-stone-950 dark:text-white' : 'text-stone-950 dark:text-stone-50'}`}>{displayPrice}</span>
                {amount > 0 ? (
                  <span className={`pb-2 text-sm ${plan.featured ? 'text-stone-600 dark:text-stone-300' : 'text-stone-500 dark:text-stone-400'}`}>
                    /{cycle === 'monthly' ? 'month' : 'year'}
                  </span>
                ) : null}
              </div>
              {cycle === 'yearly' && amount > 0 ? (
                <p className="mt-2 text-xs font-semibold text-[#d85f43] dark:text-[#efb28f]">Billed yearly with savings</p>
              ) : null}
              <p className={`mt-4 text-sm leading-7 ${plan.featured ? 'text-stone-700 dark:text-stone-300' : 'text-stone-600 dark:text-stone-400'}`}>{plan.note}</p>
              <ul className="mt-8 space-y-3">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check size={16} className={plan.featured ? 'mt-1 text-[#efb28f]' : 'mt-1 text-[#d85f43]'} />
                    <span className={`text-sm ${plan.featured ? 'text-stone-800 dark:text-stone-100' : 'text-stone-700 dark:text-stone-300'}`}>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.name === 'Signal' ? '/docs' : '/login'}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? 'bg-stone-950 text-stone-50 hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-100'
                    : 'bg-stone-950 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950'
                }`}
              >
                {plan.name === 'Signal' ? 'Talk to team' : `Start ${plan.name}`}
              </Link>
            </article>
          );
        })}
      </section>
    </>
  );
}
