import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getChangeHistory, getComplianceHistory, getComplianceTrend, getComplianceOverview, getComplianceActionSummary } from '@/lib/db';
import { getUser, getUserUrls } from '@/lib/cached-data';
import { t, type Locale } from '@/lib/i18n';
import { ActivityFeed } from '../activity-feed';
import { ComplianceFeed } from '../compliance-feed';
import { ComplianceTrend } from '../compliance-trend';
import { ComplianceOverview } from '../compliance-overview';
import { ComplianceTabs } from '../compliance-tabs';
import { SectionErrorBoundary } from '../error-boundary';
import { FaviconBadge } from '../favicon-badge';

export default async function ActivityPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || 'en';

  const [urls, history, complianceHistory, trendData, complianceOverview, complianceSummary] = await Promise.all([
    getUserUrls(user.id as string),
    getChangeHistory(user.id as string, 50) as Promise<any[]>,
    getComplianceHistory(user.id as string) as Promise<any[]>,
    getComplianceTrend(user.id as string) as Promise<any[]>,
    getComplianceOverview(user.id as string) as Promise<any[]>,
    getComplianceActionSummary(user.id as string),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <FaviconBadge count={complianceSummary.actionRequired + complianceSummary.reviewRecommended} />

      {/* Compliance action-kort dolda — ej validerad klassificering */}

      {urls.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--app-text)' }}>{t('feed.title', locale)}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--app-text-secondary)' }}>{t('feed.desc', locale)}</p>
          <SectionErrorBoundary fallbackTitle={locale === 'sv' ? 'Kunde inte ladda aktivitetsflödet' : 'Could not load activity feed'}>
            <ActivityFeed history={history} plan={user.plan as string} />
          </SectionErrorBoundary>
        </section>
      )}

      {(complianceHistory.length > 0 || complianceOverview.length > 0) && (
        <section>
          <SectionErrorBoundary fallbackTitle={locale === 'sv' ? 'Kunde inte ladda compliance' : 'Could not load compliance'}>
            <ComplianceTabs
              feedContent={<ComplianceFeed history={complianceHistory} plan={user.plan as string} slaActionHours={(user as any).sla_action_hours ?? 48} slaReviewHours={(user as any).sla_review_hours ?? 168} />}
              overviewContent={<ComplianceOverview data={complianceOverview} />}
              trendContent={trendData.length > 0 ? <ComplianceTrend data={trendData} /> : null}
              plan={user.plan as string}
            />
          </SectionErrorBoundary>
        </section>
      )}

      {urls.length === 0 && (
        <section className="text-center py-12">
          <p className="text-lg font-medium" style={{ color: 'var(--app-text-secondary)' }}>
            {locale === 'sv' ? 'Inga ändringar upptäckta ännu' : 'No changes detected yet'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--app-text-muted)' }}>
            {locale === 'sv' ? 'Lägg till sidor att bevaka under ① Bevakningar.' : 'Add pages to monitor under ① Monitors.'}
          </p>
        </section>
      )}
    </div>
  );
}
