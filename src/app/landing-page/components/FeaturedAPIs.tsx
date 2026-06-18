'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

const featuredAPIs = [
  {
    id: 'api-aadhaar-verify',
    name: 'Aadhaar Verification',
    provider: 'UIDAI — Government of India',
    description: 'Real-time Aadhaar number verification and demographic data lookup with OTP-based consent flow.',
    category: 'Government',
    categoryColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    tags: ['KYC', 'Identity', 'Gov'],
    rating: 4.9,
    reviews: 2341,
    pricing: 'Freemium',
    pricingColor: 'text-emerald-400 bg-emerald-500/10',
    uptime: 99.97,
    latency: '38ms',
    callsToday: '1.2M',
    trending: true,
  },
  {
    id: 'api-gst-lookup',
    name: 'GST Number Lookup',
    provider: 'GSTN — Ministry of Finance',
    description: 'Validate and fetch GST registration details, return filing status, and business information instantly.',
    category: 'Government',
    categoryColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    tags: ['Tax', 'Business', 'Gov'],
    rating: 4.8,
    reviews: 1876,
    pricing: 'Free',
    pricingColor: 'text-emerald-400 bg-emerald-500/10',
    uptime: 99.94,
    latency: '52ms',
    callsToday: '840K',
    trending: false,
  },
  {
    id: 'api-openai-proxy',
    name: 'OpenAI Gateway',
    provider: 'APIverse AI Layer',
    description: 'Pre-configured OpenAI GPT-4o proxy with rate limiting, cost tracking, and fallback models built in.',
    category: 'AI / ML',
    categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    tags: ['LLM', 'GPT-4o', 'AI'],
    rating: 4.7,
    reviews: 3120,
    pricing: 'Pay-as-you-go',
    pricingColor: 'text-amber-400 bg-amber-500/10',
    uptime: 99.91,
    latency: '310ms',
    callsToday: '2.8M',
    trending: true,
  },
  {
    id: 'api-razorpay-upi',
    name: 'UPI Payment Status',
    provider: 'NPCI — Payments',
    description: 'Check real-time UPI transaction status, VPA validation, and merchant payment confirmation.',
    category: 'Payments',
    categoryColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    tags: ['UPI', 'Payments', 'NPCI'],
    rating: 4.8,
    reviews: 987,
    pricing: 'Paid',
    pricingColor: 'text-rose-400 bg-rose-500/10',
    uptime: 99.99,
    latency: '28ms',
    callsToday: '560K',
    trending: false,
  },
  {
    id: 'api-pincode-lookup',
    name: 'India Pincode API',
    provider: 'India Post — Government',
    description: 'Lookup postal data, district, state, and nearby post offices for any 6-digit Indian pincode.',
    category: 'Government',
    categoryColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    tags: ['Postal', 'Location', 'Gov'],
    rating: 4.6,
    reviews: 4230,
    pricing: 'Free',
    pricingColor: 'text-emerald-400 bg-emerald-500/10',
    uptime: 100,
    latency: '18ms',
    callsToday: '3.4M',
    trending: false,
  },
  {
    id: 'api-sms-gateway',
    name: 'SMS & OTP Gateway',
    provider: 'APIverse Messaging',
    description: 'Send transactional SMS and OTPs across 190+ countries with delivery receipts and analytics.',
    category: 'Messaging',
    categoryColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    tags: ['SMS', 'OTP', 'Transactional'],
    rating: 4.5,
    reviews: 1654,
    pricing: 'Pay-as-you-go',
    pricingColor: 'text-amber-400 bg-amber-500/10',
    uptime: 99.88,
    latency: '95ms',
    callsToday: '420K',
    trending: true,
  },
];

const numberFormatter = new Intl.NumberFormat('en-US');

export default function FeaturedAPIs() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="py-20 xl:py-28 dark:bg-transparent bg-slate-50 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
              Featured APIs
            </p>
            <h2 className="text-3xl xl:text-4xl font-bold dark:text-white text-slate-900">
              Top APIs this week
            </h2>
            <p className="dark:text-slate-400 text-slate-600 mt-2 text-base">
              Hand-picked by our team — highest usage, best uptime, freshest docs.
            </p>
          </div>
          <Link
            href="/api-marketplace"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors flex-shrink-0"
          >
            View all 2,400+ APIs
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5">
          {featuredAPIs?.map((api) => (
            <Link
              key={api?.id}
              href="/api-marketplace"
              onMouseEnter={() => setHovered(api?.id)}
              onMouseLeave={() => setHovered(null)}
              className={`
                group relative flex flex-col p-5 dark:bg-[#080f20] bg-white border rounded-2xl
                transition-all duration-300 cursor-pointer
                ${hovered === api?.id
                  ? 'border-blue-500/40 dark:shadow-xl dark:shadow-blue-500/8 shadow-lg shadow-blue-500/10 -translate-y-0.5'
                  : 'dark:border-white/6 border-slate-200 dark:hover:border-white/12 hover:border-slate-300'
                }
              `}
            >
              {/* Trending badge */}
              {api?.trending && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <TrendingUp size={10} className="text-amber-500" />
                  <span className="text-[10px] font-semibold text-amber-500">Trending</span>
                </div>
              )}

              {/* Category + Pricing */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${api?.categoryColor}`}>
                  {api?.category}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${api?.pricingColor}`}>
                  {api?.pricing}
                </span>
              </div>

              {/* Name + Provider */}
              <h3 className="text-base font-semibold dark:text-white text-slate-900 mb-0.5 group-hover:text-blue-500 transition-colors">
                {api?.name}
              </h3>
              <p className="text-xs dark:text-slate-500 text-slate-500 mb-3">{api?.provider}</p>

              {/* Description */}
              <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed mb-4 flex-1">
                {api?.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {api?.tags?.map((tag) => (
                  <span
                    key={`${api?.id}-tag-${tag}`}
                    className="text-[11px] font-medium px-2 py-0.5 dark:bg-white/4 bg-slate-100 dark:border dark:border-white/8 border border-slate-200 rounded-md dark:text-slate-500 text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer stats */}
              <div className="flex items-center justify-between pt-3 dark:border-t dark:border-white/5 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold dark:text-slate-300 text-slate-700">{api?.rating}</span>
                  <span className="text-xs dark:text-slate-600 text-slate-400">({numberFormatter.format(api.reviews)})</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-500" />
                  <span className="text-xs dark:text-slate-500 text-slate-500">{api?.uptime}% uptime</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={11} className="text-blue-500" />
                  <span className="text-xs dark:text-slate-500 text-slate-500">{api?.latency}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
