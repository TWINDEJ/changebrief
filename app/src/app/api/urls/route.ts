import { auth } from '@/lib/auth';
import { getUserByEmail, getWatchedUrls, addWatchedUrl, removeWatchedUrl, countWatchedUrls, getUrlLimit, muteUrl, updateWatchedUrl } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { triggerUrlCheckWorkflow } from '@/lib/github-dispatch';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const urls = await getWatchedUrls(user.id as string);
  return NextResponse.json(urls);
}

export async function POST(req: NextRequest) {
  // Rate limit: 10 URL-additions per minut per IP
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`urls:post:${ip}`, 10);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const count = await countWatchedUrls(user.id as string);
  const limit = getUrlLimit(user.plan as string);
  if (count >= limit) {
    return NextResponse.json({ error: `Plan limit reached (${limit} URLs)` }, { status: 403 });
  }

  const body = await req.json();
  const { url, name, threshold, selector, mobile, minImportance, cookies, headers, webhookUrl, category, ignoreSelectors, checkIntervalMinutes, watchIntent, keywordFilters, customPromptHint, waitForSelector, waitMs, scrollToBottom } = body;

  if (!url || !name) {
    return NextResponse.json({ error: 'url and name required' }, { status: 400 });
  }

  try {
    await addWatchedUrl(user.id as string, url, name, { threshold, selector, mobile, minImportance, cookies, headers, webhookUrl, category, ignoreSelectors, checkIntervalMinutes, watchIntent, keywordFilters, customPromptHint, waitForSelector, waitMs, scrollToBottom });
    // Trigga omedelbar first-check via GitHub Actions. Tyst fail om token saknas —
    // URL:en checkas ändå på nästa cron.
    const dispatch = await triggerUrlCheckWorkflow();
    return NextResponse.json({ ok: true, firstCheckQueued: dispatch.ok }, { status: 201 });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'URL already watched' }, { status: 409 });
    }
    throw e;
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const { id, muted } = body;

  if (typeof id !== 'number' || typeof muted !== 'boolean') {
    return NextResponse.json({ error: 'id (number) and muted (boolean) required' }, { status: 400 });
  }

  await muteUrl(user.id as string, id, muted);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const { id, name, threshold, selector, mobile, minImportance, cookies, headers, webhookUrl, category, ignoreSelectors, checkIntervalMinutes, watchIntent, keywordFilters, customPromptHint, waitForSelector, waitMs, scrollToBottom } = body;

  if (typeof id !== 'number') {
    return NextResponse.json({ error: 'id (number) required' }, { status: 400 });
  }

  try {
    const result = await updateWatchedUrl(user.id as string, id, {
      name, threshold, selector, mobile, minImportance, cookies, headers, webhookUrl, category,
      ignoreSelectors, checkIntervalMinutes, watchIntent, keywordFilters, customPromptHint,
      waitForSelector, waitMs, scrollToBottom,
    }, session.user.email);
    return NextResponse.json({ ok: true, changed: result.changed });
  } catch (e: any) {
    if (e.message === 'URL not found') {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }
    throw e;
  }
}


export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await removeWatchedUrl(user.id as string, parseInt(id));
  return NextResponse.json({ ok: true });
}
