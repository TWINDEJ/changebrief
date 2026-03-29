import { auth } from '@/lib/auth';
import { getUserByEmail, createApiKey, listApiKeys, revokeApiKey } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// List API keys
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Only Pro+ can use API keys
  if (user.plan === 'free') {
    return NextResponse.json({ error: 'API keys require Pro or Team plan' }, { status: 403 });
  }

  const keys = await listApiKeys(user.id as string);
  return NextResponse.json({ keys });
}

// Create new API key
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (user.plan === 'free') {
    return NextResponse.json({ error: 'API keys require Pro or Team plan' }, { status: 403 });
  }

  const body = await req.json();
  const name = (body.name || 'Default').slice(0, 100);

  // Limit to 5 active keys
  const existing = await listApiKeys(user.id as string);
  if (existing.length >= 5) {
    return NextResponse.json({ error: 'Maximum 5 active API keys' }, { status: 400 });
  }

  const { id, key } = await createApiKey(user.id as string, name);
  return NextResponse.json({ id, key, name, message: 'Save this key — it will not be shown again.' });
}

// Revoke API key
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get('id');
  if (!keyId) return NextResponse.json({ error: 'Missing key ID' }, { status: 400 });

  await revokeApiKey(user.id as string, keyId);
  return NextResponse.json({ ok: true });
}
