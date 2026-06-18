'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Zap, Shield, Globe } from 'lucide-react';


const codeSnippet = `// Fetch with APIverse in seconds
const res = await fetch(
  'https://api.apiverse.dev/v1/weather',
  {
    headers: {
      'X-API-Key': 'ask_live_••••••••••••',
      'Content-Type': 'application/json'
    }
  }
);

const data = await res.json();
// { temp: 28.4, city: "Mumbai", 
//   humidity: 72, status: "sunny" }`;

const pills = [
  { icon: Zap, label: '10M+ API Calls / Day', color: 'text-blue-400' },
  { icon: Shield, label: 'SOC 2 Type II', color: 'text-violet-400' },
  { icon: Globe, label: '2,400+ APIs', color: 'text-emerald-400' },
];

const numberFormatter = new Intl.NumberFormat('en-US');

export default function HeroSection() {
  const [callCount, setCallCount] = useState(10482341);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallCount((prev) => prev + Math.floor(Math.random() * 8 + 2));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center dark:hero-gradient dark:grid-pattern bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 dark:bg-none overflow-hidden transition-colors duration-300">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 dark:bg-blue-600/10 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 dark:bg-violet-600/10 bg-violet-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] dark:bg-blue-500/5 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* Left: Copy */}
          <div className="animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse-slow" />
              Now live: India Government API Hub — 340+ APIs
            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight dark:text-white text-slate-900 mb-6">
              Discover, Test &{' '}
              <span className="gradient-text">Manage APIs</span>
              <br />
              in One Place
            </h1>

            <p className="text-lg dark:text-slate-400 text-slate-600 leading-relaxed mb-8 max-w-xl">
              APIverse is the developer marketplace for government and private APIs.
              Get API keys, test endpoints live, monitor usage, and ship faster —
              all from a single dashboard.
            </p>

            {/* Pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {pills?.map((pill) => {
                const Icon = pill?.icon;
                return (
                  <div
                    key={`hero-pill-${pill?.label}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full dark:bg-white/5 bg-white dark:border dark:border-white/8 border border-slate-200 text-xs font-medium dark:text-slate-400 text-slate-600 shadow-sm dark:shadow-none"
                  >
                    <Icon size={12} className={pill?.color} />
                    {pill?.label}
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/api-marketplace"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-blue-500/25 glow-blue"
              >
                Explore APIs
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/developer-dashboard"
                className="group inline-flex items-center gap-2 px-6 py-3 dark:bg-white/5 bg-white dark:hover:bg-white/10 hover:bg-slate-50 dark:text-white text-slate-900 font-semibold rounded-xl dark:border dark:border-white/10 border border-slate-200 hover:border-slate-300 transition-all duration-150 active:scale-95 shadow-sm dark:shadow-none"
              >
                <Play size={14} className="text-blue-500" />
                Get API Key Free
              </Link>
            </div>

            {/* Live counter */}
            <div className="flex items-center gap-2 text-sm dark:text-slate-500 text-slate-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow" />
              <span className="tabular-nums font-mono text-emerald-500 font-semibold">
                {numberFormatter.format(callCount)}
              </span>
              <span>API calls served today</span>
            </div>
          </div>

          {/* Right: Code Panel */}
          <div className="animate-slide-up lg:animate-slide-in-right">
            <div className="relative">
              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-semibold animate-float">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                99.98% Uptime
              </div>
              <div className="absolute -top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-xs font-semibold animate-float" style={{ animationDelay: '1s' }}>
                <Zap size={10} />
                ~42ms avg latency
              </div>

              {/* Code card */}
              <div className="dark:bg-[#080f20] bg-slate-900 dark:border dark:border-white/8 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl dark:shadow-black/40 shadow-slate-900/20">
                {/* Terminal header */}
                <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/5 border-slate-700/50 dark:bg-white/2 bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">quickstart.ts</span>
                  <div className="w-16" />
                </div>
                {/* Code content */}
                <div className="p-5 overflow-x-auto scrollbar-hide">
                  <pre className="text-sm font-mono leading-relaxed">
                    {codeSnippet?.split('\n')?.map((line, i) => (
                      <div key={`code-line-${i}`} className="flex">
                        <span className="w-8 text-slate-600 select-none text-right mr-4 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span
                          className={
                            line?.startsWith('//') ? 'text-slate-500' :
                            line?.includes('await fetch') || line?.includes('const') ? 'text-blue-400' :
                            line?.includes("'") || line?.includes('"') ? 'text-emerald-400' :
                            line?.includes('{') || line?.includes('}') ? 'text-slate-300' :
                            'text-slate-300'
                          }
                        >
                          {line}
                        </span>
                      </div>
                    ))}
                  </pre>
                </div>
                {/* Response bar */}
                <div className="px-5 py-3 border-t dark:border-white/5 border-slate-700/50 bg-emerald-500/5 flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400">200 OK</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs font-mono text-slate-400">42ms</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-400">1.2 KB</span>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute inset-0 -z-10 bg-blue-600/5 rounded-2xl blur-2xl scale-110" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
