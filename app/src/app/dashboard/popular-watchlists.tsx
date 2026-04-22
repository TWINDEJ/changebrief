'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDraggable } from '@dnd-kit/core';
import { Toast, useToast } from './toast';
import { useLocale } from '../locale-provider';
import suggestionsData from '@/data/suggestions.json';

interface Suggestion {
  url: string; name: string; name_sv: string;
  category: string; description: string; description_sv: string;
  jurisdiction?: string;
}

// Fokusera på nordiska + EU regulatoriska sidor (kärnmålgruppen)
const REGULATORY_CATEGORIES = new Set([
  'Finance & Banking', 'Transport & Infrastructure', 'Health & Pharma',
  'Data & Privacy', 'Environment & Energy', 'Labor & Workplace',
  'Laws & Government', 'Legal', 'Training & Certifications',
]);
const NORDIC_JURISDICTIONS = new Set(['SE', 'DK', 'NO', 'FI', 'EU']);

const suggestions = (suggestionsData as Suggestion[]).filter(s =>
  NORDIC_JURISDICTIONS.has(s.jurisdiction ?? '') && REGULATORY_CATEGORIES.has(s.category)
);
const categories = [
  'Training & Certifications', 'Finance & Banking', 'Transport & Infrastructure',
  'Health & Pharma', 'Data & Privacy', 'Environment & Energy',
  'Labor & Workplace', 'Laws & Government', 'Legal',
];

const categoryColors: Record<string, string> = {
  'Training & Certifications': 'text-indigo-600 bg-indigo-50',
  'Finance & Banking': 'text-emerald-600 bg-emerald-50',
  'Transport & Infrastructure': 'text-yellow-600 bg-yellow-50',
  'Health & Pharma': 'text-red-600 bg-red-50',
  'Data & Privacy': 'text-purple-600 bg-purple-50',
  'Environment & Energy': 'text-green-600 bg-green-50',
  'Labor & Workplace': 'text-orange-600 bg-orange-50',
  'Laws & Government': 'text-blue-600 bg-blue-50',
  Legal: 'text-amber-600 bg-amber-50',
  Pricing: 'text-teal-600 bg-teal-50',
  Newsrooms: 'text-pink-600 bg-pink-50',
  Standards: 'text-cyan-600 bg-cyan-50',
  Status: 'text-slate-600 bg-slate-100',
};

// Vågskålar = reglering, mynt = finans, hjärta = hälsa, sköld = data, blad = miljö, bygge = arbete, riksdag = lagar
const categoryIcons: Record<string, React.ReactNode> = {
  'Training & Certifications': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>,
  'Finance & Banking': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'Transport & Infrastructure': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8m-8 4h8m-4-8v16m-6 0h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  'Health & Pharma': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  'Data & Privacy': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  'Environment & Energy': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  'Labor & Workplace': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  'Laws & Government': <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  Legal: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Pricing: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Newsrooms: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
  Standards: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Status: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

// Draggable wrapper för suggestion-kort
function DraggableSuggestionCard({ suggestion, children }: { suggestion: Suggestion; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `suggestion-${suggestion.url}`,
    data: suggestion,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`touch-none ${isDragging ? 'opacity-30 scale-95' : ''}`}
      style={{ transition: isDragging ? 'none' : 'opacity 0.2s, transform 0.2s' }}
    >
      {children}
    </div>
  );
}

const jurisdictions = ['SE', 'DK', 'NO', 'FI', 'EU'] as const;
const jurisdictionLabels: Record<string, string> = {
  SE: 'SE', DK: 'DK', NO: 'NO', FI: 'FI', EU: 'EU',
};

