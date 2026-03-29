import { auth } from '@/lib/auth';
import { getUserByEmail, updateUserSettings } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const locale = body.locale === 'sv' ? 'sv' : 'en';

  await updateUserSettings(user.id as string, { locale });
  return NextResponse.json({ ok: true });
}
