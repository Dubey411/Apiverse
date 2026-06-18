'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

import { useCart } from '@/context/CartContext';

interface SessionPayload {
  authenticated: boolean;
  user: {
    email: string;
    name: string;
  } | null;
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeApi, clearCart } = useCart();
  const [session, setSession] = useState<SessionPayload>({ authenticated: false, user: null });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', {
          signal: controller.signal,
          cache: 'no-store',
        });

        const data = (await response.json()) as SessionPayload;
        setSession({
          authenticated: Boolean(data.authenticated && data.user),
          user: data.user,
        });
      } catch {
        setSession({ authenticated: false, user: null });
      }
    }

    loadSession();

    return () => controller.abort();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close shortlist"
        onClick={closeCart}
        className="absolute inset-0 bg-[#050d1a]/56 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-stone-300/60 bg-[#fffaf3] shadow-[0_28px_80px_rgba(17,14,10,0.22)] dark:border-white/8 dark:bg-[#0b1520]">
        <div className="flex items-center justify-between border-b border-stone-300/70 px-6 py-5 dark:border-white/8">
          <div>
            <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Saved APIs</p>
            <h2 className="mt-2 font-display text-3xl text-stone-950 dark:text-stone-50">Lead-gen shortlist</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-stone-300/70 bg-white/75 text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
              <Bookmark size={22} />
            </div>
            <h3 className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">Your shortlist is empty</h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-stone-600 dark:text-stone-400">
              Save APIs while you browse, compare providers, and then either visit the official provider or connect your own key inside APIverse.
            </p>
            <Link
              href="/api-marketplace"
              onClick={closeCart}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.28)]"
            >
              Explore marketplace
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="apiverse-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <article
                  key={item.slug}
                  className="rounded-[28px] border border-stone-300/70 bg-white/75 p-5 shadow-[0_18px_45px_rgba(34,24,16,0.08)] dark:border-white/8 dark:bg-black/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold tracking-[0.08em] ${item.markClassName}`}>
                        {item.mark}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-stone-500 dark:text-stone-400">{item.provider}</p>
                        <h3 className="mt-1 break-words font-display text-2xl text-stone-950 dark:text-stone-50 sm:text-3xl">{item.product}</h3>
                        <p className="mt-2 break-words text-sm text-stone-600 dark:text-stone-400">{item.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeApi(item.slug)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:border-rose-400/30 dark:hover:text-rose-300"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#f4e4d8] px-3 py-1 text-xs font-medium text-[#a44d38] dark:bg-[#261815] dark:text-[#efb28f]">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-[#e8f4ec] px-3 py-1 text-xs font-medium text-[#25684f] dark:bg-[#12231b] dark:text-[#88d3b4]">
                      {item.access}
                    </span>
                    {item.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-stone-300/70 px-3 py-1 text-xs font-medium text-stone-700 dark:border-white/10 dark:text-stone-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Link
                      href={`/api-marketplace/${item.slug}`}
                      onClick={closeCart}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300/70 bg-white/80 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
                    >
                      Compare docs
                    </Link>
                    <Link
                      href={session.authenticated ? `/developer-dashboard/projects?apiSlug=${item.slug}` : '/login'}
                      onClick={closeCart}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300/70 bg-white/80 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
                    >
                      <KeyRound size={14} />
                      Connect key
                    </Link>
                    <Link
                      href={item.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.24)]"
                    >
                      Visit provider
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-stone-300/70 px-6 py-5 dark:border-white/8">
              <div className="rounded-[28px] border border-stone-300/70 bg-white/80 p-5 dark:border-white/8 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Shortlist size</p>
                    <p className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">{items.length}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-full border border-stone-300/70 bg-white/75 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-white/20"
                  >
                    Clear all
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-stone-300/70 bg-[#fff7ee] p-4 text-sm text-stone-600 dark:border-white/8 dark:bg-[#101922] dark:text-stone-400">
                  <ShieldCheck size={18} className="mt-0.5 text-[#2b8a7d]" />
                  <p>
                    {session.authenticated && session.user?.email
                      ? `Use ${session.user.email} to connect your own keys and manage shortlisted providers from one workspace.`
                      : 'Log in to connect your own keys and manage shortlisted providers from one workspace.'}
                  </p>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={session.authenticated ? '/developer-dashboard/projects' : '/login'}
                    onClick={closeCart}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(216,95,67,0.28)]"
                  >
                    {session.authenticated ? 'Open workspace' : 'Log in to connect'}
                    <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300/70 bg-white/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
                  >
                    Keep browsing
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
