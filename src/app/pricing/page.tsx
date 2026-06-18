import { Sparkles } from 'lucide-react';

import LandingFooter from '@/app/landing-page/components/LandingFooter';
import LandingNav from '@/components/LandingNav';
import PricingPlans from '@/app/pricing/PricingPlans';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main className="mx-auto max-w-screen-2xl px-6 pb-10 pt-28 lg:px-8 xl:px-10 2xl:px-16">
        <section className="text-center">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[10px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
            <Sparkles size={12} />
            Pricing
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-tight text-stone-950 dark:text-stone-50">
            Workspace pricing for discovery, shortlist, and connected APIs.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-300">
            APIverse helps teams discover providers, compare docs, shortlist options, and manage connected API keys from one workspace. These plans cover the APIverse experience, not third-party provider billing.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-stone-500 dark:text-stone-400">
            When a provider charges separately, users still complete signup and billing with the official provider. APIverse stays focused on research, onboarding, and workspace management.
          </p>
        </section>
        <PricingPlans />

        <section className="mt-10 rounded-[30px] border border-stone-300/70 bg-[#fff8ef]/78 p-6 text-sm leading-7 text-stone-600 dark:border-white/8 dark:bg-[#0b1520]/86 dark:text-stone-300">
          Lead-gen marketplace flow:
          Save APIs to your shortlist, compare docs and pricing signals in APIverse, then visit the official provider or connect your own key into your workspace when you are ready.
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
