import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function QuotaAlertBanner() {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-500/8 dark:border dark:border-amber-500/20 border border-amber-200 rounded-xl">
      <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold dark:text-amber-300 text-amber-700">Quota Warning — Aadhaar Verification API</p>
        <p className="text-xs dark:text-amber-400/70 text-amber-600/80 mt-0.5">
          You&apos;ve used 78% of your monthly quota (7,800 / 10,000 calls). At current rate, you&apos;ll hit the limit in ~4 days.
          <a href="#" className="underline ml-1 dark:hover:text-amber-300 hover:text-amber-700 transition-colors">Upgrade plan →</a>
        </p>
      </div>
      <button className="dark:text-amber-500/60 text-amber-400 dark:hover:text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}