export function PopularWatchlists({ existingUrls, canAdd }: { existingUrls: string[]; canAdd: boolean }) {
  const { locale, t } = useLocale();
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeJurisdiction, setActiveJurisdiction] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { toast, show, clear } = useToast();

  const handleAdd = useCallback(async (s: Suggestion) => {
    if (!canAdd) { show(t('watchlists.upgradeError'), 'error'); return; }
    setAdding(s.url);
    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: s.url, name: locale === 'sv' ? s.name_sv : s.name, category: s.category }),
      });
      if (res.ok) {
        setJustAdded(s.url);
        setTimeout(() => { setAdded(prev => new Set(prev).add(s.url)); setJustAdded(null); }, 600);
        show(`${t('watchlists.added')} "${locale === 'sv' ? s.name_sv : s.name}"`, 'success');
        router.refresh();
      } else { const data = await res.json(); show(data.error || 'Failed', 'error'); }
    } catch { show('Network error', 'error'); }
    setAdding(null);
  }, [canAdd, locale, router, show, t]);

  const [bulkAdding, setBulkAdding] = useState(false);

  const handleBulkAdd = useCallback(async () => {
    const currentFiltered = suggestions.filter(s => {
      if (activeJurisdiction && s.jurisdiction !== activeJurisdiction) return false;
      if (activeCategory && s.category !== activeCategory) return false;
      return true;
    });
    const toAdd = currentFiltered.filter(s => !existingUrls.includes(s.url) && !added.has(s.url));
    if (toAdd.length === 0) { show(locale === 'sv' ? 'Alla redan tillagda' : 'All already added', 'success'); return; }
    if (!canAdd) { show(t('watchlists.upgradeError'), 'error'); return; }

    setBulkAdding(true);
    let addedCount = 0;
    for (const s of toAdd) {
      try {
        const res = await fetch('/api/urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: s.url, name: locale === 'sv' ? s.name_sv : s.name, category: s.category }),
        });
        if (res.ok) {
          setAdded(prev => new Set(prev).add(s.url));
          addedCount++;
        } else { break; }
      } catch { break; }
    }
    show(`${locale === 'sv' ? 'Lade till' : 'Added'} ${addedCount} ${locale === 'sv' ? 'sidor' : 'pages'}`, 'success');
    router.refresh();
    setBulkAdding(false);
  }, [activeJurisdiction, activeCategory, existingUrls, added, canAdd, locale, router, show, t]);

  const filtered = suggestions.filter(s => {
    if (activeJurisdiction && s.jurisdiction !== activeJurisdiction) return false;
    if (activeCategory && s.category !== activeCategory) return false;
    return true;
  });
  const newInFilter = filtered.filter(s => !existingUrls.includes(s.url) && !added.has(s.url)).length;
  const visible = expanded ? filtered : filtered.slice(0, 12);
  const hasMore = filtered.length > 12;

  return (
    <>
      <div className="space-y-4">
        {/* Jurisdiction filter (primary) */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-medium text-slate-400 mr-1">{locale === 'sv' ? 'Land:' : 'Country:'}</span>
          <button onClick={() => setActiveJurisdiction(null)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${!activeJurisdiction ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}>
            {locale === 'sv' ? 'Alla' : 'All'}
          </button>
          {jurisdictions.map(j => {
            const count = suggestions.filter(s => s.jurisdiction === j).length;
            if (count === 0) return null;
            return (
              <button key={j} onClick={() => setActiveJurisdiction(activeJurisdiction === j ? null : j)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${activeJurisdiction === j ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}>
                {jurisdictionLabels[j]} <span className="text-slate-400 ml-0.5">{count}</span>
              </button>
            );
          })}
        </div>
        {/* Category filter (secondary) */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveCategory(null)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${!activeCategory ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {t('watchlists.all')}
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${activeCategory === cat ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Bulk add button */}
        {(activeJurisdiction || activeCategory) && newInFilter > 0 && (
          <button
            onClick={handleBulkAdd}
            disabled={bulkAdding || !canAdd}
            className="flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-white shadow-sm hover:shadow transition disabled:opacity-50" style={{ background: 'var(--app-accent)' }}
          >
            {bulkAdding ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {locale === 'sv' ? 'Lägger till...' : 'Adding...'}
              </>
            ) : (
              <>
                {locale === 'sv'
                  ? `+ Lägg till alla ${newInFilter} ${activeJurisdiction || ''} ${activeCategory || ''} sidor`
                  : `+ Add all ${newInFilter} ${activeJurisdiction || ''} ${activeCategory || ''} pages`}
              </>
            )}
          </button>
        )}

        <div className="grid gap-3 sm:grid-cols-2 content-start min-h-[480px]">
          {visible.map((s) => {
            const isExisting = existingUrls.includes(s.url) || added.has(s.url);
            const isAdding = adding === s.url;
            const colors = categoryColors[s.category] || 'text-slate-600 bg-slate-100';
            const displayName = locale === 'sv' ? s.name_sv : s.name;
            const displayDesc = locale === 'sv' ? s.description_sv : s.description;

            const isJustAdded = justAdded === s.url;

            return (
              <DraggableSuggestionCard key={s.url} suggestion={s}>
                <div className={`flex items-start justify-between gap-3 rounded-xl glass-card p-4 transition-all duration-500 cursor-grab active:cursor-grabbing ${isJustAdded ? 'scale-95 opacity-50 ring-2 ring-emerald-500/40' : ''} ${isExisting ? 'opacity-60' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${colors}`}>{categoryIcons[s.category]}</span>
                      <span className="text-sm font-medium text-slate-900 truncate">{displayName}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{displayDesc}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleAdd(s); }} disabled={isExisting || isAdding}
                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${isExisting ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} disabled:cursor-default`}>
                    {isExisting ? t('watchlists.added') : isAdding ? '...' : '+ Add'}
                  </button>
                </div>
              </DraggableSuggestionCard>
            );
          })}
        </div>

        {hasMore && (
          <button onClick={() => setExpanded(!expanded)}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors duration-200">
            {expanded ? t('watchlists.showLess') : `${t('watchlists.showAll')} ${filtered.length} ${t('watchlists.suggestions')}`}
            <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clear} />}
    </>
  );
}
