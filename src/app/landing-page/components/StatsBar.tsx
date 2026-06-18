import React from 'react';

const stats = [
  { value: '2,400+', label: 'APIs Available' },
  { value: '48K+', label: 'Active Developers' },
  { value: '10M+', label: 'Calls / Day' },
  { value: '340+', label: 'Gov APIs' },
  { value: '99.98%', label: 'Avg Uptime' },
  { value: '<45ms', label: 'Avg Latency' },
];

const trustedLogos = [
  'Zerodha', 'Razorpay', 'CRED', 'Groww', 'PhonePe', 'Navi', 'Slice', 'Fi Money',
];

export default function StatsBar() {
  return (
    <section className="relative dark:border-y dark:border-white/5 border-y border-slate-200 dark:bg-[#080f20]/60 bg-white/80 backdrop-blur-sm transition-colors duration-300">
      {/* Stats */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats?.map((stat) => (
            <div key={`stat-${stat?.label}`} className="text-center">
              <p className="text-2xl xl:text-3xl font-bold tabular-nums gradient-text mb-1">
                {stat?.value}
              </p>
              <p className="text-xs dark:text-slate-500 text-slate-500 font-medium">{stat?.label}</p>
            </div>
          ))}
        </div>

        {/* Trusted by */}
        <div className="mt-10 pt-8 dark:border-t dark:border-white/5 border-t border-slate-200">
          <p className="text-center text-xs font-semibold uppercase tracking-widest dark:text-slate-600 text-slate-400 mb-6">
            Trusted by engineering teams at
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {trustedLogos?.map((logo) => (
              <span
                key={`trusted-${logo}`}
                className="text-sm font-semibold dark:text-slate-600 text-slate-400 dark:hover:text-slate-400 hover:text-slate-600 transition-colors cursor-default"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}