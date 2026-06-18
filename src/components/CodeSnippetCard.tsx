'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeSnippetCardProps {
  label: string;
  code: string;
}

export default function CodeSnippetCard({ label, code }: CodeSnippetCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-stone-300/70 bg-[#111822] p-5 text-stone-100 dark:border-white/8">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-[10px] font-semibold text-stone-400">{label}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-200 transition hover:border-white/20 hover:bg-white/10"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre className="mt-3 overflow-x-auto text-sm leading-7 text-stone-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
