'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Clock3,
  Globe2,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { MonitoringDashboardModel } from '@/lib/api-monitoring/dashboard';

const rangeOptions = ['24h', '7d', '30d'] as const;
type RangeKey = (typeof rangeOptions)[number];

const numberFormat = new Intl.NumberFormat('en-US');

function UsageTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[150px] rounded-2xl border border-stone-300/70 bg-white/95 p-3 shadow-[0_20px_40px_rgba(96,70,42,0.14)] dark:border-white/10 dark:bg-[#0d1720]">
      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-stone-600 dark:text-stone-300">{entry.name}</span>
            </div>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{numberFormat.format(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardExperience({
  workspace,
}: {
  workspace: MonitoringDashboardModel;
}) {
  const [range, setRange] = useState<RangeKey>('7d');
  const chartData = workspace.charts[range];
  const topStats = [
    {
      label: 'Registered APIs',
      value: workspace.metrics.totalApis,
      note: 'APIs you uploaded and authorized APIverse to monitor.',
      icon: Globe2,
      tone: 'text-[#d85f43]',
    },
    {
      label: 'Healthy APIs',
      value: workspace.metrics.healthyApis,
      note: 'Latest checks completed without warning or critical issues.',
      icon: ShieldCheck,
      tone: 'text-[#2b8a7d]',
    },
    {
      label: 'Open alerts',
      value: workspace.metrics.openAlerts,
      note: 'Expiry, quota, uptime, and posture warnings still needing action.',
      icon: LineChart,
      tone: 'text-[#d68d2e]',
    },
    {
      label: 'Average latency',
      value: workspace.metrics.avgLatency,
      note: 'Latest observed monitor latency across registered APIs.',
      icon: Clock3,
      tone: 'text-[#6b7fd7]',
    },
  ];

  return (
    <div className="min-h-screen px-6 pb-10 pt-8 lg:px-8 xl:px-10 2xl:px-16">
      <main className="mx-auto max-w-screen-2xl space-y-8">
        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0 rounded-[34px] border border-stone-300/70 bg-[#fff8ef]/78 p-7 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b1520]/86">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Workspace overview</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-stone-950 dark:text-stone-50">
                  Upload your APIs and keep their operational truth visible.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300">
                  APIverse now works best as a monitoring layer for APIs you own or are explicitly allowed to manage. Register an endpoint, capture quota and expiry hints, and let the workspace turn checks into alerts and analytics.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/75 px-4 py-2 text-xs font-semibold text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
                <span className="h-2 w-2 rounded-full bg-[#2b8a7d] animate-pulse-slow" />
                {workspace.metrics.totalApis} APIs under watch
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {topStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.label} className="min-w-0 rounded-[26px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow min-w-0 max-w-[11rem] text-[10px] font-semibold leading-5 text-stone-500 dark:text-stone-400">
                        {stat.label}
                      </p>
                      <Icon size={16} className={`${stat.tone} shrink-0`} />
                    </div>
                    <p className="mt-4 break-words font-display text-[2.2rem] leading-none tracking-tight text-stone-950 dark:text-stone-50 sm:text-[2.4rem]">
                      {stat.value}
                    </p>
                    <p className="mt-3 max-w-[16rem] break-words text-sm leading-7 text-stone-600 dark:text-stone-400">
                      {stat.note}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 grid gap-4">
            <article className="editorial-card min-w-0 rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-[#f3e8dc] dark:bg-[#f3e8dc] dark:text-[#12212b]">
                  <AlertTriangle size={18} />
                </div>
                <span className="rounded-full bg-[#f4e4d8] px-3 py-1 text-[11px] font-semibold text-[#a44d38] dark:bg-[#261815] dark:text-[#efb28f]">
                  Next actions
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">Action queue</h2>
              <div className="mt-5 space-y-4">
                {workspace.actionQueue.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-[22px] border border-stone-300/70 bg-[#fffaf3] p-4 dark:border-white/8 dark:bg-black/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`break-words text-sm font-semibold leading-7 ${item.accent}`}>{item.title}</p>
                        <p className="mt-1 break-words text-sm leading-7 text-stone-600 dark:text-stone-400">{item.detail}</p>
                      </div>
                      <ArrowUpRight size={14} className="mt-1 shrink-0 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="editorial-card min-w-0 rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-[#f3e8dc] dark:bg-[#f3e8dc] dark:text-[#12212b]">
                  <Bell size={18} />
                </div>
                <span className="rounded-full bg-[#e7f3ef] px-3 py-1 text-[11px] font-semibold text-[#23695d] dark:bg-[#10231f] dark:text-[#82d2c7]">
                  {workspace.activity.length} recent updates
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl text-stone-950 dark:text-stone-50">Recent activity</h2>
              <div className="mt-5 space-y-4">
                {workspace.activity.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex gap-3">
                    <div className="mt-1 flex flex-col items-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#d85f43]" />
                      <span className="mt-1 h-full w-px bg-stone-300/70 dark:bg-white/8" />
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">{item.time}</p>
                      <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.title}</p>
                      <p className="mt-1 text-sm leading-7 text-stone-600 dark:text-stone-400">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="editorial-card min-w-0 rounded-[32px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Checks</p>
                <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">Monitoring cadence</h2>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">This chart is built from API health, quota, expiry, and security checks run against your registered APIs.</p>
              </div>
              <div className="inline-flex rounded-full border border-stone-300/70 bg-white/75 p-1 dark:border-white/10 dark:bg-white/5">
                {rangeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRange(option)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      range === option
                        ? 'bg-stone-950 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-[280px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d85f43" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#d85f43" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="errorsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2b8a7d" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2b8a7d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(120,95,72,0.12)" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8a7768', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8a7768', fontSize: 11 }} />
                  <Tooltip content={<UsageTooltip />} cursor={{ stroke: 'rgba(120,95,72,0.18)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="calls" stroke="#d85f43" strokeWidth={2.5} fill="url(#callsFill)" dot={false} />
                  <Area type="monotone" dataKey="errors" stroke="#2b8a7d" strokeWidth={2} fill="url(#errorsFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="editorial-card min-w-0 rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Risk pipeline</p>
                <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">What needs attention</h2>
              </div>
              <span className="rounded-full bg-[#fff0df] px-3 py-1 text-[11px] font-semibold text-[#b8573f] dark:bg-[#2a1815] dark:text-[#efb28f]">
                {workspace.metrics.openAlerts} alerts open
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {workspace.usageRows.map((row, index) => (
                <div key={`${row.label}-${index}`}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{row.label}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{row.value}</p>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-stone-200/70 dark:bg-white/8">
                    <div
                      className={`h-2.5 rounded-full ${row.progress > 80 ? 'bg-[#d85f43]' : row.progress > 65 ? 'bg-[#d68d2e]' : 'bg-[#2b8a7d]'}`}
                      style={{ width: `${row.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <ShieldAlert size={18} className="text-[#d85f43]" />
                <p className="mt-4 font-display text-3xl text-stone-950 dark:text-stone-50">{workspace.metrics.openAlerts} open alerts</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Expiry, quota, health, and posture warnings all land in the same operational queue.</p>
              </div>
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <Globe2 size={18} className="text-[#2b8a7d]" />
                <p className="mt-4 font-display text-3xl text-stone-950 dark:text-stone-50">{workspace.metrics.totalApis} monitored APIs</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Each monitored API has endpoint metadata, optional quota headers, expiry details, and the latest posture summary attached to it.</p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="editorial-card min-w-0 rounded-[32px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">My APIs</p>
                <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">Monitoring portfolio</h2>
              </div>
              <span className="rounded-full border border-stone-300/70 bg-white/70 px-4 py-2 text-xs font-semibold text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
                {workspace.metrics.totalApis} APIs registered
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-stone-300/70 dark:border-white/8">
              <div className="grid grid-cols-[1.4fr_0.85fr_0.85fr_0.8fr_0.8fr] gap-3 bg-[#fff8ef] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:bg-[#0f1822] dark:text-stone-500">
                <span>API</span>
                <span>Environment</span>
                <span>Watch item</span>
                <span>Status</span>
                <span>Last activity</span>
              </div>
              {workspace.connectedPortfolio.map((item) => (
                <div key={item.id} className="grid grid-cols-[1.4fr_0.85fr_0.85fr_0.8fr_0.8fr] gap-3 border-t border-stone-300/70 bg-white/60 px-5 py-4 text-sm dark:border-white/8 dark:bg-white/5">
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{item.category}</p>
                  </div>
                  <p className="break-words text-stone-700 dark:text-stone-300">{item.environment}</p>
                  <p className="break-words text-stone-700 dark:text-stone-300">{item.usage}</p>
                  <p className={`break-words font-medium ${item.status === 'Critical' ? 'text-[#d85f43]' : item.status === 'Healthy' ? 'text-[#2b8a7d]' : 'text-[#d68d2e]'}`}>
                    {item.status}
                  </p>
                  <p className="break-words font-semibold text-stone-900 dark:text-stone-100">{item.lastActivity}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="editorial-card min-w-0 rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow text-[10px] font-semibold text-stone-500 dark:text-stone-400">Workspace controls</p>
                <h2 className="mt-2 font-display text-4xl text-stone-950 dark:text-stone-50">Quick actions</h2>
              </div>
              <Sparkles size={18} className="text-[#d85f43]" />
            </div>

            <div className="mt-6 space-y-4">
              <button className="flex w-full items-center justify-between rounded-[24px] border border-stone-300/70 bg-[#fffaf3] px-5 py-4 text-left transition hover:border-stone-950 dark:border-white/8 dark:bg-black/10 dark:hover:border-white/20">
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Register another owned API</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Add the next service you own or control so health, quota, expiry, and alerts stay in one workspace.</p>
                </div>
                <ArrowUpRight size={16} className="text-stone-400" />
              </button>
              <button className="flex w-full items-center justify-between rounded-[24px] border border-stone-300/70 bg-[#fffaf3] px-5 py-4 text-left transition hover:border-stone-950 dark:border-white/8 dark:bg-black/10 dark:hover:border-white/20">
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Run monitoring checks</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Health, latency, quota, expiry, and posture only show up after APIverse has checked the endpoint.</p>
                </div>
                <ArrowUpRight size={16} className="text-stone-400" />
              </button>
              <button className="flex w-full items-center justify-between rounded-[24px] border border-stone-300/70 bg-[#fffaf3] px-5 py-4 text-left transition hover:border-stone-950 dark:border-white/8 dark:bg-black/10 dark:hover:border-white/20">
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Review expiry and vulnerability alerts</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">The main value of this workspace is catching upcoming failures before users do.</p>
                </div>
                <ArrowUpRight size={16} className="text-stone-400" />
              </button>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <ShieldCheck size={18} className="text-[#d85f43]" />
                <p className="mt-4 font-display text-3xl text-stone-950 dark:text-stone-50">{workspace.metrics.healthyApis} healthy APIs</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Healthy here means the latest check completed without warning or critical findings.</p>
              </div>
              <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
                <ShieldAlert size={18} className="text-[#2b8a7d]" />
                <p className="mt-4 font-display text-3xl text-stone-950 dark:text-stone-50">{workspace.metrics.openAlerts} alerts open</p>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Alerts can come from expiry windows, low quota, health failures, and non-invasive security posture checks.</p>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
