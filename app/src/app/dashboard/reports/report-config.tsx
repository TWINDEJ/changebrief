'use client';

import { useState, useMemo } from 'react';
import { useLocale } from '../../locale-provider';
import { ReportPreview } from './report-preview';

interface ReportConfigProps {
  email: string;
  initialDigestFrequency: string;
  plan: string;
}

function getNextReportDate(frequency: string, locale: string): string {
  if (frequency === 'off') return '';
  const now = new Date();
  if (frequency === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(8, 0, 0, 0);
  return nextMonday.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function ReportConfig({ email, initialDigestFrequency, plan }: ReportConfigProps) {
  const { t, locale } = useLocale();
  const [digestFrequency, setDigestFrequency] = useState(initialDigestFrequency);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const nextDate = useMemo(() => getNextReportDate(digestFrequency, locale), [digestFrequency, locale]);

  const frequencyLabel = useMemo(() => {
    if (digestFrequency === 'weekly') return t('reports.config.frequency.weekly');
    if (digestFrequency === 'daily') return t('reports.config.frequency.daily');
    return t('reports.config.frequency.off');
  }, [digestFrequency, t]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digestFrequency, weeklyDigest: digestFrequency !== 'off' }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const sv = locale === 'sv';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--app-text)' }}>
          {t('reports.title')}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--app-text-secondary)' }}>
          {t('reports.subtitle')}
        </p>
      </div>

      {/* Status banner */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--app-bg-card)',
          borderLeft: '4px solid #818cf8',
          boxShadow: 'var(--app-shadow)',
        }}
      >
        {digestFrequency === 'off' ? (
          <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>
            {t('reports.banner.disabled')}
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-lg font-medium" style={{ color: 'var(--app-text)' }}>
              {t('reports.banner.next')}: {nextDate}
            </p>
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
              → {email}
            </p>
            <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
              {t('reports.banner.format')}: HTML Email • {t('reports.banner.frequency')}: {frequencyLabel}
            </p>
          </div>
        )}
      </div>

      {/* Two-column: frequency + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Frequency picker + save */}
        <div className="lg:col-span-3 space-y-6">
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}
          >
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>
              {t('reports.config.frequency')}
            </label>
            <div className="flex gap-3">
              {(['weekly', 'daily', 'off'] as const).map((freq) => {
                const isActive = digestFrequency === freq;
                const isDisabled = freq === 'daily' && plan === 'free';
                return (
                  <button
                    key={freq}
                    onClick={() => !isDisabled && setDigestFrequency(freq)}
                    disabled={isDisabled}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                      isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{
                      background: isActive ? 'rgba(129,140,248,0.15)' : 'var(--app-bg-muted)',
                      color: isActive ? '#818cf8' : 'var(--app-text-muted)',
                    }}
                  >
                    {freq === 'weekly' ? t('reports.config.frequency.weekly')
                      : freq === 'daily' ? t('reports.config.frequency.daily')
                      : t('reports.config.frequency.off')}
                  </button>
                );
              })}
            </div>
            {plan === 'free' && (
              <p className="text-xs mt-2" style={{ color: 'var(--app-text-muted)' }}>
                {t('reports.pro.daily')}
              </p>
            )}
          </div>

          {/* Mottagare (bara visning, ingen "Kommer snart") */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}
          >
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>
              {t('reports.config.recipients')}
            </label>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: 'var(--app-bg-muted)', color: 'var(--app-text-secondary)' }}
            >
              {email}
            </span>
            <p className="text-xs mt-2" style={{ color: 'var(--app-text-muted)' }}>
              {sv ? 'Rapporten skickas till din inloggningsadress.' : 'Reports are sent to your login email.'}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 cursor-pointer shadow-sm hover:shadow text-sm font-medium text-white transition disabled:opacity-50" style={{ background: 'var(--app-accent)' }}
          >
            {saving ? t('reports.saving') : saved ? t('reports.saved') : t('reports.save')}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2">
          <ReportPreview
            sections={{ changeSummary: true, changeLog: true, compliance: true, monitorStatus: false, recommendations: false }}
            frequency={digestFrequency}
            email={email}
          />
        </div>
      </div>
    </div>
  );
}
