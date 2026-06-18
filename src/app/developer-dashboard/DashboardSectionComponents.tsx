import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function DashboardPageFrame({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 pb-10 pt-8 lg:px-8 xl:px-10 2xl:px-16">
      <main className="mx-auto max-w-screen-2xl space-y-8">
        <section className="rounded-[34px] border border-stone-300/70 bg-[#fff8ef]/78 p-7 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/86">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">{eyebrow}</p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-stone-950 dark:text-stone-50">{title}</h1>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}

export function DashboardMetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-[26px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
      <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-4 font-display text-4xl text-stone-950 dark:text-stone-50">{value}</p>
      <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{note}</p>
    </article>
  );
}

export function DashboardPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <article className="editorial-card rounded-[32px] p-6">
      <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">{eyebrow}</p>
      <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </article>
  );
}

export function DashboardActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-white/20 dark:hover:text-stone-50"
    >
      {label}
      <ArrowUpRight size={12} />
    </Link>
  );
}
