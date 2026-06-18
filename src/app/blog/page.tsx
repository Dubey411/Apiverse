import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';

import LandingFooter from '@/app/landing-page/components/LandingFooter';
import LandingNav from '@/components/LandingNav';

const posts = [
  {
    category: 'Guides',
    title: 'Launching an API onboarding flow without dead ends',
    excerpt: 'A practical look at how account creation, first-call success, and upgrade prompts should work together.',
  },
  {
    category: 'Operations',
    title: 'The signals mature dashboards surface before things break',
    excerpt: 'Quota burn, drift, reliability notes, and the small clues that keep support teams ahead of incidents.',
  },
  {
    category: 'Design',
    title: 'Why so many developer tools look the same now',
    excerpt: 'And what changes when you push past the default generated visual vocabulary.',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main className="mx-auto max-w-screen-2xl px-6 pb-10 pt-28 lg:px-8 xl:px-10 2xl:px-16">
        <section className="editorial-card rounded-[36px] p-8 sm:p-10 xl:p-14">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[10px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
            <Newspaper size={12} />
            Blog
          </span>
          <h1 className="mt-8 max-w-3xl font-display text-5xl leading-tight text-stone-950 dark:text-stone-50">
            Notes on shipping better developer experiences, not just prettier cards.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-300">
            This editorial surface is intentionally calmer: fewer gradients, stronger typography, and clearer content blocks that make the product feel authored.
          </p>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="editorial-card rounded-[30px] p-6">
              <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">{post.category}</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-stone-950 dark:text-stone-50">{post.title}</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-400">{post.excerpt}</p>
              <Link href="/docs" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d85f43] hover:text-stone-950 dark:hover:text-stone-100">
                Read related docs
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
