import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/cached-data';
import { type Locale } from '@/lib/i18n';
import { SettingsForm } from '../settings-form';
import { CheckoutToast } from '../checkout-toast';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const user = await getUser();
  if (!user) redirect('/login');

  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || 'en';

  const checkoutSuccess = params.checkout === 'success';

  return (
    <div className="space-y-6">
      <CheckoutToast show={checkoutSuccess} />

      <h2 className="text-lg font-semibold" style={{ color: 'var(--app-text)' }}>
        {locale === 'sv' ? 'Inställningar' : 'Settings'}
      </h2>

      <div className="rounded-xl p-5 sm:p-6" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}>
        <SettingsForm
          initialNotifyEmail={user.notify_email !== 0}
          initialSlackWebhookUrl={(user.slack_webhook_url as string) || ''}
          initialDigestFrequency={(user.digest_frequency as string) || 'weekly'}
          initialNotifyActionRequired={(user as any).notify_action_required !== 0}
          initialNotifyReviewRecommended={(user as any).notify_review_recommended !== 0}
          initialNotifyInfoOnly={(user as any).notify_info_only === 1}
          initialWebhookUrl={(user as any).webhook_url || ''}
          initialSlaActionHours={(user as any).sla_action_hours ?? 48}
          initialSlaReviewHours={(user as any).sla_review_hours ?? 168}
          initialTeamsWebhookUrl={(user as any).teams_webhook_url || ''}
          initialDiscordWebhookUrl={(user as any).discord_webhook_url || ''}
          initialPagerdutyRoutingKey={(user as any).pagerduty_routing_key || ''}
          plan={user.plan as string}
        />
      </div>
    </div>
  );
}
