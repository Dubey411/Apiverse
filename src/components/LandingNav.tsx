'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bookmark, LayoutDashboard, Menu, Moon, Sun, X } from 'lucide-react';

import AppLogo from '@/components/ui/AppLogo';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

const navLinks = [
  { label: 'Marketplace', href: '/api-marketplace' },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<null | { email: string; name: string }>(null);
  const { theme, toggleTheme } = useTheme();
  const { itemCount, hydrated, toggleCart } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          authenticated: boolean;
          user: { email: string; name: string } | null;
        };

        if (data.authenticated && data.user) {
          setSession({
            email: data.user.email,
            name: data.user.name,
          });
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      }
    }

    loadSession();

    return () => controller.abort();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-6">
      <div
        className={`mx-auto max-w-screen-2xl rounded-full border px-4 transition-all duration-300 md:px-6 ${
          scrolled
            ? 'border-stone-300/70 bg-[#fff8ef]/85 shadow-[0_18px_48px_rgba(89,64,39,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#101c24]/82 dark:shadow-[0_18px_48px_rgba(0,0,0,0.28)]'
            : 'border-stone-300/40 bg-[#fff8ef]/55 backdrop-blur-lg dark:border-white/8 dark:bg-[#101c24]/55'
        }`}
      >
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/landing-page" className="flex items-center gap-3">
            <AppLogo size={30} />
            <div className="leading-none">
              <span className="font-display text-xl tracking-tight text-stone-900 dark:text-stone-100">
                APIverse
              </span>
              <p className="eyebrow mt-1 text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                Interface for ambitious teams
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-900 hover:text-stone-50 dark:text-stone-300 dark:hover:bg-stone-100 dark:hover:text-stone-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={toggleCart}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition hover:border-stone-900 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-white"
              aria-label="Open shortlist"
            >
              <Bookmark size={16} />
              {hydrated && itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_rgba(216,95,67,0.28)]">
                  {itemCount}
                </span>
              ) : null}
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition hover:border-stone-900 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {session ? (
              <Link
                href="/developer-dashboard"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200 dark:text-stone-200 dark:hover:bg-white/10"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200 dark:text-stone-200 dark:hover:bg-white/10"
              >
                Sign In
              </Link>
            )}
            <Link
              href={session ? '/developer-dashboard' : '/login'}
              className="rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(216,95,67,0.28)] transition hover:translate-y-[-1px]"
            >
              {session ? 'Open Workspace' : 'Request Access'}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
              aria-label="Open shortlist"
            >
              <Bookmark size={16} />
              {hydrated && itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-700 transition dark:border-white/10 dark:bg-white/5 dark:text-stone-200"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-stone-300/60 py-4 dark:border-white/10 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 dark:text-stone-200 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={session ? '/developer-dashboard' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-4 py-3 text-sm font-semibold text-white"
              >
                {session ? 'Dashboard' : 'Sign In'}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
