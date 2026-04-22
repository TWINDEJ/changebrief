'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IntentPicker, type WatchIntent } from './intent-picker';
import { useLocale } from '../locale-provider';

interface EditableUrl {
  id: number;
  name: string;
  url: string;
  threshold: number;
  selector: string | null;
  mobile: number;
  webhook_url?: string | null;
  category?: string | null;
  min_importance?: number | null;
  ignore_selectors?: string | null;
  check_interval_minutes?: number | null;
  watch_intent?: string | null;
  keyword_filters?: string | null;
  custom_prompt_hint?: string | null;
  wait_for_selector?: string | null;
  wait_ms?: number | null;
  scroll_to_bottom?: number | null;
}

interface HistoryEntry {
  id: number;
  changed_at: string;
  changed_by: string | null;
  diff: string;
}

// Håll synkat med shared/vision.ts REGULATORY_CATEGORIES.
const REGULATORY_CATEGORIES = [
  'Finance & Banking',
  'Transport & Infrastructure',
  'Health & Pharma',
  'Data & Privacy',
  'Environment & Energy',
  'Labor & Workplace',
  'Laws & Government',
  'Regulatory',
];

interface Props {
  url: EditableUrl;
  onClose: () => void;
  onSaved: (message: string, kind: 'success' | 'error') => void;
}

