import { authenticateApiKey } from '@/lib/api-auth';
import { getChangeHistory, getComplianceHistory } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Rate limit: 60 requests/min per IP
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

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'compliance' or null for all
  const jurisdiction = searchParams.get('jurisdiction');
  const action = searchParams.get('action');
  const limit = Math.min(Number(searchParams.get('limit') || 50), 200);

  let changes;
  if (type === 'compliance' || jurisdiction || action) {
    changes = await getComplianceHistory(user.id as string, {
      jurisdiction: jurisdiction || undefined,
      complianceAction: action || undefined,
      limit,
    });
  } else {
    changes = await getChangeHistory(user.id as string, limit);
  }

  return NextResponse.json({
    data: (changes as any[]).map(c => ({
      id: c.id,
      url: c.url,
      name: c.name,
      summary: c.summary,
      importance: c.importance,
      change_percent: c.change_percent,
      changed_elements: c.changed_elements ? JSON.parse(c.changed_elements as string) : [],
      jurisdiction: c.jurisdiction,
      document_type: c.document_type,
      compliance_action: c.compliance_action,
      reviewed_at: c.reviewed_at,
      reviewed_by: c.reviewed_by,
      checked_at: c.checked_at,
    })),
    count: changes.length,
  });
}
