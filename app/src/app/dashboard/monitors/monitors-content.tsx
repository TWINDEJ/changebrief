'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useLocale } from '../../locale-provider';
import { AddUrlForm } from '../add-url-form';
import { MonitoredGrid } from '../monitored-grid';
import { PopularWatchlists } from '../popular-watchlists';
import { SectionErrorBoundary } from '../error-boundary';
import { Onboarding } from '../onboarding';
import ComplianceOnboarding from '../compliance-onboarding';
import { Toast, useToast } from '../toast';

interface MonitorsContentProps {
  urls: any[];
  urlLimit: number;
  isNewUser: boolean;
  isComplianceRef: boolean;
  plan: string;
  locale: string;
}

// Komponent för drop-zonen ovanpå MonitoredGrid
function MonitorDropZone({ children, isOver }: { children: React.ReactNode; isOver: boolean }) {
  const { isOver: droppableIsOver, setNodeRef } = useDroppable({ id: 'monitor-drop-zone' });
  const active = isOver || droppableIsOver;

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-2xl transition-all duration-200 ${
        active ? 'ring-2 ring-indigo-400/50 ring-dashed' : ''
      }`}
      style={active ? { background: 'rgba(129, 140, 248, 0.05)' } : {}}
    >
      {active && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="rounded-xl px-6 py-3 text-sm font-medium shadow-lg backdrop-blur-sm"
            style={{
              background: 'rgba(129, 140, 248, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(129, 140, 248, 0.3)',
            }}
          >
            {/* Svensk eller engelsk text beroende på context */}
            Släpp här för att lägga till
          </div>
        </div>
      )}
      <div className={active ? 'opacity-40 transition-opacity duration-200' : ''}>
        {children}
      </div>
    </div>
  );
}


export function MonitorsContent({ urls, urlLimit, isNewUser, isComplianceRef, plan, locale: initialLocale }: MonitorsContentProps) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { toast, show, clear } = useToast();
  const [activeDrag, setActiveDrag] = useState<{ url: string; name: string; category: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [highlightUrl, setHighlightUrl] = useState<string | null>(null);
  // Optimistiskt tillagda kort — visas direkt innan servern svarar
  const [optimisticUrls, setOptimisticUrls] = useState<any[]>([]);

  // Rensa optimistiska kort som servern nu har med i sin data
  useEffect(() => {
    if (optimisticUrls.length === 0) return;
    setOptimisticUrls(prev => prev.filter(o => !urls.some((u: any) => u.url === o.url)));
  }, [urls]);

  // Kräv att användaren drar minst 8px innan drag startar (förhindrar accidentell drag vid klick)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data) {
      setActiveDrag({ url: data.url, name: data.name, category: data.category });
    }
  }, []);

  const handleDragOver = useCallback((event: any) => {
    setIsDragOver(!!event.over);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setIsDragOver(false);
    const { over, active } = event;
    const data = active.data.current;

    if (!over || !data) {
      setActiveDrag(null);
      return;
    }

    // Dropped on monitor zone — add the URL
    setActiveDrag(null);
    const name = locale === 'sv' ? data.name_sv : data.name;

    // Optimistisk uppdatering — kortet syns direkt
    const tempUrl = {
      id: Date.now(),
      url: data.url,
      name,
      active: 1,
      threshold: 0.3,
      selector: null,
      mobile: 0,
      muted: null,
      last_checked_at: null,
      last_error: null,
      consecutive_errors: null,
      cookies: null,
      headers: null,
      last_summary: null,
      last_importance: null,
      last_change_at: null,
    };
    setOptimisticUrls(prev => [tempUrl, ...prev]);
    setHighlightUrl(data.url);
    setTimeout(() => setHighlightUrl(null), 4000);

    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url, name, category: data.category }),
      });

      if (res.ok) {
        show(`${t('watchlists.added')} "${name}"`, 'success');
        triggerImmediateCheck();
        router.refresh();
      } else {
        // Ta bort optimistiskt kort vid fel
        setOptimisticUrls(prev => prev.filter(u => u.url !== data.url));
        setHighlightUrl(null);
        const err = await res.json();
        show(err.error || 'Failed to add', 'error');
      }
    } catch {
      setOptimisticUrls(prev => prev.filter(u => u.url !== data.url));
      setHighlightUrl(null);
      show('Network error', 'error');
    }
  }, [locale, router, show, t]);

  // Trigga GitHub Actions workflow för omedelbar check
  async function triggerImmediateCheck() {
    try {
      await fetch('/api/check-now', { method: 'POST' });
    } catch {
      // Tyst fail — checken körs ändå inom 6h
    }
  }

  // Slå ihop serverns URLs med optimistiskt tillagda (undvik dubbletter)
  const mergedUrls = [
    ...optimisticUrls.filter(o => !urls.some((u: any) => u.url === o.url)),
    ...urls,
  ];
  const canAdd = mergedUrls.length < urlLimit;
  const sv = locale === 'sv';

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Onboarding */}
        {isNewUser && isComplianceRef ? (
          <section><ComplianceOnboarding canAdd={canAdd} /></section>
        ) : isNewUser ? (
          <section><Onboarding /></section>
        ) : null}

        {/* Monitored Pages — drop zone */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--app-text)' }}>{t('monitor.title')}</h2>
              {!isNewUser && (
                <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{mergedUrls.length} / {urlLimit} {t('dashboard.monitored.count')}</span>
              )}
            </div>
          </div>

          <div className="rounded-xl glass-card p-4 mb-4">
            <AddUrlForm canAdd={canAdd} plan={plan} />
          </div>

          <MonitorDropZone isOver={isDragOver}>
            <SectionErrorBoundary fallbackTitle={sv ? 'Kunde inte ladda bevakade sidor' : 'Could not load monitored pages'}>
              <MonitoredGrid urls={mergedUrls} highlightUrl={highlightUrl} />
            </SectionErrorBoundary>
          </MonitorDropZone>
        </section>

        {/* Discover section */}
        <section>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--app-text)' }}>{t('discover.title')}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--app-text-secondary)' }}>{t('discover.desc')}</p>
          <PopularWatchlists
            existingUrls={mergedUrls.map((u: any) => u.url)}
            canAdd={canAdd}
          />
        </section>
      </div>

      {/* Drag overlay — visar ett ghost-kort under drag */}
      <DragOverlay dropAnimation={{
        duration: 150,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
      }}>
        {activeDrag ? (
          <div
            className="rounded-xl p-4 shadow-2xl"
            style={{
              background: 'var(--app-bg-card)',
              border: '2px solid #818cf8',
              opacity: 0.9,
              transform: 'scale(1.05)',
              width: '280px',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>
              {activeDrag.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              {activeDrag.url}
            </p>
          </div>
        ) : null}
      </DragOverlay>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clear} />}
    </DndContext>
  );
}
