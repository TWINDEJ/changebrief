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
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const { notifyEmail, slackWebhookUrl, weeklyDigest } = body;

  await updateUserSettings(user.id as string, {
    notifyEmail: notifyEmail !== undefined ? Boolean(notifyEmail) : undefined,
    slackWebhookUrl: slackWebhookUrl !== undefined ? (slackWebhookUrl || null) : undefined,
    weeklyDigest: weeklyDigest !== undefined ? Boolean(weeklyDigest) : undefined,
  });

  return NextResponse.json({ ok: true });
}
