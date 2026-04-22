import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { triggerUrlCheckWorkflow } from '@/lib/github-dispatch';

/**
 * POST /api/check-now
 * Triggar GitHub Actions workflow_dispatch för omedelbar URL-check.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await triggerUrlCheckWorkflow();
  if (result.ok) return NextResponse.json({ ok: true, triggered: true });
  return NextResponse.json({ ok: false, reason: result.reason });
}
