'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';

const labels = {
  placeholder: { en: 'you@company.com', sv: 'du@företag.se' },
  submit: { en: 'Continue with email', sv: 'Fortsätt med mejl' },
  sending: { en: 'Sending...', sv: 'Skickar...' },
  sent: { en: 'Check your inbox! We sent a sign-in link to', sv: 'Kolla din inkorg! Vi skickade en inloggningslänk till' },
  error: { en: 'Could not send email. Try again.', sv: 'Kunde inte skicka mejl. Försök igen.' },
};

export default function EmailForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-sm text-emerald-700">
          {labels.sent[locale]} <strong>{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={labels.placeholder[locale]}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-60 transition-colors"
        style={{ background: 'var(--app-accent)', color: 'var(--app-accent-on)' }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {status === 'sending' ? labels.sending[locale] : labels.submit[locale]}
      </button>
      {status === 'error' && (
        <p className="text-center text-xs text-red-500">{labels.error[locale]}</p>
      )}
    </form>
  );
}
