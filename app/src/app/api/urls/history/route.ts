import { auth } from '@/lib/auth';
import { getUserByEmail, getUrlConfigHistory } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const idParam = req.nextUrl.searchParams.get('id');
  if (!idParam) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const history = await getUrlConfigHistory(user.id as string, parseInt(idParam, 10));
  return NextResponse.json(history);
}
