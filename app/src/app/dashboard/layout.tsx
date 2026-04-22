import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession, getUser, getUserUrls, getUserStats } from '@/lib/cached-data';
import { t, type Locale } from '@/lib/i18n';
import { SignOutButton } from './sign-out-button';
import { LanguageSwitcher } from '../locale-provider';
import { ThemeToggle } from './theme-toggle';
import { AnimatedNumber } from './animated-number';
import { DashboardShell } from './dashboard-shell';
import { KeyboardShortcutsHelp } from './keyboard-shortcuts';
import { ShortcutHint } from './shortcut-hint';
import { TabNav } from './tab-nav';

function formatLastCheck(dateStr: string | null, locale: Locale): string {
  if (!dateStr) return t('stats.never', locale);
  const diff = Math.floor((Date.now() - new Date(dateStr + 'Z').getTime()) / 1000);
  if (diff < 60) return locale === 'sv' ? 'nyss' : 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}${locale === 'sv' ? ' min sedan' : 'm ago'}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${locale === 'sv' ? 'h sedan' : 'h ago'}`;
  return `${Math.floor(diff / 86400)}${locale === 'sv' ? 'd sedan' : 'd ago'}`;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.email) redirect('/login');

  const user = await getUser();
  if (!user) redirect('/login');

  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || 'en';

  const [stats, urls] = await Promise.all([
    getUserStats(user.id as string),
    getUserUrls(user.id as string),
  ]);

  const planLabel = t(`header.plan.${user.plan as 'free' | 'pro' | 'team'}` as any, locale);

  return (
    <div className="min-h-screen" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <DashboardShell header={
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ background: 'var(--app-accent)', borderColor: 'var(--app-accent-hover)' }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--app-accent-on)' }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
              </svg>
            </div>
            <h1 className="text-[22px] leading-none tracking-display hidden sm:flex items-baseline gap-[1px]">
              <span className="font-semibold" style={{ color: 'var(--app-text)' }}>change</span>
              <span className="font-display-italic" style={{ color: 'var(--app-text)' }}>brief</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <span
              className="rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em]"
              style={{
                background: 'var(--app-accent-subtle)',
                border: '1px solid var(--app-border)',
                color: 'var(--app-text-secondary)',
              }}
            >
              {planLabel}
            </span>
            {user.plan !== 'team' && (
              <a
                href={user.plan === 'pro'
                  ? 'https://buy.polar.sh/polar_cl_HmjMU2dLQz7qe5fAcTjK2SsssRYDPboqXQJXd4QgARz'
                  : 'https://buy.polar.sh/polar_cl_JDnQNmWBFMsJp56ntC0GPsweHhIizDVhwWGIk4CAFVF'}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium transition-all hover:opacity-90"
                style={{ background: 'var(--app-accent)', color: 'var(--app-accent-on)' }}
              >
                {t('header.upgrade', locale)}
              </a>
            )}
            <a
              href={`mailto:kristian@changebrief.io?subject=${encodeURIComponent(locale === 'sv' ? 'Feedback på changebrief' : 'Feedback on changebrief')}&body=${encodeURIComponent(locale === 'sv'
                ? '1. Vilka sidor/myndigheter bevakar du?\n\n2. Fick du någon ändring klassificerad? Stämde den?\n\n3. Vad saknar du?\n\n4. Skulle du betala för detta? Hur mycket?\n\n5. Vem mer borde testa detta?\n'
                : '1. Which pages/agencies are you monitoring?\n\n2. Did you get any change classified? Was it accurate?\n\n3. What is missing?\n\n4. Would you pay for this? How much?\n\n5. Who else should try this?\n')}`}
              className="group flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {locale === 'sv' ? 'Ge feedback' : 'Give feedback'}
            </a>
            <span className="text-sm text-slate-400 hidden md:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      }>

        {/* Stats bar */}
        {urls.length > 0 && (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl glass-card px-4 py-3">
                <p className="text-xs font-medium" style={{ color: 'var(--app-text-muted)' }}>{t('stats.pages', locale)}</p>
                <p className="mt-1 text-2xl font-bold"><AnimatedNumber value={urls.length} /></p>
              </div>
              <div className="rounded-xl glass-card px-4 py-3">
                <p className="text-xs font-medium" style={{ color: 'var(--app-text-muted)' }}>{t('stats.changes', locale)}</p>
                <p className="mt-1 text-2xl font-bold">
                  {stats.significantChanges7d > 0 ? (
                    <span className="text-orange-600">{stats.significantChanges7d}</span>
                  ) : (
                    <span className="text-emerald-600">0</span>
                  )}
                </p>
              </div>
              <div className="rounded-xl glass-card px-4 py-3">
                <p className="text-xs font-medium" style={{ color: 'var(--app-text-muted)' }}>{t('stats.checks', locale)}</p>
                <p className="mt-1 text-2xl font-bold"><AnimatedNumber value={stats.totalChecks7d} /></p>
              </div>
              <div className="rounded-xl glass-card px-4 py-3">
                <p className="text-xs font-medium" style={{ color: 'var(--app-text-muted)' }}>{t('stats.lastcheck', locale)}</p>
                <p className="mt-1 text-lg font-semibold">{formatLastCheck(stats.lastCheck, locale)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className="mx-auto max-w-5xl mt-6">
          <TabNav />
        </div>

        {/* Route content */}
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>

        <KeyboardShortcutsHelp />
        <ShortcutHint />
      </DashboardShell>
    </div>
  );
}
