'use client';

import { useState, useMemo } from 'react';
import { useLocale } from '../locale-provider';

interface ComplianceEntry {
  id: number;
  url: string;
  name: string;
  summary: string | null;
  importance: number | null;
  changed_elements: string | null;
  checked_at: string;
  jurisdiction: string | null;
  document_type: string | null;
  compliance_action: string | null;
}

type ActionFilter = 'all' | 'action_required' | 'review_recommended' | 'info_only';

const actionColors: Record<string, { badge: string; dot: string }> = {
  action_required: { badge: 'text-red-400 bg-red-500/15', dot: 'bg-red-500' },
  review_recommended: { badge: 'text-amber-400 bg-amber-500/15', dot: 'bg-amber-500' },
  info_only: { badge: 'text-slate-400 bg-slate-500/15', dot: 'bg-slate-500' },
};

const actionLabels: Record<string, { en: string; sv: string }> = {
  action_required: { en: 'Action required', sv: 'Åtgärd krävs' },
  review_recommended: { en: 'Review recommended', sv: 'Granskning rekommenderas' },
  info_only: { en: 'Info only', sv: 'Endast information' },
};

const docTypeLabels: Record<string, { en: string; sv: string }> = {
  regulation: { en: 'Regulation', sv: 'Föreskrift' },
  guidance: { en: 'Guidance', sv: 'Vägledning' },
  consultation: { en: 'Consultation', sv: 'Remiss' },
  decision: { en: 'Decision', sv: 'Beslut' },
  standard: { en: 'Standard', sv: 'Standard' },
  law: { en: 'Law', sv: 'Lag' },
};

function ActionBadge({ action, locale }: { action: string; locale: string }) {
  const colors = actionColors[action] || actionColors.info_only;
  const label = actionLabels[action]?.[locale as 'en' | 'sv'] || action;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}

