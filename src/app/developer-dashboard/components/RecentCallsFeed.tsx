'use client';
import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, ChevronDown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Backend integration point: replace with GET /api/logs/recent?limit=20
const recentCalls = [
  {
    id: 'log-001',
    method: 'POST',
    endpoint: '/v3/aadhaar/verify',
    api: 'Aadhaar Verification',
    status: 200,
    latency: '38ms',
    time: '2 min ago',
    keyLabel: 'Production',
    size: '1.2 KB',
  },
  {
    id: 'log-002',
    method: 'GET',
    endpoint: '/v2/gst/lookup',
    api: 'GST Lookup',
    status: 200,
    latency: '52ms',
    time: '4 min ago',
    keyLabel: 'Production',
    size: '3.4 KB',
  },
  {
    id: 'log-003',
    method: 'POST',
    endpoint: '/v4/upi/status',
    api: 'UPI Status',
    status: 422,
    latency: '28ms',
    time: '7 min ago',
    keyLabel: 'Production',
    size: '0.8 KB',
  },
  {
    id: 'log-004',
    method: 'GET',
    endpoint: '/v1/pincode/400001',
    api: 'India Pincode',
    status: 200,
    latency: '18ms',
    time: '12 min ago',
    keyLabel: 'Staging',
    size: '2.1 KB',
  },
  {
    id: 'log-005',
    method: 'POST',
    endpoint: '/v3/aadhaar/verify',
    api: 'Aadhaar Verification',
    status: 429,
    latency: '12ms',
    time: '15 min ago',
    keyLabel: 'Production',
    size: '0.4 KB',
  },
  {
    id: 'log-006',
    method: 'POST',
    endpoint: '/v3/sms/send',
    api: 'SMS Gateway',
    status: 200,
    latency: '95ms',
    time: '18 min ago',
    keyLabel: 'Staging',
    size: '0.6 KB',
  },
  {
    id: 'log-007',
    method: 'GET',
    endpoint: '/v2/gst/lookup',
    api: 'GST Lookup',
    status: 200,
    latency: '48ms',
    time: '22 min ago',
    keyLabel: 'Production',
    size: '3.1 KB',
  },
  {
    id: 'log-008',
    method: 'POST',
    endpoint: '/v4/upi/status',
    api: 'UPI Status',
    status: 500,
    latency: '2100ms',
    time: '31 min ago',
    keyLabel: 'Production',
    size: '0.3 KB',
  },
  {
    id: 'log-009',
    method: 'GET',
    endpoint: '/v1/pincode/560001',
    api: 'India Pincode',
    status: 200,
    latency: '21ms',
    time: '38 min ago',
    keyLabel: 'Development',
    size: '2.0 KB',
  },
  {
    id: 'log-010',
    method: 'POST',
    endpoint: '/v3/aadhaar/verify',
    api: 'Aadhaar Verification',
    status: 200,
    latency: '41ms',
    time: '45 min ago',
    keyLabel: 'Production',
    size: '1.2 KB',
  },
];

function StatusBadge({ status }: { status: number }) {
  if (status >= 200 && status < 300) {
    return (
      <div className="flex items-center gap-1">
        <CheckCircle2 size={12} className="text-emerald-500" />
        <span className="text-xs font-mono font-semibold text-emerald-500">{status}</span>
      </div>
    );
  }
  if (status === 429) {
    return (
      <div className="flex items-center gap-1">
        <Clock size={12} className="text-amber-500" />
        <span className="text-xs font-mono font-semibold text-amber-500">{status}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <XCircle size={12} className="text-rose-500" />
      <span className="text-xs font-mono font-semibold text-rose-500">{status}</span>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'text-emerald-500 bg-emerald-500/10',
    POST: 'text-blue-500 bg-blue-500/10',
    PUT: 'text-amber-500 bg-amber-500/10',
    DELETE: 'text-rose-500 bg-rose-500/10',
    PATCH: 'text-violet-500 bg-violet-500/10',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${colors[method] || 'dark:text-slate-400 text-slate-500 dark:bg-white/5 bg-slate-100'}`}>
      {method}
    </span>
  );
}

export default function RecentCallsFeed() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Backend integration point: re-fetch /api/logs/recent
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Activity feed refreshed');
    }, 800);
  };

  return (
    <div className="p-5 dark:bg-[#080f20] bg-white dark:border dark:border-white/6 border border-slate-200 rounded-2xl transition-colors duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold dark:text-white text-slate-900">Recent API Calls</h2>
          <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">Last 20 requests across all keys</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg dark:text-slate-500 text-slate-400 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/5 hover:bg-slate-100 transition-all"
          aria-label="Refresh activity feed"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-[420px] overflow-y-auto scrollbar-hide">
        {recentCalls.map((log) => (
          <div key={log.id}>
            <button
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg dark:hover:bg-white/4 hover:bg-slate-50 transition-all text-left group"
            >
              <MethodBadge method={log.method} />

              <code className="flex-1 text-xs font-mono dark:text-slate-400 text-slate-600 truncate dark:group-hover:text-slate-300 group-hover:text-slate-900 transition-colors">
                {log.endpoint}
              </code>

              <StatusBadge status={log.status} />

              <span className="text-[11px] font-mono dark:text-slate-600 text-slate-400 tabular-nums w-14 text-right flex-shrink-0">
                {log.latency}
              </span>

              <span className="text-[11px] dark:text-slate-600 text-slate-400 w-16 text-right flex-shrink-0 hidden sm:block">
                {log.time}
              </span>

              <ChevronDown
                size={12}
                className={`dark:text-slate-600 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded === log.id ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expanded detail */}
            {expanded === log.id && (
              <div className="mx-3 mb-2 p-3 dark:bg-[#050d1a] bg-slate-50 dark:border dark:border-white/6 border border-slate-200 rounded-lg animate-fade-in">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-[10px] dark:text-slate-600 text-slate-400 uppercase tracking-wider mb-0.5">API</p>
                    <p className="text-xs dark:text-slate-300 text-slate-700 font-medium">{log.api}</p>
                  </div>
                  <div>
                    <p className="text-[10px] dark:text-slate-600 text-slate-400 uppercase tracking-wider mb-0.5">Key</p>
                    <p className="text-xs dark:text-slate-300 text-slate-700 font-medium">{log.keyLabel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] dark:text-slate-600 text-slate-400 uppercase tracking-wider mb-0.5">Response Size</p>
                    <p className="text-xs font-mono dark:text-slate-300 text-slate-700">{log.size}</p>
                  </div>
                  <div>
                    <p className="text-[10px] dark:text-slate-600 text-slate-400 uppercase tracking-wider mb-0.5">Latency</p>
                    <p className={`text-xs font-mono font-semibold ${parseFloat(log.latency) > 500 ? 'text-rose-500' : parseFloat(log.latency) > 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {log.latency}
                    </p>
                  </div>
                </div>
                {log.status >= 400 && (
                  <div className="mt-2 pt-2 dark:border-t dark:border-white/5 border-t border-slate-100">
                    <p className="text-[10px] dark:text-slate-600 text-slate-400 uppercase tracking-wider mb-1">Error</p>
                    <p className="text-xs font-mono text-rose-500">
                      {log.status === 429
                        ? 'Rate limit exceeded — quota exhausted for this key'
                        : log.status === 422
                        ? 'Unprocessable entity — invalid Aadhaar format in request body'
                        : 'Internal server error — upstream provider temporarily unavailable'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-600">Showing 10 of 284,921 calls this month</span>
        <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
          View full logs →
        </button>
      </div>
    </div>
  );
}