import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};

  // DB check
  const dbStart = Date.now();
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const result = await db.execute('SELECT COUNT(*) as count FROM users');
    checks.database = { ok: true, ms: Date.now() - dbStart };
  } catch (err: any) {
    checks.database = { ok: false, ms: Date.now() - dbStart, error: err.message?.slice(0, 100) };
  }

  // Env vars check
  const requiredEnvVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'AUTH_SECRET', 'RESEND_API_KEY'];
  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
  checks.env = {
    ok: missingEnvVars.length === 0,
    ...(missingEnvVars.length > 0 ? { error: `Missing: ${missingEnvVars.join(', ')}` } : {}),
  };

  const allOk = Object.values(checks).every(c => c.ok);

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
