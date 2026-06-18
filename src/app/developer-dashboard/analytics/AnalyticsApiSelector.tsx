'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface AnalyticsApiSelectorOption {
  id: string;
  name: string;
  latestStatus: string;
}

export default function AnalyticsApiSelector({
  apis,
  selectedApiId,
}: {
  apis: AnalyticsApiSelectorOption[];
  selectedApiId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('api', value);
    } else {
      params.delete('api');
    }

    const queryString = params.toString();
    router.push(`/developer-dashboard/analytics${queryString ? `?${queryString}` : ''}`);
  }

  return (
    <label className="block min-w-[260px] space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
        Select API
      </span>
      <select
        suppressHydrationWarning
        value={selectedApiId}
        onChange={(event) => handleChange(event.target.value)}
        className="themed-select w-full rounded-full border border-stone-300/70 bg-white/75 px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition hover:border-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-white/20"
      >
        <option value="">All APIs overview</option>
        {apis.map((api) => (
          <option key={api.id} value={api.id}>
            {api.name} - {api.latestStatus}
          </option>
        ))}
      </select>
    </label>
  );
}
