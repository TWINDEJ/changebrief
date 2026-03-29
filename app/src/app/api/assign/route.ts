import { auth } from '@/lib/auth';
import { getUserByEmail, assignChange, unassignChange } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (user.plan !== 'team') {
    return NextResponse.json({ error: 'Team plan required' }, { status: 403 });
  }

  const body = await req.json();
  const { changeId, assignedTo } = body;

  if (!changeId) return NextResponse.json({ error: 'changeId required' }, { status: 400 });

  if (assignedTo) {
    await assignChange(user.id as string, changeId, assignedTo);
  } else {
    await unassignChange(user.id as string, changeId);
  }

  return NextResponse.json({ ok: true });
}
