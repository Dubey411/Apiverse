'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Backend integration point: replace with /api/usage/errors?groupBy=endpoint
const errorData = [
  { endpoint: '/verify', errors: 189, color: '#ef4444' },
  { endpoint: '/lookup', errors: 134, color: '#f97316' },
  { endpoint: '/status', errors: 96, color: '#eab308' },
  { endpoint: '/validate', errors: 72, color: '#a78bfa' },
  { endpoint: '/fetch', errors: 44, color: '#60a5fa' },
  { endpoint: '/search', errors: 28, color: '#34d399' },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="dark:bg-[#0d1e3a] bg-white dark:border dark:border-white/10 border border-slate-200 rounded-xl p-3 shadow-xl dark:shadow-black/40 shadow-slate-200/60">
      <p className="text-xs font-semibold dark:text-slate-400 text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-bold dark:text-white text-slate-900 tabular-nums">{payload[0].value} errors</p>
    </div>
  );
}

export default function ErrorDistributionChart() {
  return (
    <div className="p-5 dark:bg-[#080f20] bg-white dark:border dark:border-white/6 border border-slate-200 rounded-2xl h-full transition-colors duration-300">
      <div className="mb-6">
        <h2 className="text-base font-semibold dark:text-white text-slate-900">Errors by Endpoint</h2>
        <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">This billing period</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={errorData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="endpoint"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.06)' }} />
          <Bar dataKey="errors" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {errorData.map((entry, index) => (
              <Cell key={`cell-error-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Total */}
      <div className="mt-4 pt-4 dark:border-t dark:border-white/5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs dark:text-slate-500 text-slate-500">Total errors (MTD)</span>
        <span className="text-sm font-bold text-rose-500 tabular-nums">1,679</span>
      </div>
    </div>
  );
}