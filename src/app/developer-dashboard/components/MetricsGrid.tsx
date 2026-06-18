import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, ShieldCheck, Timer, CreditCard, Activity, Calendar } from 'lucide-react';


const metrics = [
  {
    id: 'metric-calls',
    label: 'API Calls (MTD)',
    value: '284,921',
    change: '+12.4%',
    trend: 'up',
    subtext: 'vs 253,670 last month',
    icon: Activity,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    accent: 'border-blue-500/15',
    colSpan: 'md:col-span-2',
  },
  {
    id: 'metric-quota',
    label: 'Quota Remaining',
    value: '65,079',
    change: '78% used',
    trend: 'warning',
    subtext: 'of 350,000 monthly calls',
    icon: Zap,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    accent: 'border-amber-500/20 bg-amber-500/3',
    colSpan: '',
    progressValue: 78,
  },
  {
    id: 'metric-success',
    label: 'Success Rate',
    value: '99.41%',
    change: '-0.08%',
    trend: 'down',
    subtext: '1,679 errors this month',
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    accent: 'border-white/6',
    colSpan: '',
  },
  {
    id: 'metric-latency',
    label: 'Avg Response Time',
    value: '47ms',
    change: '+3ms',
    trend: 'neutral',
    subtext: 'p95: 142ms this period',
    icon: Timer,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    accent: 'border-white/6',
    colSpan: '',
  },
  {
    id: 'metric-connections',
    label: 'Connected APIs',
    value: '5',
    change: '+1',
    trend: 'up',
    subtext: 'Added Stripe sandbox connection Apr 14',
    icon: CreditCard,
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/10',
    accent: 'border-white/6',
    colSpan: '',
  },
  {
    id: 'metric-billing',
    label: 'Shortlist review',
    value: '6 days',
    change: 'Next compare',
    trend: 'neutral',
    subtext: 'Estimated: ₹2,840 / month',
    icon: Calendar,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    accent: 'border-white/6',
    colSpan: '',
  },
];

export default function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {metrics?.map((m) => {
        const Icon = m?.icon;
        const TrendIcon = m?.trend === 'up' ? TrendingUp : m?.trend === 'down' ? TrendingDown : Minus;
        const trendColor = m?.trend === 'up' ? 'text-emerald-500' : m?.trend === 'down' ? 'text-rose-500' : m?.trend === 'warning' ? 'text-amber-500' : 'dark:text-slate-500 text-slate-400';

        return (
          <div
            key={m?.id}
            className={`
              p-5 dark:bg-[#080f20] bg-white border rounded-2xl transition-all duration-200 dark:hover:border-white/12 hover:border-slate-300
              ${m?.accent?.includes('amber') ? 'dark:border-amber-500/20 border-amber-200 dark:bg-amber-500/3 bg-amber-50/50' : 'dark:border-white/6 border-slate-200'}
              ${m?.colSpan}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-xl ${m?.iconBg} flex items-center justify-center`}>
                <Icon size={16} className={m?.iconColor} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                {m?.trend !== 'warning' && <TrendIcon size={12} />}
                {m?.change}
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider dark:text-slate-600 text-slate-400 mb-1">
              {m?.label}
            </p>
            <p className="text-2xl xl:text-3xl font-bold dark:text-white text-slate-900 tabular-nums mb-1">
              {m?.value}
            </p>
            <p className="text-xs dark:text-slate-500 text-slate-500">{m?.subtext}</p>
            {/* Quota progress bar */}
            {m?.progressValue !== undefined && (
              <div className="mt-3">
                <div className="w-full h-1.5 dark:bg-white/5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${m?.progressValue}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
