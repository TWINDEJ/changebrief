'use client';

import { useRouter } from 'next/navigation';

interface WatchedUrl {
  id: number;
  url: string;
  name: string;
  active: number;
  threshold: number;
  selector: string | null;
  mobile: number;
}

export function UrlList({ urls }: { urls: WatchedUrl[] }) {
  const router = useRouter();

  if (urls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
        <p className="text-slate-500">Inga bevakade sidor ännu. Lägg till din första URL ovan.</p>
      </div>
    );
  }

  async function handleRemove(id: number) {
    await fetch(`/api/urls?id=${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {urls.map((u) => (
        <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 px-5 py-3">
          <div className="flex items-center gap-4">
            <div className={`h-2.5 w-2.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-slate-600'}`} />
            <div>
              <p className="text-sm font-medium text-white">{u.name}</p>
              <p className="text-xs text-slate-500">{u.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {u.selector && <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{u.selector}</span>}
            {u.mobile === 1 && <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">mobil</span>}
            <span className="text-xs text-slate-500">{u.threshold}%</span>
            <button
              onClick={() => handleRemove(u.id)}
              className="text-slate-600 transition hover:text-red-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
