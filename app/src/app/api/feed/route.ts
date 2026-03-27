import { auth } from '@/lib/auth';
import { getUserByEmail, getComplianceHistory } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const params = req.nextUrl.searchParams;
  const jurisdiction = params.get('jurisdiction') || undefined;
  const complianceAction = params.get('action') || undefined;

  const history = await getComplianceHistory(user.id as string, {
    jurisdiction,
    complianceAction,
    limit: 50,
  }) as any[];

  const feedTitle = jurisdiction
    ? `changebrief — Regulatory changes [${jurisdiction}]`
    : 'changebrief — Regulatory changes';

  const items = history.map((row) => {
    const date = row.checked_at ? new Date(row.checked_at + 'Z').toUTCString() : new Date().toUTCString();
    const actionTag = row.compliance_action === 'action_required' ? '[ACTION REQUIRED] '
      : row.compliance_action === 'review_recommended' ? '[REVIEW] ' : '';
    const jurisTag = row.jurisdiction ? `[${row.jurisdiction}] ` : '';

    return `    <item>
      <title>${escapeXml(`${actionTag}${jurisTag}${row.name}: ${row.summary || 'Change detected'}`)}</title>
      <link>${escapeXml(row.url)}</link>
      <guid isPermaLink="false">changebrief-${row.id}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(row.summary || 'No summary available')}</description>
      ${row.jurisdiction ? `<category>${escapeXml(row.jurisdiction)}</category>` : ''}
      ${row.document_type ? `<category>${escapeXml(row.document_type)}</category>` : ''}
      ${row.compliance_action ? `<category>${escapeXml(row.compliance_action)}</category>` : ''}
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>https://app.changebrief.io/dashboard</link>
    <description>AI-classified regulatory changes from government agencies and regulators</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://app.changebrief.io/api/feed${jurisdiction ? `?jurisdiction=${jurisdiction}` : ''}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
