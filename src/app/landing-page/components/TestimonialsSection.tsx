import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 'testimonial-arjun',
    name: 'Arjun Mehta',
    role: 'Backend Engineer',
    company: 'Zerodha',
    avatar: 'AM',
    avatarGradient: 'from-blue-500 to-cyan-500',
    rating: 5,
    quote: "We integrated 6 government APIs in a weekend. The documentation is exceptional and the uptime has been flawless for 8 months straight. APIverse saved us months of procurement headaches.",
  },
  {
    id: 'testimonial-priya',
    name: 'Priya Nair',
    role: 'CTO & Co-founder',
    company: 'FinStack',
    avatar: 'PN',
    avatarGradient: 'from-violet-500 to-pink-500',
    rating: 5,
    quote: "The Aadhaar and GST verification APIs went live in our KYC flow in under 2 hours. The sandbox environment is exactly what we needed to test edge cases before production.",
  },
  {
    id: 'testimonial-dev',
    name: 'Devraj Bose',
    role: 'Senior SDE',
    company: 'Navi Technologies',
    avatar: 'DB',
    avatarGradient: 'from-emerald-500 to-teal-500',
    rating: 5,
    quote: "The usage analytics dashboard alone is worth it. I can see exactly which endpoints are slow and get alerted before quota runs out. No other marketplace does this.",
  },
  {
    id: 'testimonial-kavya',
    name: 'Kavya Reddy',
    role: 'Product Engineer',
    company: 'CRED',
    avatar: 'KR',
    avatarGradient: 'from-amber-500 to-orange-500',
    rating: 4,
    quote: "Switched from direct NPCI integration to APIverse's UPI API layer. Response times improved by 40% and we got built-in retry logic and fallback routing for free.",
  },
  {
    id: 'testimonial-vikram',
    name: 'Vikram Sharma',
    role: 'Founder',
    company: 'LogiTrack',
    avatar: 'VS',
    avatarGradient: 'from-rose-500 to-red-500',
    rating: 5,
    quote: "As a solo founder, I can't afford to manage multiple API vendor relationships. APIverse consolidates everything - billing, keys, monitoring - into one place. Game changer.",
  },
  {
    id: 'testimonial-ananya',
    name: 'Ananya Iyer',
    role: 'Platform Lead',
    company: 'Groww',
    avatar: 'AI',
    avatarGradient: 'from-sky-500 to-blue-500',
    rating: 5,
    quote: "The AI Gateway API with built-in cost tracking is brilliant. We went from spending hours on OpenAI cost analysis to a 30-second dashboard check every morning.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 xl:py-28 dark:bg-[#080f20]/40 bg-slate-100/60 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
            Developer Stories
          </p>
          <h2 className="text-3xl xl:text-4xl font-bold dark:text-white text-slate-900 mb-3">
            Loved by 48,000+ developers
          </h2>
          <p className="dark:text-slate-400 text-slate-600 text-base max-w-xl mx-auto">
            Engineers at India&apos;s fastest-growing startups trust APIverse for production-critical integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5">
          {testimonials?.map((t) => (
            <div
              key={t?.id}
              className="p-6 dark:bg-[#080f20] bg-white dark:border dark:border-white/6 border border-slate-200 rounded-2xl dark:hover:border-white/12 hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5 flex flex-col shadow-sm dark:shadow-none"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 })?.map((_, si) => (
                  <Star
                    key={`${t?.id}-star-${si}`}
                    size={12}
                    className={si < t?.rating ? 'text-amber-400 fill-amber-400' : 'dark:text-slate-700 text-slate-300'}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed flex-1 mb-5">
                &ldquo;{t?.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 dark:border-t dark:border-white/5 border-t border-slate-100">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t?.avatarGradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{t?.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold dark:text-white text-slate-900">{t?.name}</p>
                  <p className="text-xs dark:text-slate-500 text-slate-500">{t?.role} · {t?.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
