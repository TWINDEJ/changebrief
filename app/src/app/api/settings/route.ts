import { auth } from '@/lib/auth';
import { getUserByEmail, updateUserSettings } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    notifyEmail: user.notify_email === 1,
    slackWebhookUrl: user.slack_webhook_url || '',
    weeklyDigest: user.weekly_digest !== 0,
    digestFrequency: (user.digest_frequency as string) || 'weekly',
    webhookUrl: (user as any).webhook_url || '',
    slaActionHours: (user as any).sla_action_hours ?? 48,
    slaReviewHours: (user as any).sla_review_hours ?? 168,
    teamsWebhookUrl: (user as any).teams_webhook_url || '',
    discordWebhookUrl: (user as any).discord_webhook_url || '',
    pagerdutyRoutingKey: (user as any).pagerduty_routing_key || '',
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const { notifyEmail, slackWebhookUrl, weeklyDigest, digestFrequency, notifyActionRequired, notifyReviewRecommended, notifyInfoOnly, webhookUrl, slaActionHours, slaReviewHours, teamsWebhookUrl, discordWebhookUrl, pagerdutyRoutingKey } = body;

  await updateUserSettings(user.id as string, {
    notifyEmail: notifyEmail !== undefined ? Boolean(notifyEmail) : undefined,
    slackWebhookUrl: slackWebhookUrl !== undefined ? (slackWebhookUrl || null) : undefined,
    weeklyDigest: weeklyDigest !== undefined ? Boolean(weeklyDigest) : undefined,
    digestFrequency: digestFrequency !== undefined ? String(digestFrequency) : undefined,
    notifyActionRequired: notifyActionRequired !== undefined ? Boolean(notifyActionRequired) : undefined,
    notifyReviewRecommended: notifyReviewRecommended !== undefined ? Boolean(notifyReviewRecommended) : undefined,
    notifyInfoOnly: notifyInfoOnly !== undefined ? Boolean(notifyInfoOnly) : undefined,
    webhookUrl: webhookUrl !== undefined ? (webhookUrl || null) : undefined,
    slaActionHours: slaActionHours !== undefined ? Number(slaActionHours) : undefined,
    slaReviewHours: slaReviewHours !== undefined ? Number(slaReviewHours) : undefined,
    teamsWebhookUrl: teamsWebhookUrl !== undefined ? (teamsWebhookUrl || null) : undefined,
    discordWebhookUrl: discordWebhookUrl !== undefined ? (discordWebhookUrl || null) : undefined,
    pagerdutyRoutingKey: pagerdutyRoutingKey !== undefined ? (pagerdutyRoutingKey || null) : undefined,
  });

  return NextResponse.json({ ok: true });
}
