import React from 'react';
import { Search, Key, Code2, BarChart3 } from 'lucide-react';


const steps = [
  {
    id: 'step-discover',
    step: '01',
    icon: Search,
    title: 'Discover the right API',
    description: 'Search across 2,400+ APIs by category, use case, or provider. Filter by pricing, uptime, and SDK support.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    id: 'step-key',
    step: '02',
    icon: Key,
    title: 'Get your API key instantly',
    description: 'Sign up, pick a plan, and receive your API key in seconds. No manual approval, no waiting.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    id: 'step-integrate',
    step: '03',
    icon: Code2,
    title: 'Integrate with one snippet',
    description: 'Copy the ready-made code snippet in your language of choice. Test live in our Try API sandbox.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    id: 'step-monitor',
    step: '04',
    icon: BarChart3,
    title: 'Monitor & scale confidently',
    description: 'Track usage, error rates, and latency from your dashboard. Get alerted before you hit quota limits.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 xl:py-28 dark:bg-transparent bg-white transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
            How It Works
          </p>
          <h2 className="text-3xl xl:text-4xl font-bold dark:text-white text-slate-900 mb-3">
            From zero to integrated in minutes
          </h2>
          <p className="dark:text-slate-400 text-slate-600 text-base max-w-xl mx-auto">
            APIverse removes every friction point between finding an API and shipping with it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {steps?.map((step, i) => {
            const Icon = step?.icon;
            return (
              <div key={step?.id} className="relative">
                {/* Connector line */}
                {i < steps?.length - 1 && (
                  <div className="hidden xl:block absolute top-8 left-full w-full h-px bg-gradient-to-r dark:from-white/10 from-slate-200 to-transparent z-0 -translate-x-4" />
                )}
                <div className={`relative z-10 p-6 dark:bg-[#080f20] bg-white border ${step?.border} rounded-2xl h-full dark:shadow-none shadow-sm`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${step?.bg} flex items-center justify-center`}>
                      <Icon size={18} className={step?.color} />
                    </div>
                    <span className={`text-2xl font-bold tabular-nums ${step?.color} opacity-30`}>
                      {step?.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold dark:text-white text-slate-900 mb-2">{step?.title}</h3>
                  <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">{step?.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
