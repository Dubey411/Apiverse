import { Layers3 } from 'lucide-react';

import LandingFooter from '@/app/landing-page/components/LandingFooter';
import LandingNav from '@/components/LandingNav';
import MarketplaceContent from './components/MarketplaceContent';

export default function APIMarketplacePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />

      <main className="mx-auto max-w-screen-2xl px-6 pb-10 pt-28 lg:px-8 xl:px-10 2xl:px-16">
        {/* Compact hero header */}
        <section className="rounded-[28px] border border-stone-300/70 bg-[#fff8ef]/80 p-6 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/86">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[10px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                <Layers3 size={12} />
                API Marketplace
              </span>
              <h1 className="mt-3 font-display text-3xl leading-tight text-stone-950 dark:text-stone-50 sm:text-4xl">
                Discover &amp; integrate 100+ production APIs
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300">
                Browse, compare, and connect to APIs across AI, payments, identity, government, cloud, and more — all from one workspace.
              </p>
            </div>
          </div>
        </section>

        {/* Marketplace grid with search & filters */}
        <MarketplaceContent />
      </main>

      <LandingFooter />
    </div>
  );
}
