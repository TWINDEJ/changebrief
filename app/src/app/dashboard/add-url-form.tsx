'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddUrlForm({ canAdd }: { canAdd: boolean }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !name) return;
    setLoading(true);

    const res = await fetch('/api/urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name }),
    });

    if (res.ok) {
      setUrl('');
      setName('');
      router.refresh();
    }
    setLoading(false);
  }

  if (!canAdd) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center">
        <p className="text-sm text-slate-400">Du har nått gränsen för din plan.</p>
        <a href="https://buy.polar.sh/polar_cl_JDnQNmWBFMsJp56ntC0GPsweHhIizDVhwWGIk4CAFVF" className="mt-2 inline-block text-sm font-medium text-blue-400 hover:text-blue-300">
          Uppgradera till Pro
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="url"
        placeholder="https://example.com/pricing"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="text"
        placeholder="Namn (t.ex. Stripe Pricing)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-64 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? '...' : 'Lägg till'}
      </button>
    </form>
  );
}