export function ComplianceFeed({ history, plan = 'free' }: { history: ComplianceEntry[]; plan?: string }) {
  const { locale } = useLocale();
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const jurisdictions = useMemo(() => {
    const set = new Set<string>();
    for (const h of history) if (h.jurisdiction) set.add(h.jurisdiction);
    return Array.from(set).sort();
  }, [history]);

  const filtered = useMemo(() => {
    let items = history;
    if (actionFilter !== 'all') items = items.filter(e => e.compliance_action === actionFilter);
    if (jurisdictionFilter) items = items.filter(e => e.jurisdiction === jurisdictionFilter);
    return items;
  }, [history, actionFilter, jurisdictionFilter]);

  const actionCounts = useMemo(() => {
    const counts = { action_required: 0, review_recommended: 0, info_only: 0 };
    for (const h of history) {
      const a = h.compliance_action as keyof typeof counts;
      if (a && a in counts) counts[a]++;
    }
    return counts;
  }, [history]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'Z').toLocaleString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/5 p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
          <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-400">
          {locale === 'sv' ? 'Inga regulatoriska ändringar ännu' : 'No regulatory changes yet'}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {locale === 'sv'
            ? 'Lägg till myndigheter under Upptäck för att börja bevaka regulatoriska ändringar.'
            : 'Add government agencies from Discover to start monitoring regulatory changes.'}
        </p>
      </div>
    );
  }

  const filterBtnCls = (active: boolean) =>
    `cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${active ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`;

  return (
    <div className="space-y-3">
      {/* Stats strip */}
      <div className="flex gap-3">
        {actionCounts.action_required > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-red-400">{actionCounts.action_required}</span>
            <span className="text-xs text-red-400/70">{locale === 'sv' ? 'kräver åtgärd' : 'need action'}</span>
          </div>
        )}
        {actionCounts.review_recommended > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-400">{actionCounts.review_recommended}</span>
            <span className="text-xs text-amber-400/70">{locale === 'sv' ? 'att granska' : 'to review'}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setActionFilter('all')} className={filterBtnCls(actionFilter === 'all')}>
          {locale === 'sv' ? 'Alla' : 'All'} ({history.length})
        </button>
        <button onClick={() => setActionFilter('action_required')} className={filterBtnCls(actionFilter === 'action_required')}>
          {locale === 'sv' ? 'Åtgärd krävs' : 'Action required'} ({actionCounts.action_required})
        </button>
        <button onClick={() => setActionFilter('review_recommended')} className={filterBtnCls(actionFilter === 'review_recommended')}>
          {locale === 'sv' ? 'Granska' : 'Review'} ({actionCounts.review_recommended})
        </button>
        <button onClick={() => setActionFilter('info_only')} className={filterBtnCls(actionFilter === 'info_only')}>
          {locale === 'sv' ? 'Info' : 'Info'} ({actionCounts.info_only})
        </button>

        {jurisdictions.length > 1 && (
          <select
            value={jurisdictionFilter}
            onChange={(e) => setJurisdictionFilter(e.target.value)}
            className="cursor-pointer rounded-lg bg-white/5 border border-white/5 px-3 py-1.5 text-xs text-slate-400 focus:outline-none ml-auto"
          >
            <option value="">{locale === 'sv' ? 'Alla jurisdiktioner' : 'All jurisdictions'}</option>
            {jurisdictions.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        )}

        {(plan === 'pro' || plan === 'team') && (
          <a
            href={`/api/export/compliance${jurisdictionFilter ? `?jurisdiction=${jurisdictionFilter}` : ''}${actionFilter !== 'all' ? `${jurisdictionFilter ? '&' : '?'}complianceAction=${actionFilter}` : ''}`}
            className="cursor-pointer rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            {locale === 'sv' ? 'Exportera audit trail' : 'Export audit trail'}
          </a>
        )}
      </div>

      {/* Entries */}
      <div className="rounded-xl glass-card overflow-hidden divide-y divide-white/[0.03]">
        {filtered.map((entry) => {
          const isOpen = expanded.has(entry.id);
          let elements: string[] = [];
          if (entry.changed_elements) {
            try { elements = JSON.parse(entry.changed_elements); } catch { /* */ }
          }
          const docLabel = entry.document_type
            ? docTypeLabels[entry.document_type]?.[locale as 'en' | 'sv'] || entry.document_type
            : null;

          return (
            <div key={entry.id}>
              <button
                onClick={() => toggleExpand(entry.id)}
                className="w-full cursor-pointer px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition text-left"
              >
                <span className="text-xs text-slate-600 w-24 shrink-0">{formatDate(entry.checked_at)}</span>
                {entry.compliance_action && (
                  <ActionBadge action={entry.compliance_action} locale={locale} />
                )}
                {entry.jurisdiction && (
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shrink-0">
                    {entry.jurisdiction}
                  </span>
                )}
                <span className="text-sm font-medium text-slate-300 shrink-0 max-w-[160px] truncate">{entry.name}</span>
                <span className="text-sm text-slate-400 truncate flex-1 min-w-0">
                  {entry.summary || (locale === 'sv' ? 'Ingen sammanfattning' : 'No summary')}
                </span>
                <svg
                  className={`h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-3 pt-0 ml-28 space-y-2">
                  {entry.summary && (
                    <p className="text-sm text-slate-300 leading-relaxed">{entry.summary}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    {entry.importance != null && entry.importance > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 font-medium ${
                        entry.importance >= 7 ? 'text-red-400 bg-red-500/20'
                          : entry.importance >= 4 ? 'text-orange-400 bg-orange-500/20'
                          : 'text-green-400 bg-green-500/20'
                      }`}>
                        {entry.importance}/10
                      </span>
                    )}
                    {docLabel && (
                      <span className="rounded bg-white/5 px-2 py-0.5 text-slate-400">{docLabel}</span>
                    )}
                    <a
                      href={entry.url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400/70 hover:text-blue-300 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {entry.url}
                    </a>
                  </div>
                  {elements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {elements.map((el, i) => (
                        <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-400">{el}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-600">
            {locale === 'sv' ? 'Inga ändringar matchar filtret' : 'No changes match the filter'}
          </div>
        )}
      </div>
    </div>
  );
}
