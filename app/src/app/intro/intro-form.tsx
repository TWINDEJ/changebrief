'use client';

import { useState, useCallback } from 'react';
import { useLocale } from '../locale-provider';

export function IntroForm() {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [urls, setUrls] = useState('');
  const [times, setTimes] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, urls, times, message, website }),
      });
      if (res.ok) {
        setSent(true);
      } else if (res.status === 429) {
        setError(t('intro.error.rate'));
      } else {
        setError(t('intro.error.generic'));
      }
    } catch {
      setError(t('intro.error.generic'));
    }
    setLoading(false);
  }, [name, email, company, urls, times, message, website, t]);

  const cardStyle = {
    background: 'var(--app-bg-card)',
    border: '1px solid var(--app-border)',
  };

  if (sent) {
    return (
      <div className="rounded-2xl p-8 text-center shadow-sm" style={cardStyle}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--app-text)' }}>{t('intro.success.title')}</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--app-text-secondary)' }}>{t('intro.success.body')}</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--app-bg-card)',
    border: '1px solid var(--app-border)',
    color: 'var(--app-text)',
  };
  const inputCls = "w-full rounded-lg px-3 py-2 text-sm placeholder:opacity-60 focus:outline-none focus:ring-2";
  const labelCls = "mb-1 block text-xs font-medium";
  const labelStyle = { color: 'var(--app-text-secondary)' };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-6 shadow-sm" style={cardStyle}>
      {/* Honeypot — dolt för människor, synligt för bots. */}
      <div className="hidden" aria-hidden="true">
        <label>Website (leave blank)</label>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>{t('intro.form.name')} *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t('intro.form.email')} *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>{t('intro.form.company')}</label>
        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} style={inputStyle} />
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>{t('intro.form.urls')}</label>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={t('intro.form.urls.placeholder')}
          rows={3}
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>{t('intro.form.times')}</label>
        <input
          type="text"
          value={times}
          onChange={(e) => setTimes(e.target.value)}
          placeholder={t('intro.form.times.placeholder')}
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>{t('intro.form.message')}</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} style={inputStyle} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !name.trim() || !email.trim()}
        className="w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: 'var(--app-accent)', color: 'var(--app-accent-on)' }}
      >
        {loading ? t('intro.form.sending') : t('intro.form.submit')}
      </button>
    </form>
  );
}
