'use client';
import React, { useState } from 'react';
import { Copy, Eye, EyeOff, RotateCcw, Plus, Check, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

// Backend integration point: replace with GET /api/keys
const apiKeys = [
  {
    id: 'key-prod-001',
    label: 'Production',
    key: 'ask_live_rk9x2mPqLwHvBnTdZfYcKjAeUoSiGh3N',
    created: 'Jan 12, 2026',
    lastUsed: '2 minutes ago',
    callsToday: 8920,
    status: 'active',
    apis: ['Aadhaar Verify', 'GST Lookup', 'UPI Status'],
  },
  {
    id: 'key-staging-002',
    label: 'Staging',
    key: 'ask_test_mX7kPnQrVwLbHcFyDaEuZoSjGi4N8tR2',
    created: 'Feb 3, 2026',
    lastUsed: '1 hour ago',
    callsToday: 342,
    status: 'active',
    apis: ['Aadhaar Verify', 'SMS Gateway'],
  },
  {
    id: 'key-dev-003',
    label: 'Development',
    key: 'ask_test_qW2mKpXnRvLcHdFbEuZoYjGa5M9tS3N7',
    created: 'Mar 8, 2026',
    lastUsed: '3 days ago',
    callsToday: 0,
    status: 'inactive',
    apis: ['Pincode API'],
  },
];

const numberFormatter = new Intl.NumberFormat('en-US');

function maskKey(key: string) {
  return key.slice(0, 14) + '••••••••••••••••••••' + key.slice(-4);
}

export default function APIKeyManager() {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKey = async (id: string, key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(id);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  const rotateKey = (label: string) => {
    // Backend integration point: POST /api/keys/:id/rotate
    toast.warning(`Rotating ${label} key... This will invalidate the current key.`, {
      action: { label: 'Confirm', onClick: () => toast.success(`${label} key rotated successfully`) },
    });
  };

  return (
    <div className="p-5 dark:bg-[#080f20] bg-white dark:border dark:border-white/6 border border-slate-200 rounded-2xl transition-colors duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold dark:text-white text-slate-900">API Keys</h2>
          <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">Manage your authentication keys</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all active:scale-95">
          <Plus size={12} />
          New Key
        </button>
      </div>

      <div className="space-y-3">
        {apiKeys.map((keyItem) => (
          <div
            key={keyItem.id}
            className={`p-4 rounded-xl border transition-all ${
              keyItem.status === 'active' ?'dark:bg-white/2 bg-slate-50 dark:border-white/8 border-slate-200 dark:hover:border-white/14 hover:border-slate-300' :'dark:bg-white/1 bg-slate-50/50 dark:border-white/5 border-slate-100 opacity-60'
            }`}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold dark:text-white text-slate-900">{keyItem.label}</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  keyItem.status === 'active' ?'bg-emerald-500/10 text-emerald-500' :'dark:bg-slate-500/10 bg-slate-100 dark:text-slate-500 text-slate-400'
                }`}>
                  {keyItem.status === 'active'
                    ? <ShieldCheck size={9} />
                    : <ShieldAlert size={9} />
                  }
                  {keyItem.status}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs dark:text-slate-500 text-slate-500">
                <span className="tabular-nums font-semibold dark:text-slate-400 text-slate-600">{numberFormatter.format(keyItem.callsToday)}</span>
                <span>calls today</span>
              </div>
            </div>

            {/* Key display */}
            <div className="flex items-center gap-2 dark:bg-[#050d1a] bg-slate-100 dark:border dark:border-white/6 border border-slate-200 rounded-lg px-3 py-2 mb-3">
              <code className="flex-1 text-xs font-mono dark:text-slate-400 text-slate-600 truncate">
                {visibleKeys[keyItem.id] ? keyItem.key : maskKey(keyItem.key)}
              </code>
              <button
                onClick={() => toggleVisibility(keyItem.id)}
                className="dark:text-slate-600 text-slate-400 dark:hover:text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                {visibleKeys[keyItem.id] ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={() => copyKey(keyItem.id, keyItem.key)}
                className="dark:text-slate-600 text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0"
                aria-label="Copy API key"
              >
                {copiedKey === keyItem.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] dark:text-slate-600 text-slate-400">
                <span>Created {keyItem.created}</span>
                <span>·</span>
                <span>Used {keyItem.lastUsed}</span>
              </div>
              <button
                onClick={() => rotateKey(keyItem.label)}
                className="flex items-center gap-1 text-[11px] dark:text-slate-600 text-slate-400 hover:text-amber-500 transition-colors"
                title="Rotate this key — current key will be invalidated"
              >
                <RotateCcw size={11} />
                Rotate
              </button>
            </div>

            {/* Linked APIs */}
            <div className="flex flex-wrap gap-1 mt-2.5">
              {keyItem.apis.map((apiName) => (
                <span
                  key={`${keyItem.id}-api-${apiName}`}
                  className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-500/8 text-blue-500 border border-blue-500/15 rounded"
                >
                  {apiName}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
