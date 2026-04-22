'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Toast, useToast } from './toast';
import { IntentPicker, type WatchIntent } from './intent-picker';
import { useLocale } from '../locale-provider';

interface CookieRow { name: string; value: string; domain: string }
interface HeaderRow { key: string; value: string }

// Compliance-kategorier som triggar utökad analys i shared/vision.ts.
// Håll synkat med REGULATORY_CATEGORIES där.
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

function CookieFields({ cookies, onChange }: { cookies: CookieRow[]; onChange: (c: CookieRow[]) => void }) {
  const { t } = useLocale();
  const add = () => onChange([...cookies, { name: '', value: '', domain: '' }]);
  const remove = (i: number) => onChange(cookies.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof CookieRow, val: string) => {
    const next = [...cookies];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-medium text-slate-600">{t('form.cookies')}</label>
          <p className="text-xs text-slate-600 mt-0.5">{t('form.cookies.help')}</p>
        </div>
        <button type="button" onClick={add} className="cursor-pointer text-xs text-blue-600 hover:text-blue-700">{t('form.cookies.add')}</button>
      </div>
      {cookies.map((c, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input placeholder="Name (e.g. session_id)" value={c.name} onChange={e => update(i, 'name', e.target.value)}
            className="flex-1 rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          <input placeholder="Value" value={c.value} onChange={e => update(i, 'value', e.target.value)}
            className="flex-1 rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          <input placeholder="Domain (e.g. example.com)" value={c.domain} onChange={e => update(i, 'domain', e.target.value)}
            className="w-44 rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          <button type="button" onClick={() => remove(i)} className="cursor-pointer text-slate-400 hover:text-red-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function HeaderFields({ headers, onChange }: { headers: HeaderRow[]; onChange: (h: HeaderRow[]) => void }) {
  const { t } = useLocale();
  const add = () => onChange([...headers, { key: '', value: '' }]);
  const remove = (i: number) => onChange(headers.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof HeaderRow, val: string) => {
    const next = [...headers];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-medium text-slate-600">{t('form.headers')}</label>
          <p className="text-xs text-slate-600 mt-0.5">{t('form.headers.help')}</p>
        </div>
        <button type="button" onClick={add} className="cursor-pointer text-xs text-blue-600 hover:text-blue-700">{t('form.headers.add')}</button>
      </div>
      {headers.map((h, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input placeholder="Header name (e.g. Authorization)" value={h.key} onChange={e => update(i, 'key', e.target.value)}
            className="w-56 rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          <input placeholder="Value (e.g. Bearer abc123)" value={h.value} onChange={e => update(i, 'value', e.target.value)}
            className="flex-1 rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          <button type="button" onClick={() => remove(i)} className="cursor-pointer text-slate-400 hover:text-red-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function AddUrlForm({ canAdd, plan = 'free' }: { canAdd: boolean; plan?: string }) {
  const { t } = useLocale();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selector, setSelector] = useState('');
  const [cookies, setCookies] = useState<CookieRow[]>([]);
  const [headers, setHeaders] = useState<HeaderRow[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [threshold, setThreshold] = useState(0.3);
  const [minImportance, setMinImportance] = useState(5);
  const [mobile, setMobile] = useState(false);
  const [category, setCategory] = useState('');
  const [ignoreSelectorsText, setIgnoreSelectorsText] = useState('');
  const [checkIntervalMinutes, setCheckIntervalMinutes] = useState(360);
  const [watchIntent, setWatchIntent] = useState<WatchIntent>('page');
  const [keywordsText, setKeywordsText] = useState('');
  const [customPromptHint, setCustomPromptHint] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast, show, clear } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name) return;
    setLoading(true);

    const validCookies = cookies.filter(c => c.name && c.value && c.domain);
    const validHeaders = headers.filter(h => h.key && h.value);
    const headersObj = validHeaders.length > 0
      ? Object.fromEntries(validHeaders.map(h => [h.key, h.value]))
      : undefined;
    const ignoreList = ignoreSelectorsText
      .split('\n').map((s) => s.trim()).filter(Boolean);
    const keywordsList = keywordsText
      .split('\n').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url, name,
          selector: selector || undefined,
          cookies: validCookies.length > 0 ? JSON.stringify(validCookies) : undefined,
          headers: headersObj ? JSON.stringify(headersObj) : undefined,
          webhookUrl: webhookUrl || undefined,
          threshold,
          minImportance,
          mobile: mobile ? 1 : 0,
          category: category || undefined,
          ignoreSelectors: ignoreList.length > 0 ? JSON.stringify(ignoreList) : undefined,
          checkIntervalMinutes,
          watchIntent,
          keywordFilters: watchIntent === 'keywords' && keywordsList.length > 0
            ? JSON.stringify(keywordsList) : undefined,
          customPromptHint: watchIntent === 'custom' && customPromptHint.trim()
            ? customPromptHint.trim().slice(0, 500) : undefined,
        }),
      });

      if (res.ok) {
        const data: { firstCheckQueued?: boolean } = await res.json().catch(() => ({}));
        show(t(data.firstCheckQueued ? 'form.success.queued' : 'form.success'), 'success');
        setUrl(''); setName(''); setSelector(''); setCookies([]); setHeaders([]); setWebhookUrl('');
        setThreshold(0.3); setMinImportance(5); setMobile(false); setCategory(''); setIgnoreSelectorsText('');
        setCheckIntervalMinutes(360);
        setWatchIntent('page'); setKeywordsText(''); setCustomPromptHint('');
        setShowAdvanced(false);
        router.refresh();
      } else {
        const data = await res.json();
        show(data.error || 'Failed to add URL', 'error');
      }
    } catch { show('Network error', 'error'); }
    setLoading(false);
  }, [url, name, selector, cookies, headers, webhookUrl, threshold, minImportance, mobile, category, ignoreSelectorsText, checkIntervalMinutes, watchIntent, keywordsText, customPromptHint, router, show, t]);

  if (!canAdd) {
    return (
      <div className="rounded-xl glass-card p-6 text-center">
        <p className="text-sm text-slate-600">{t('form.limit')}</p>
        <a href="https://buy.polar.sh/polar_cl_JDnQNmWBFMsJp56ntC0GPsweHhIizDVhwWGIk4CAFVF" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
          {t('form.upgrade')} &rarr;
        </a>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="url" placeholder={t('form.placeholder.url')} value={url} onChange={(e) => setUrl(e.target.value)} required
            className="flex-1 rounded-xl glass px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          <input type="text" placeholder={t('form.placeholder.name')} value={name} onChange={(e) => setName(e.target.value)} required
            className="sm:w-64 rounded-xl glass px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          <button type="submit" disabled={loading}
            className="rounded-xl px-6 py-2.5 cursor-pointer shadow-sm hover:shadow text-sm font-medium text-white transition disabled:opacity-50" style={{ background: 'var(--app-accent)' }}>
            {loading ? <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : t('form.add')}
          </button>
        </div>

        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors duration-200">
          <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          {showAdvanced ? t('form.advanced.hide') : t('form.advanced')}
        </button>

        {showAdvanced && (
          <div className="rounded-xl glass-card p-5 space-y-5">
            <IntentPicker
              intent={watchIntent}
              onIntentChange={setWatchIntent}
              keywordsText={keywordsText}
              onKeywordsChange={setKeywordsText}
              customPromptHint={customPromptHint}
              onCustomPromptChange={setCustomPromptHint}
            />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.selector')}</label>
              <input type="text" placeholder="e.g. #pricing-table or .main-content" value={selector} onChange={(e) => setSelector(e.target.value)}
                className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
              <p className="mt-1 text-xs text-slate-500">{t('form.selector.help')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-600">{t('form.threshold')}</label>
                  <span className="text-xs font-mono text-slate-500">{threshold.toFixed(1)}%</span>
                </div>
                <input type="range" min="0.1" max="5" step="0.1" value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-blue-600 cursor-pointer" />
                <p className="mt-1 text-xs text-slate-500">{t('form.threshold.help')}</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-600">{t('form.min_importance')}</label>
                  <span className="text-xs font-mono text-slate-500">{minImportance}/10</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={minImportance}
                  onChange={(e) => setMinImportance(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-blue-600 cursor-pointer" />
                <p className="mt-1 text-xs text-slate-500">{t('form.min_importance.help')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.viewport')}</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMobile(false)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${!mobile ? 'bg-blue-600 text-white' : 'glass text-slate-700 hover:bg-slate-100'}`}>
                    {t('form.viewport.desktop')}
                  </button>
                  <button type="button" onClick={() => setMobile(true)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${mobile ? 'bg-blue-600 text-white' : 'glass text-slate-700 hover:bg-slate-100'}`}>
                    {t('form.viewport.mobile')}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">{t('form.viewport.help')}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.category')}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none cursor-pointer">
                  <option value="">{t('form.category.none')}</option>
                  {REGULATORY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">{t('form.category.help')}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.interval')}</label>
              <select value={checkIntervalMinutes} onChange={(e) => setCheckIntervalMinutes(parseInt(e.target.value, 10))}
                className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 focus:outline-none cursor-pointer">
                <option value={360}>{t('form.interval.6h')}</option>
                <option value={720}>{t('form.interval.12h')}</option>
                <option value={1440}>{t('form.interval.24h')}</option>
                <option value={10080}>{t('form.interval.weekly')}</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">{t('form.interval.help')}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.ignore')}</label>
              <textarea
                placeholder={t('form.ignore.placeholder')}
                value={ignoreSelectorsText}
                onChange={(e) => setIgnoreSelectorsText(e.target.value)}
                rows={3}
                className="w-full rounded-lg glass px-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">{t('form.ignore.help')}</p>
            </div>

            <CookieFields cookies={cookies} onChange={setCookies} />
            <HeaderFields headers={headers} onChange={setHeaders} />
            {(plan === 'pro' || plan === 'team') ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.webhook')}</label>
                <input
                  type="url"
                  placeholder="https://your-app.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">{t('form.webhook.help')}</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.webhook')}</label>
                <p className="text-xs text-slate-500">{t('form.webhook.pro')}</p>
              </div>
            )}
          </div>
        )}
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clear} />}
    </>
  );
}
