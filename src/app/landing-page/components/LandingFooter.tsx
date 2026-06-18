import Link from 'next/link';

import AppLogo from '@/components/ui/AppLogo';

const footerLinks = {
  Explore: [
    { label: 'Marketplace', href: '/api-marketplace' },
    { label: 'Docs', href: '/docs' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Company: [
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/landing-page' },
    { label: 'Login', href: '/login' },
  ],
  Support: [
    { label: 'API Reference', href: '/docs' },
    { label: 'Operational Guides', href: '/docs' },
    { label: 'Security', href: '/docs' },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="px-6 pb-10 pt-20 lg:px-8 xl:px-10 2xl:px-16">
      <div className="mx-auto max-w-screen-2xl rounded-[32px] border border-stone-300/70 bg-[#fff8ef]/85 p-8 shadow-[0_24px_60px_rgba(96,70,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-[#101c24]/84 dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <AppLogo size={30} />
              <div>
                <p className="font-display text-2xl text-stone-900 dark:text-stone-100">APIverse</p>
                <p className="eyebrow mt-1 text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                  Crafted for teams shipping fast
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 dark:text-stone-400">
              A more deliberate interface for discovering APIs, issuing credentials, tracking usage, and collaborating with confidence across every environment.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-500">{section}</p>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-stone-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-stone-300/70 pt-6 text-xs text-stone-500 dark:border-white/10 dark:text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 APIverse Technologies Pvt. Ltd. All rights reserved.</p>
          <p>Designed for product teams who care what the interface feels like.</p>
        </div>
      </div>
    </footer>
  );
}
