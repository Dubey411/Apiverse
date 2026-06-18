import React from 'react';
import MetricsGrid from './MetricsGrid';
import UsageChart from './UsageChart';
import ErrorDistributionChart from './ErrorDistributionChart';
import APIKeyManager from './APIKeyManager';
import RecentCallsFeed from './RecentCallsFeed';
import QuotaAlertBanner from './QuotaAlertBanner';

export default function DashboardOverview() {
  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 p-6 xl:p-8 2xl:p-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace overview</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-500">
            April 18, 2026 · Shortlist + connect workflow · Sandbox-first by default
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500">All systems operational</span>
          </div>
        </div>
      </div>

      <QuotaAlertBanner />
      <MetricsGrid />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UsageChart />
        </div>
        <div>
          <ErrorDistributionChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <APIKeyManager />
        <RecentCallsFeed />
      </div>
    </div>
  );
}
