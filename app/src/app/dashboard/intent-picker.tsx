'use client';

import { useLocale } from '../locale-provider';

export type WatchIntent = 'page' | 'keywords' | 'custom';

interface Props {
  intent: WatchIntent;
  onIntentChange: (v: WatchIntent) => void;
  keywordsText: string;
  onKeywordsChange: (v: string) => void;
  customPromptHint: string;
  onCustomPromptChange: (v: string) => void;
}

export function IntentPicker({
  intent, onIntentChange,
  keywordsText, onKeywordsChange,
  customPromptHint, onCustomPromptChange,
}: Props) {
  const { t } = useLocale();

  const options: Array<{ value: WatchIntent; label: string; desc: string }> = [
    { value: 'page', label: t('form.intent.page'), desc: t('form.intent.page.desc') },
    { value: 'keywords', label: t('form.intent.keywords'), desc: t('form.intent.keywords.desc') },
    { value: 'custom', label: t('form.intent.custom'), desc: t('form.intent.custom.desc') },
  ];

  return (
    <div className="space-y-3">
      {/* Alltid synligt fritextfält — watch intent gäller för alla lägen. */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.watchIntent.label')}</label>
        <textarea
          placeholder={t('form.watchIntent.placeholder')}
          value={customPromptHint}
          onChange={(e) => onCustomPromptChange(e.target.value.slice(0, 500))}
          rows={3}
          maxLength={500}
          className="w-full rounded-lg glass px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <p className="text-xs text-slate-500">{t('form.watchIntent.help')}</p>
          <span className="shrink-0 text-[11px] text-slate-400">{customPromptHint.length}/500</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">{t('form.intent')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onIntentChange(opt.value)}
              className={`text-left rounded-lg px-3 py-2 text-xs transition cursor-pointer ${
                intent === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'glass text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className={`mt-0.5 text-[11px] leading-snug ${intent === opt.value ? 'text-blue-50' : 'text-slate-500'}`}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">{t('form.intent.help')}</p>
      </div>

      {intent === 'keywords' && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('form.keywords')}</label>
          <textarea
            placeholder={t('form.keywords.placeholder')}
            value={keywordsText}
            onChange={(e) => onKeywordsChange(e.target.value)}
            rows={3}
            className="w-full rounded-lg glass px-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
