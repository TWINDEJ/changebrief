'use client';

import { useState } from 'react';
import { useLocale } from '../locale-provider';

interface SettingsProps {
  initialNotifyEmail: boolean;
  initialSlackWebhookUrl: string;
  initialDigestFrequency: string;
  initialNotifyActionRequired?: boolean;
  initialNotifyReviewRecommended?: boolean;
  initialNotifyInfoOnly?: boolean;
  initialWebhookUrl?: string;
  initialSlaActionHours?: number;
  initialSlaReviewHours?: number;
  initialTeamsWebhookUrl?: string;
  initialDiscordWebhookUrl?: string;
  initialPagerdutyRoutingKey?: string;
  plan: string;
}

export function SettingsForm({ initialNotifyEmail, initialSlackWebhookUrl, initialDigestFrequency, initialNotifyActionRequired = true, initialNotifyReviewRecommended = true, initialNotifyInfoOnly = false, initialWebhookUrl = '', initialSlaActionHours = 48, initialSlaReviewHours = 168, initialTeamsWebhookUrl = '', initialDiscordWebhookUrl = '', initialPagerdutyRoutingKey = '', plan }: SettingsProps) {
  const { t, locale } = useLocale();
  const [notifyEmail, setNotifyEmail] = useState(initialNotifyEmail);
  const [digestFrequency, setDigestFrequency] = useState(initialDigestFrequency || 'weekly');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(initialSlackWebhookUrl);
  const [notifyActionRequired, setNotifyActionRequired] = useState(initialNotifyActionRequired);
  const [notifyReviewRecommended, setNotifyReviewRecommended] = useState(initialNotifyReviewRecommended);
  const [notifyInfoOnly, setNotifyInfoOnly] = useState(initialNotifyInfoOnly);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [slaActionHours, setSlaActionHours] = useState(initialSlaActionHours);
  const [slaReviewHours, setSlaReviewHours] = useState(initialSlaReviewHours);
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState(initialTeamsWebhookUrl);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(initialDiscordWebhookUrl);
  const [pagerdutyRoutingKey, setPagerdutyRoutingKey] = useState(initialPagerdutyRoutingKey);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Derive weeklyDigest from frequency for backwards compatibility
  const weeklyDigest = digestFrequency === 'weekly' || digestFrequency === 'daily';

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifyEmail, slackWebhookUrl, weeklyDigest, digestFrequency, notifyActionRequired, notifyReviewRecommended, notifyInfoOnly, webhookUrl, slaActionHours, slaReviewHours, teamsWebhookUrl, discordWebhookUrl, pagerdutyRoutingKey }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Email notifications */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">{t('settings.email')}</p>
          <p className="text-xs text-slate-500">{t('settings.email.desc')}</p>
        </div>
        <button
          onClick={() => setNotifyEmail(!notifyEmail)}
          className={`relative h-6 w-11 cursor-pointer rounded-full transition ${notifyEmail ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${notifyEmail ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Digest frequency */}
      <div>
        <p className="text-sm font-medium text-slate-900 mb-1">{t('settings.digest')}</p>
        {plan === 'free' ? (
          <>
            <p className="text-xs text-slate-500 mb-2">{t('settings.digest.desc')}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{t('settings.digest.weekly')}</span>
              <button
                onClick={() => setDigestFrequency(digestFrequency === 'weekly' ? 'off' : 'weekly')}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition ${digestFrequency === 'weekly' ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${digestFrequency === 'weekly' ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">{t('settings.digest.pro')}</p>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2">{t('settings.digest.desc')}</p>
            <div className="flex gap-3">
              {(['weekly', 'daily', 'off'] as const).map((freq) => (
                <label key={freq} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="digestFrequency"
                    value={freq}
                    checked={digestFrequency === freq}
                    onChange={() => setDigestFrequency(freq)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    {freq === 'weekly' ? t('settings.digest.weekly') : freq === 'daily' ? t('settings.digest.daily') : t('settings.digest.off')}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Compliance notification levels */}
      <div>
        <p className="text-sm font-medium text-slate-900 mb-2">{t('settings.notify.heading')}</p>
        <div className="space-y-2">
          {[
            { label: t('settings.notify.action'), value: notifyActionRequired, set: setNotifyActionRequired, color: 'text-red-700' },
            { label: t('settings.notify.review'), value: notifyReviewRecommended, set: setNotifyReviewRecommended, color: 'text-amber-700' },
            { label: t('settings.notify.info'), value: notifyInfoOnly, set: setNotifyInfoOnly, color: 'text-slate-500' },
          ].map(({ label, value, set, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className={`text-xs font-medium ${color}`}>{label}</span>
              <button
                onClick={() => set(!value)}
                className={`relative h-5 w-9 cursor-pointer rounded-full transition ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition ${value ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Slack */}
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-1">{t('settings.slack')}</label>
        <p className="text-xs text-slate-500 mb-2">
          {t('settings.slack.desc')}{' '}
          <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">api.slack.com/messaging/webhooks</a>
        </p>
        <input
          type="url"
          placeholder="https://hooks.slack.com/services/T00.../B00.../xxxx"
          value={slackWebhookUrl}
          onChange={(e) => setSlackWebhookUrl(e.target.value)}
          className="w-full rounded-xl glass px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Pro+ integrations: Teams, Discord, PagerDuty, GRC Webhook */}
      {(plan === 'pro' || plan === 'team') && (
        <>
          {/* Microsoft Teams */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Microsoft Teams</label>
            <p className="text-xs text-slate-500 mb-2">
              {locale === 'sv' ? 'Incoming Webhook URL från Teams-kanalen.' : 'Incoming Webhook URL from your Teams channel.'}
            </p>
            <input
              type="url"
              placeholder="https://outlook.office.com/webhook/..."
              value={teamsWebhookUrl}
              onChange={(e) => setTeamsWebhookUrl(e.target.value)}
              className="w-full rounded-xl glass px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Discord */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Discord</label>
            <p className="text-xs text-slate-500 mb-2">
              {locale === 'sv' ? 'Webhook URL från Discord-kanalinställningar.' : 'Webhook URL from Discord channel settings.'}
            </p>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              className="w-full rounded-xl glass px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* PagerDuty */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">PagerDuty</label>
            <p className="text-xs text-slate-500 mb-2">
              {locale === 'sv'
                ? 'Events API v2 Routing Key. Triggar incidenter vid importance >= 6.'
                : 'Events API v2 Routing Key. Triggers incidents for importance >= 6.'}
            </p>
            <input
              type="text"
              placeholder="R0..."
              value={pagerdutyRoutingKey}
              onChange={(e) => setPagerdutyRoutingKey(e.target.value)}
              className="w-full rounded-xl glass px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </>
      )}

      {/* GRC Webhook */}
      {(plan === 'pro' || plan === 'team') && (
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            GRC Webhook
          </label>
          <p className="text-xs text-slate-500 mb-2">
            {locale === 'sv'
              ? 'Skickar strukturerad JSON vid varje regulatorisk ändring. Koppla till ServiceNow, OneTrust, Archer m.fl.'
              : 'Sends structured JSON on every regulatory change. Connect to ServiceNow, OneTrust, Archer, etc.'}
          </p>
          <input
            type="url"
            placeholder="https://your-grc-system.com/api/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full rounded-xl glass px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {webhookUrl && (
            <p className="mt-1 text-xs text-slate-500">
              {locale === 'sv' ? 'Payload: ' : 'Payload: '}
              <code className="text-xs">{'{ event, url, source, jurisdiction, action, importance, summary, timestamp }'}</code>
            </p>
          )}
        </div>
      )}

      {/* SLA Deadlines */}
      {(plan === 'pro' || plan === 'team') && (
        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">
            {locale === 'sv' ? 'SLA — Granskningstider' : 'SLA — Review deadlines'}
          </p>
          <p className="text-xs text-slate-500 mb-3">
            {locale === 'sv'
              ? 'Maximalt antal timmar innan en ändring måste granskas. Överskridna ändringar markeras i dashboarden.'
              : 'Maximum hours before a change must be reviewed. Overdue changes are flagged in the dashboard.'}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-700">
                {locale === 'sv' ? 'Åtgärd krävs' : 'Action required'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={slaActionHours}
                  onChange={(e) => setSlaActionHours(Number(e.target.value))}
                  className="w-16 rounded-lg glass px-2 py-1 text-sm text-slate-900 text-center focus:outline-none"
                />
                <span className="text-xs text-slate-500">{locale === 'sv' ? 'timmar' : 'hours'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700">
                {locale === 'sv' ? 'Granskning rekommenderas' : 'Review recommended'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={slaReviewHours}
                  onChange={(e) => setSlaReviewHours(Number(e.target.value))}
                  className="w-16 rounded-lg glass px-2 py-1 text-sm text-slate-900 text-center focus:outline-none"
                />
                <span className="text-xs text-slate-500">{locale === 'sv' ? 'timmar' : 'hours'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 cursor-pointer shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 text-sm font-medium text-white transition disabled:opacity-50"
      >
        {saving ? t('settings.saving') : saved ? t('settings.saved') : t('settings.save')}
      </button>
    </div>
  );
}
