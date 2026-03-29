import { authenticateApiKey } from '@/lib/api-auth';
import { getWatchedUrls } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`v1:${ip}`, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  const user = await authenticateApiKey(req);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or missing API key. Use: Authorization: Bearer cb_...' }, { status: 401 });
  }

  const urls = await getWatchedUrls(user.id as string);

  return NextResponse.json({
    data: (urls as any[]).map(u => ({
      id: u.id,
      url: u.url,
      name: u.name,
      category: u.category,
      active: u.active === 1,
      muted: u.muted === 1,
      threshold: u.threshold,
      last_checked_at: u.last_checked_at,
      last_error: u.last_error,
      last_summary: u.last_summary,
      last_importance: u.last_importance,
    })),
    count: urls.length,
  });
}
