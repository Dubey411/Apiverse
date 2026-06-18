'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const providers = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
] as const;

export default function LoginExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(
    callbackError ? 'Authentication failed. Please try again.' : null,
  );

  async function handleOAuth(providerId: string) {
    if (loading || formLoading) return;
    setLoading(providerId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      });

      const data = (await res.json()) as { url?: string; message?: string };

      if (!res.ok || !data.url) {
        setError(data.message ?? 'Could not start sign-in. Please try again.');
        setLoading(null);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setError('Network error. Please try again.');
      setLoading(null);
    }
  }

  async function handleManualAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formLoading || loading) return;

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.name.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.user && !data.session) {
          setSuccess('Account created. Check your email to confirm your account, then sign in.');
          setMode('signin');
          setForm((current) => ({ ...current, password: '' }));
          return;
        }

        router.push('/developer-dashboard');
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push('/developer-dashboard');
      router.refresh();
    } catch {
      setError('Could not complete authentication. Please try again.');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-14 pt-24 lg:px-8 xl:px-12 2xl:px-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(239,125,82,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(43,138,125,0.08),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl">
        <section className="mb-8 rounded-[32px] border border-stone-300/70 bg-[#fff8ef]/78 p-7 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/88 sm:p-8">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-3 py-1 text-[10px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
            <ShieldCheck size={12} />
            Workspace entry
          </span>
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl font-display text-4xl leading-tight text-stone-950 dark:text-stone-50 sm:text-5xl">
                Sign in to APIverse your way.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600 dark:text-stone-300">
                Manual account access lives on the left. Social and provider login lives on the right.
              </p>
            </div>
            <div className="rounded-[22px] border border-stone-300/70 bg-white/68 px-4 py-3 text-sm text-stone-600 dark:border-white/8 dark:bg-white/5 dark:text-stone-300">
              One workspace for discovery, docs, shortlist, and connected credentials.
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-stone-300/70 bg-[#fff8ef]/82 p-7 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/90">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ece4] text-[#d85f43] dark:bg-[#211614] dark:text-[#efb28f]">
                <Lock size={18} />
              </div>
              <div>
                <p className="font-display text-3xl text-stone-950 dark:text-stone-50">
                  {mode === 'signin' ? 'Manual sign in' : 'Create account'}
                </p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  Email and password for direct account access.
                </p>
              </div>
            </div>

            <div className="mt-6 inline-flex w-full rounded-2xl border border-stone-300/70 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 rounded-[14px] px-4 py-2 text-sm font-medium transition ${
                  mode === 'signin'
                    ? 'bg-stone-950 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                    : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/5'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 rounded-[14px] px-4 py-2 text-sm font-medium transition ${
                  mode === 'signup'
                    ? 'bg-stone-950 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                    : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/5'
                }`}
              >
                Create account
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-[#d85f43]/20 bg-[#fff0df] px-4 py-3 text-sm text-[#b8573f] dark:border-[#ef7d52]/25 dark:bg-[#211614] dark:text-[#efb28f]">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
                {success}
              </div>
            )}

            <form onSubmit={handleManualAuth} className="mt-5 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    Full name
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-stone-300/70 bg-white/75 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-white/20"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  Email
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-stone-300/70 bg-white/75 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-white/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  Password
                </label>
                <input
                  suppressHydrationWarning
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'}
                  className="w-full rounded-2xl border border-stone-300/70 bg-white/75 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-white/20"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !!loading}
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#ef7d52,#d85f43)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(216,95,67,0.28)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formLoading
                  ? mode === 'signin'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'signin'
                    ? 'Sign in with email'
                    : 'Create account'}
              </button>
            </form>

            <div className="mt-6 rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
              <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
                Your manual account keeps API subscriptions, premium purchases, and workspace billing tied to one email.
              </p>
            </div>
          </section>

          <section className="rounded-[32px] border border-stone-300/70 bg-[#fff8ef]/82 p-7 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/90">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ece4] text-[#d85f43] dark:bg-[#211614] dark:text-[#efb28f]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-display text-3xl text-stone-950 dark:text-stone-50">Provider login</p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  Use the account your team already trusts.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {providers.map((provider) => {
                const isLoading = loading === provider.id;
                const isDisabled = !!loading || formLoading;

                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleOAuth(provider.id)}
                    disabled={isDisabled}
                    className={[
                      'group flex w-full items-center gap-4 rounded-2xl border border-stone-300/70 bg-white/70 px-4 py-4 text-left text-sm font-medium text-stone-800 transition dark:border-white/10 dark:bg-white/5 dark:text-stone-100',
                      'hover:border-stone-900 hover:bg-white dark:hover:border-white/20 dark:hover:bg-white/8',
                      isDisabled && !isLoading ? 'cursor-not-allowed opacity-50' : '',
                    ].join(' ')}
                  >
                    <span className="shrink-0">{provider.icon}</span>
                    <span className="flex-1">{provider.label}</span>
                    {isLoading ? (
                      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900 dark:border-white/20 dark:border-t-white" />
                    ) : (
                      <span className="text-stone-400 transition group-hover:translate-x-0.5">→</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-stone-300/70 dark:bg-white/8" />
              <span className="text-xs text-stone-500 dark:text-stone-500">Secured by Supabase Auth</span>
              <div className="h-px flex-1 bg-stone-300/70 dark:bg-white/8" />
            </div>

            <div className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
              <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
                Google and GitHub only work after the providers are enabled in your Supabase project and the correct callback URL is configured.
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-stone-500 dark:text-stone-500">
              By continuing you agree to our{' '}
              <Link href="/docs" className="underline-offset-2 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/docs" className="underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
