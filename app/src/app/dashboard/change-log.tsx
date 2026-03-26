'use client';

interface ChangeEntry {
  id: number;
  url: string;
  name: string;
  change_percent: number;
  summary: string | null;
  importance: number | null;
  changed_elements: string | null;
  checked_at: string;
}

export function ChangeLog({ history }: { history: ChangeEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
        <p className="text-slate-500">Inga ändringar ännu. Ändringar visas här när sidor uppdateras.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => {
        const imp = entry.importance ?? 0;
        const color = imp >= 7 ? 'text-red-400 bg-red-500/20' : imp >= 4 ? 'text-orange-400 bg-orange-500/20' : 'text-green-400 bg-green-500/20';

        return (
          <div key={entry.id} className="rounded-lg border border-slate-800 bg-slate-900/30 px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-white">{entry.name}</span>
              {entry.importance && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                  {entry.importance}/10
                </span>
              )}
              <span className="text-xs text-slate-500">
                {new Date(entry.checked_at).toLocaleString('sv-SE')}
              </span>
            </div>
            {entry.summary ? (
              <p className="text-sm text-slate-300">{entry.summary}</p>
            ) : (
              <p className="text-sm text-slate-500">Ingen signifikant ändring ({entry.change_percent.toFixed(2)}% pixel diff)</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
