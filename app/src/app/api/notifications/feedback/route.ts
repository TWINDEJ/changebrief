import { auth } from '@/lib/auth';
import { getUserByEmail, recordNotificationFeedback, getNoiseSuggestion } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`feedback:${ip}`, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const { changeHistoryId, verdict, reason } = body as {
    changeHistoryId?: number;
    verdict?: 'relevant' | 'noise';
    reason?: string;
  };

  if (typeof changeHistoryId !== 'number' || (verdict !== 'relevant' && verdict !== 'noise')) {
    return NextResponse.json({ error: 'changeHistoryId (number) and verdict (relevant|noise) required' }, { status: 400 });
  }

  const result = await recordNotificationFeedback(user.id as string, changeHistoryId, verdict, reason);
  if (!result.recorded) {
    return NextResponse.json({ error: 'Change not found' }, { status: 404 });
  }

  // Efter "noise": kolla om vi ska föreslå tuning. Alltid null för "relevant".
  const suggestion = verdict === 'noise'
    ? await getNoiseSuggestion(user.id as string, changeHistoryId)
    : null;

  return NextResponse.json({ ok: true, suggestion });
}
