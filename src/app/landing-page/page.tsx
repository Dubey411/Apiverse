import Link from 'next/link';
import { ArrowRight, ChevronRight, Orbit, ShieldCheck, Sparkles, Telescope, Waypoints } from 'lucide-react';

import LandingFooter from '@/app/landing-page/components/LandingFooter';
import LandingNav from '@/components/LandingNav';

const principles = [
  {
    title: 'Curated instead of cluttered',
    copy: 'Surface trust signals, real onboarding guidance, and product context before anyone asks for a key.',
  },
  {
    title: 'Operational from day one',
    copy: 'Alerts, quotas, and team controls are part of the interface, not an afterthought bolted into settings.',
  },
  {
    title: 'Editorial, not synthetic',
    copy: 'The product reads like a thoughtful tool for humans, not a generated dashboard template.',
  },
];

const modules = [
  {
    title: 'Marketplace Curation',
    text: 'Help developers choose the right API with richer metadata, sharper categories, and live compatibility notes.',
  },
  {
    title: 'Access Control',
    text: 'Issue sandbox and production keys with approval flows, environment separation, and event history.',
  },
  {
    title: 'Operational Review',
    text: 'Watch usage, quota burn, and reliability from one workspace designed for calm decision making.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <LandingNav />

      <main className="px-6 pb-10 pt-28 lg:px-8 xl:px-10 2xl:px-16">
        <section className="mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="relative overflow-hidden rounded-[40px] border border-stone-300/70 bg-[#fff7ec]/85 p-8 shadow-[0_30px_80px_rgba(96,70,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1b23]/86 dark:shadow-[0_30px_80px_rgba(0,0,0,0.34)] sm:p-10 xl:p-14">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(239,125,82,0.18),transparent_55%)]" />
            <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(43,138,125,0.18),transparent_65%)]" />

            <div className="relative">
              <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[10px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                <Sparkles size={12} />
                A more intentional frontend for API products
              </span>

              <h1 className="mt-8 max-w-4xl font-display text-5xl leading-[0.94] tracking-tight text-stone-950 dark:text-stone-50 sm:text-6xl xl:text-7xl">
                API tooling can feel
                {' '}
                <span className="gradient-text">precise, warm,</span>
                {' '}
                and unmistakably human.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-300">
                APIverse now leans into an editorial product language: warmer tones, stronger hierarchy, and layouts that feel designed rather than generated.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/api-marketplace"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.28)] transition hover:translate-y-[-1px]"
                >
                  Browse Marketplace
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:bg-stone-950 hover:text-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-950"
                >
                  Explore Docs
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="editorial-card rounded-[28px] p-5">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Daily traffic</p>
                  <p className="mt-3 font-display text-3xl text-stone-950 dark:text-stone-50">10.4M</p>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Requests routed across verification, payment, and AI surfaces.</p>
                </div>
                <div className="editorial-card rounded-[28px] p-5">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Time to first call</p>
                  <p className="mt-3 font-display text-3xl text-stone-950 dark:text-stone-50">6 min</p>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">From account creation to a successful sandbox request with working examples.</p>
                </div>
                <div className="editorial-card rounded-[28px] p-5">
                  <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Signal quality</p>
                  <p className="mt-3 font-display text-3xl text-stone-950 dark:text-stone-50">99.98%</p>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Uptime badges and operational notes are surfaced where decisions happen.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="hero-gradient soft-grid overflow-hidden rounded-[36px] border border-stone-300/70 p-8 text-stone-900 shadow-[0_26px_70px_rgba(96,70,42,0.12)] dark:border-black/10 dark:text-stone-100 dark:shadow-[0_26px_70px_rgba(5,11,16,0.44)]">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[10px] font-semibold text-stone-600 dark:text-stone-300">Interface direction</span>
                <Orbit size={18} className="text-[#ef7d52]" />
              </div>
              <h2 className="mt-6 font-display text-4xl leading-tight">Less AI template, more design system with a point of view.</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-stone-700 dark:text-stone-300">
                Stronger contrast, more memorable typography, and a clearer sense of product maturity across every surface.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {principles.map((item) => (
                <article key={item.title} className="editorial-card rounded-[28px] p-5 sm:col-span-2">
                  <h3 className="font-display text-2xl text-stone-950 dark:text-stone-50">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-screen-2xl gap-4 md:grid-cols-3">
          {modules.map((module, index) => {
            const icons = [Telescope, ShieldCheck, Waypoints];
            const Icon = icons[index];
            return (
              <article key={module.title} className="editorial-card rounded-[30px] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-[#f3e8dc] dark:bg-[#f3e8dc] dark:text-[#12212b]">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">{module.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">{module.text}</p>
                <Link href="/docs" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
                  Learn more
                  <ChevronRight size={14} />
                </Link>
              </article>
            );
          })}
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
