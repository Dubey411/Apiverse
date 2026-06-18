'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const dailyUsageData = [
  { date: 'Feb 26', calls: 7840, errors: 42 },
  { date: 'Feb 27', calls: 9210, errors: 38 },
  { date: 'Feb 28', calls: 8640, errors: 55 },
  { date: 'Mar 1', calls: 11240, errors: 89 },
  { date: 'Mar 2', calls: 6320, errors: 28 },
  { date: 'Mar 3', calls: 5120, errors: 22 },
  { date: 'Mar 4', calls: 12840, errors: 104 },
  { date: 'Mar 5', calls: 13920, errors: 72 },
  { date: 'Mar 6', calls: 10840, errors: 48 },
  { date: 'Mar 7', calls: 14320, errors: 96 },
  { date: 'Mar 8', calls: 9840, errors: 44 },
  { date: 'Mar 9', calls: 7640, errors: 31 },
  { date: 'Mar 10', calls: 6240, errors: 19 },
  { date: 'Mar 11', calls: 15840, errors: 112 },
  { date: 'Mar 12', calls: 16920, errors: 88 },
  { date: 'Mar 13', calls: 13240, errors: 62 },
  { date: 'Mar 14', calls: 18640, errors: 134 },
  { date: 'Mar 15', calls: 12840, errors: 58 },
  { date: 'Mar 16', calls: 9240, errors: 41 },
  { date: 'Mar 17', calls: 8140, errors: 36 },
  { date: 'Mar 18', calls: 17240, errors: 98 },
  { date: 'Mar 19', calls: 19840, errors: 142 },
  { date: 'Mar 20', calls: 16240, errors: 78 },
  { date: 'Mar 21', calls: 21240, errors: 167 },
  { date: 'Mar 22', calls: 14840, errors: 71 },
  { date: 'Mar 23', calls: 11240, errors: 49 },
  { date: 'Mar 24', calls: 9840, errors: 38 },
  { date: 'Mar 25', calls: 22840, errors: 189 },
  { date: 'Mar 26', calls: 8920, errors: 44 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-[140px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#0d1e3a] dark:shadow-black/40">
      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-xs capitalize text-slate-500 dark:text-slate-400">{entry.name}</span>
          </div>
          <span className="tabular-nums text-xs font-semibold text-slate-900 dark:text-white">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function UsageChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-300 dark:border-white/6 dark:bg-[#080f20]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Daily API Usage</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">Last 30 days across all APIs</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-500 dark:text-slate-500">Calls</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-xs text-slate-500 dark:text-slate-500">Errors</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={dailyUsageData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(100,116,139,0.12)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(100,116,139,0.15)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="calls"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#callsGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1e3a5f', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="errors"
            stroke="#ef4444"
            strokeWidth={1.5}
            fill="url(#errorsGradient)"
            dot={false}
            activeDot={{ r: 3, fill: '#ef4444', stroke: '#3f1515', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
