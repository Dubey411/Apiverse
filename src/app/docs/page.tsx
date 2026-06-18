import Link from 'next/link';
import { BookOpenText, Code2, FileText, KeyRound, Rocket, ShieldCheck } from 'lucide-react';

import LandingFooter from '@/app/landing-page/components/LandingFooter';
import LandingNav from '@/components/LandingNav';

const sections = [
  ['Quickstart', 'Create a workspace, issue a sandbox key, and validate your first response in minutes.', Rocket],
  ['Authentication', 'Header formats, scopes, rotation patterns, and environment separation without guesswork.', KeyRound],
  ['Examples', 'Reference snippets for Node.js, Python, Go, and browser integrations.', Code2],
  ['Operations', 'Quota planning, retry posture, webhooks, and production change management.', ShieldCheck],
] as const;

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main className="mx-auto max-w-screen-2xl px-6 pb-10 pt-28 lg:px-8 xl:px-10 2xl:px-16">
        <section className="editorial-card rounded-[36px] p-8 sm:p-10 xl:p-14">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[10px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
            <BookOpenText size={12} />
            Documentation
          </span>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="font-display text-5xl leading-tight text-stone-950 dark:text-stone-50">
                Docs that explain how each API works before a team connects a provider.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-300">
                Every API in APIverse should move through the same flow: discover it, understand the request and response model, shortlist it, then either visit the official provider or connect a key inside your workspace when the team is ready.
              </p>
            </div>
            <div className="rounded-[28px] border border-stone-300/70 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
              <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Recommended path</p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-stone-700 dark:text-stone-300">
                <li>1. Discover an API in the marketplace</li>
                <li>2. Learn how it works with docs and examples</li>
                <li>3. Save it to your shortlist and compare docs</li>
                <li>4. Visit the provider or connect your own key</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {sections.map(([title, copy, Icon]) => (
            <article key={title} className="editorial-card rounded-[30px] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-[#f3e8dc] dark:bg-[#f3e8dc] dark:text-[#12212b]">
                <Icon size={20} />
              </div>
              <h2 className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">{copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 editorial-card rounded-[34px] p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl text-stone-950 dark:text-stone-50">Reference surfaces</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                Pair the docs with the marketplace and workspace so testing, onboarding, and observability all feel like one product.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/api-marketplace" className="rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-950 hover:text-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-950">
                Browse APIs
              </Link>
              <Link href="/login" className="rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.28)]">
                Open Workspace
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[FileText, Code2, ShieldCheck].map((Icon, index) => {
              const labels = ['API Reference', 'Code Samples', 'Launch Checklist'];
              const copy = [
                'Endpoint shapes, headers, examples, and common response patterns.',
                'Drop-in snippets for frequent verification and data access flows.',
                'Quota planning, retries, monitoring, and release safeguards.',
              ];
              return (
                <div key={labels[index]} className="rounded-[24px] border border-stone-300/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
                  <Icon size={18} className="text-[#d85f43]" />
                  <p className="mt-4 font-semibold text-stone-900 dark:text-stone-50">{labels[index]}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{copy[index]}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