export function EditUrlModal({ url, onClose, onSaved }: Props) {
  const { t } = useLocale();
  const router = useRouter();

  const [name, setName] = useState(url.name);
  const [threshold, setThreshold] = useState(Number(url.threshold) || 0.3);
  const [minImportance, setMinImportance] = useState(Number(url.min_importance) || 5);
  const [mobile, setMobile] = useState(url.mobile === 1);
  const [selector, setSelector] = useState(url.selector ?? '');
  const [webhookUrl, setWebhookUrl] = useState(url.webhook_url ?? '');
  const [category, setCategory] = useState(url.category ?? '');
  const [ignoreSelectorsText, setIgnoreSelectorsText] = useState(() => {
    try {
      const parsed = url.ignore_selectors ? (JSON.parse(url.ignore_selectors) as string[]) : [];
      return parsed.join('\n');
    } catch {
      return '';
    }
  });
  const [checkIntervalMinutes, setCheckIntervalMinutes] = useState(Number(url.check_interval_minutes) || 360);
  const [watchIntent, setWatchIntent] = useState<WatchIntent>(() => {
    const v = url.watch_intent;
    return v === 'keywords' || v === 'custom' ? v : 'page';
  });
  const [keywordsText, setKeywordsText] = useState(() => {
    try {
      const parsed = url.keyword_filters ? (JSON.parse(url.keyword_filters) as string[]) : [];
      return parsed.join('\n');
    } catch {
      return '';
    }
  });
  const [customPromptHint, setCustomPromptHint] = useState(url.custom_prompt_hint ?? '');
  const [waitForSelector, setWaitForSelector] = useState(url.wait_for_selector ?? '');
  const [waitMs, setWaitMs] = useState<number>(Number(url.wait_ms) || 0);
  const [scrollToBottom, setScrollToBottom] = useState(url.scroll_to_bottom === 1);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    fetch(`/api/urls/history?id=${url.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setHistory(data as HistoryEntry[]))
      .catch(() => setHistory([]));
  }, [url.id]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    const ignoreList = ignoreSelectorsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const keywordsList = keywordsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const res = await fetch('/api/urls', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: url.id,
        name,
        threshold,
        minImportance,
        mobile: mobile ? 1 : 0,
        selector: selector || null,
        webhookUrl: webhookUrl || null,
        category: category || null,
        ignoreSelectors: ignoreList.length > 0 ? JSON.stringify(ignoreList) : null,
        checkIntervalMinutes,
        watchIntent,
        keywordFilters: watchIntent === 'keywords' && keywordsList.length > 0
          ? JSON.stringify(keywordsList) : null,
        customPromptHint: customPromptHint.trim()
          ? customPromptHint.trim().slice(0, 500) : null,
        waitForSelector: waitForSelector.trim() || null,
        waitMs: waitMs > 0 ? Math.min(waitMs, 15000) : null,
        scrollToBottom,
      }),
    });
    setLoading(false);

    if (res.ok) {
      const data = (await res.json()) as { changed: boolean };
      onSaved(data.changed ? t('edit.success') : t('edit.nochanges'), 'success');
      router.refresh();
      onClose();
    } else {
      onSaved('Failed to save', 'error');
    }
  }, [url.id, name, threshold, minImportance, mobile, selector, webhookUrl, category, ignoreSelectorsText, checkIntervalMinutes, watchIntent, keywordsText, customPromptHint, waitForSelector, waitMs, scrollToBottom, onSaved, onClose, router, t]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">{t('edit.title')}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="truncate text-xs text-slate-500">{url.url}</p>

          <IntentPicker
            intent={watchIntent}
            onIntentChange={setWatchIntent}
            keywordsText={keywordsText}
            onKeywordsChange={setKeywordsText}
            customPromptHint={customPromptHint}
            onCustomPromptChange={setCustomPromptHint}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t('edit.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-600">{t('form.threshold')}</label>
                <span className="font-mono text-xs text-slate-500">{threshold.toFixed(1)}%</span>
              </div>
              <input type="range" min="0.1" max="5" step="0.1" value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-blue-600" />
              <p className="mt-1 text-xs text-slate-500">{t('form.threshold.help')}</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-600">{t('form.min_importance')}</label>
                <span className="font-mono text-xs text-slate-500">{minImportance}/10</span>
              </div>
              <input type="range" min="1" max="10" step="1" value={minImportance}
                onChange={(e) => setMinImportance(parseInt(e.target.value, 10))}
                className="mt-2 w-full cursor-pointer accent-blue-600" />
              <p className="mt-1 text-xs text-slate-500">{t('form.min_importance.help')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.viewport')}</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMobile(false)}
                  className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition ${!mobile ? 'bg-blue-600 text-white' : 'glass text-slate-700 hover:bg-slate-100'}`}>
                  {t('form.viewport.desktop')}
                </button>
                <button type="button" onClick={() => setMobile(true)}
                  className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition ${mobile ? 'bg-blue-600 text-white' : 'glass text-slate-700 hover:bg-slate-100'}`}>
                  {t('form.viewport.mobile')}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.category')}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full cursor-pointer rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none">
                <option value="">{t('form.category.none')}</option>
                {REGULATORY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.interval')}</label>
            <select value={checkIntervalMinutes} onChange={(e) => setCheckIntervalMinutes(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none">
              <option value={360}>{t('form.interval.6h')}</option>
              <option value={720}>{t('form.interval.12h')}</option>
              <option value={1440}>{t('form.interval.24h')}</option>
              <option value={10080}>{t('form.interval.weekly')}</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">{t('form.interval.help')}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.selector')}</label>
            <input type="text" placeholder="e.g. #pricing-table" value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.ignore')}</label>
            <textarea
              placeholder={t('form.ignore.placeholder')}
              value={ignoreSelectorsText}
              onChange={(e) => setIgnoreSelectorsText(e.target.value)}
              rows={3}
              className="w-full rounded-lg glass px-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">{t('form.ignore.help')}</p>
          </div>

          <details className="rounded-xl bg-slate-50 p-4">
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">
              {t('form.spa.title')}
            </summary>
            <p className="mt-2 text-xs text-slate-500">{t('form.spa.help')}</p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.spa.waitFor')}</label>
                <input type="text" placeholder={t('form.spa.waitFor.placeholder')}
                  value={waitForSelector} onChange={(e) => setWaitForSelector(e.target.value)}
                  className="w-full rounded-lg glass px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.spa.waitMs')}</label>
                <input type="number" min={0} max={15000} step={500}
                  placeholder={t('form.spa.waitMs.placeholder')}
                  value={waitMs || ''} onChange={(e) => setWaitMs(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none" />
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={scrollToBottom}
                onChange={(e) => setScrollToBottom(e.target.checked)}
                className="cursor-pointer accent-blue-600" />
              {t('form.spa.scroll')}
            </label>
          </details>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t('form.webhook')}</label>
            <input type="url" placeholder="https://…" value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none" />
          </div>

          {history && history.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-700">{t('edit.history')}</h3>
              <ul className="space-y-2">
                {history.map((h) => {
                  let summary = '';
                  try {
                    const parsed = JSON.parse(h.diff) as Record<string, { from: unknown; to: unknown }>;
                    summary = Object.keys(parsed).join(', ');
                  } catch {
                    summary = '(unreadable)';
                  }
                  return (
                    <li key={h.id} className="flex items-start justify-between gap-3 text-xs text-slate-600">
                      <span className="truncate">{summary}</span>
                      <span className="shrink-0 text-slate-400">{new Date(h.changed_at + 'Z').toLocaleString()}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {history && history.length === 0 && (
            <p className="text-xs text-slate-400">{t('edit.history.empty')}</p>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
          <button onClick={onClose}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            {t('edit.cancel')}
          </button>
          <button onClick={handleSave} disabled={loading}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
            style={{ background: 'var(--app-accent)' }}>
            {loading ? '…' : t('edit.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
