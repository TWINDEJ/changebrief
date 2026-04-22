import 'dotenv/config';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

interface ChangeRow {
  url: string;
  name: string;
  summary: string | null;
  importance: number | null;
  change_percent: number;
  checked_at: string;
  jurisdiction: string | null;
  document_type: string | null;
  compliance_action: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface UserDigest {
  email: string;
  locale: string;
  changes: ChangeRow[];
  complianceChanges: ChangeRow[];
  totalUrls: number;
  topReasons: Map<string, string>; // url → "varför just denna"-text
}

async function getUsersWithDigest(): Promise<UserDigest[]> {
  // Get all users who have weekly_digest enabled
  const users = await db.execute({
    sql: `SELECT u.id, u.email, u.locale FROM users u WHERE u.weekly_digest = 1 AND u.email IS NOT NULL`,
    args: []
  });

  const digests: UserDigest[] = [];

  for (const user of users.rows) {
    // Get changes from the past 7 days with a summary (significant changes only)
    const changes = await db.execute({
      sql: `SELECT url, name, summary, importance, change_percent, checked_at, jurisdiction, document_type, compliance_action, reviewed_at, reviewed_by
            FROM change_history
            WHERE user_id = ? AND summary IS NOT NULL AND checked_at >= datetime('now', '-7 days')
            ORDER BY importance DESC, checked_at DESC`,
      args: [user.id]
    });

    const allChanges = changes.rows as unknown as ChangeRow[];

    // Hämta feedback-historik per URL för att personlisera rankningen (#12).
    // relevant-markeringar viktar upp URL:en, noise viktar ner.
    const feedbackHistory = await db.execute({
      sql: `SELECT ch.url, nf.verdict, COUNT(*) AS cnt
            FROM notification_feedback nf
            JOIN change_history ch ON ch.id = nf.change_history_id
            WHERE nf.user_id = ? AND nf.created_at >= datetime('now', '-60 days')
            GROUP BY ch.url, nf.verdict`,
      args: [user.id],
    }).catch(() => ({ rows: [] as unknown[] }));

    const feedbackByUrl = new Map<string, { relevant: number; noise: number }>();
    for (const row of feedbackHistory.rows as Array<{ url: string; verdict: string; cnt: number | string }>) {
      const entry = feedbackByUrl.get(row.url) ?? { relevant: 0, noise: 0 };
      if (row.verdict === 'relevant') entry.relevant += Number(row.cnt);
      if (row.verdict === 'noise') entry.noise += Number(row.cnt);
      feedbackByUrl.set(row.url, entry);
    }

    // Vikta: importance + 0.5 per relevant-markering − 0.7 per brus. Cap [0, 12].
    const weightedChanges = [...allChanges].map((c) => {
      const fb = feedbackByUrl.get(c.url);
      const boost = fb ? fb.relevant * 0.5 - fb.noise * 0.7 : 0;
      return { change: c, score: Math.min(12, Math.max(0, (c.importance ?? 0) + boost)), boost };
    });
    weightedChanges.sort((a, b) => b.score - a.score);

    const rankedChanges = weightedChanges.map((w) => w.change);

    // Bygg "varför just denna"-text för de tre översta.
    const topReasons = new Map<string, string>();
    const sv = (user.locale as string) === 'sv';
    for (const w of weightedChanges.slice(0, 3)) {
      if (w.boost >= 1) {
        topReasons.set(w.change.url, sv
          ? 'Liknande signaler har du markerat som relevanta tidigare.'
          : 'You\'ve marked similar signals as relevant before.');
      } else if (w.change.compliance_action === 'action_required') {
        topReasons.set(w.change.url, sv
          ? 'Klassificerad som åtgärdskrävande regulatorisk ändring.'
          : 'Classified as action-required regulatory change.');
      } else if ((w.change.importance ?? 0) >= 8) {
        topReasons.set(w.change.url, sv
          ? `Hög viktighet (${w.change.importance}/10).`
          : `High importance (${w.change.importance}/10).`);
      }
    }

    const complianceChanges = rankedChanges.filter(c => c.compliance_action != null);

    const totalUrls = await db.execute({
      sql: `SELECT COUNT(*) as count FROM watched_urls WHERE user_id = ? AND active = 1`,
      args: [user.id]
    });

    digests.push({
      email: user.email as string,
      locale: (user.locale as string) || 'en',
      changes: rankedChanges,
      complianceChanges,
      totalUrls: Number(totalUrls.rows[0].count),
      topReasons,
    });
  }

  return digests;
}

function buildComplianceSection(complianceChanges: ChangeRow[], sv: boolean): string {
  if (complianceChanges.length === 0) return '';

  const actionRequired = complianceChanges.filter(c => c.compliance_action === 'action_required');
  const review = complianceChanges.filter(c => c.compliance_action === 'review_recommended');
  const unreviewed = complianceChanges.filter(c => !c.reviewed_at);

  const rows = complianceChanges.slice(0, 8).map(c => {
    const actionColor = c.compliance_action === 'action_required' ? '#ef4444'
      : c.compliance_action === 'review_recommended' ? '#f59e0b' : '#64748b';
    const actionLabel = c.compliance_action === 'action_required'
      ? (sv ? '🔴 Åtgärd' : '🔴 Action')
      : c.compliance_action === 'review_recommended'
        ? (sv ? '🟡 Granska' : '🟡 Review')
        : 'ℹ️ Info';
    const juris = c.jurisdiction ? `[${c.jurisdiction}]` : '';
    const docType = c.document_type || '';

    const reviewedTag = c.reviewed_at
      ? `<span style="color: #10b981; font-size: 11px; margin-left: 8px;">✓ ${sv ? 'Granskad' : 'Reviewed'}${c.reviewed_by ? ` ${sv ? 'av' : 'by'} ${c.reviewed_by.split('@')[0]}` : ''}</span>`
      : '';

    return `
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #1e293b;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="color: ${actionColor}; font-size: 12px; font-weight: 600;">${actionLabel}</span>
            <span style="color: #475569; font-size: 11px;">${juris} ${docType}</span>${reviewedTag}
          </div>
          <strong style="color: #f1f5f9; font-size: 14px;">${c.name}</strong>
          <p style="margin: 2px 0 0; color: #94a3b8; font-size: 13px;">${c.summary || ''}</p>
        </td>
      </tr>`;
  }).join('');

  return `
    <!-- Compliance section -->
    <div style="background: #0f172a; border: 1px solid rgba(239,68,68,0.2); border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
      <div style="padding: 16px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; gap: 12px;">
        <h3 style="color: #f1f5f9; font-size: 14px; margin: 0;">⚖️ ${sv ? 'Regulatoriska ändringar' : 'Regulatory Changes'}</h3>
        ${actionRequired.length > 0 ? `<span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${actionRequired.length} ${sv ? 'kräver åtgärd' : 'action required'}</span>` : ''}
        ${review.length > 0 ? `<span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${review.length} ${sv ? 'att granska' : 'to review'}</span>` : ''}
        ${unreviewed.length > 0 ? `<span style="background: rgba(100,116,139,0.15); color: #94a3b8; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${unreviewed.length} ${sv ? 'väntar' : 'pending review'}</span>` : ''}
      </div>
      <table style="width: 100%; border-collapse: collapse;">${rows}</table>
    </div>`;
}

function buildDigestHtml(digest: UserDigest): string {
  const { changes, complianceChanges, totalUrls, locale, topReasons } = digest;
  const sv = locale === 'sv';
  const changedPages = new Set(changes.map(c => c.name)).size;
  const topChange = changes[0];
  const dateFmt = sv ? 'sv-SE' : 'en-US';

  const changeRows = changes.slice(0, 10).map((c, idx) => {
    const imp = c.importance ?? 0;
    const color = imp >= 7 ? '#ef4444' : imp >= 4 ? '#f97316' : '#22c55e';
    const date = new Date(c.checked_at + 'Z').toLocaleDateString(dateFmt, { weekday: 'short', month: 'short', day: 'numeric' });
    const reason = idx < 3 ? topReasons.get(c.url) : undefined;
    const reasonHtml = reason
      ? `<p style="margin: 6px 0 0; color: #60a5fa; font-size: 11px; font-style: italic;">✨ ${sv ? 'Därför: ' : 'Why: '}${reason}</p>`
      : '';

    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">${imp}/10</span>
            <strong style="color: #f1f5f9;">${c.name}</strong>
          </div>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 14px;">${c.summary}</p>
          ${reasonHtml}
          <span style="color: #475569; font-size: 12px;">${date}</span>
        </td>
      </tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #06080f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #f1f5f9; font-size: 24px; margin: 0;">
        change<span style="color: #60a5fa;">brief</span>
      </h1>
      <p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">${sv ? 'Veckorapport' : 'Weekly Digest'}</p>
    </div>

    <!-- Summary card -->
    <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #f1f5f9; font-size: 18px; margin: 0 0 16px;">${sv ? 'Veckans sammanfattning' : 'This week at a glance'}</h2>
      <div style="display: flex; gap: 24px;">
        <div>
          <div style="color: #60a5fa; font-size: 28px; font-weight: 700;">${changes.length}</div>
          <div style="color: #64748b; font-size: 13px;">${sv ? 'ändringar' : 'changes detected'}</div>
        </div>
        <div>
          <div style="color: #60a5fa; font-size: 28px; font-weight: 700;">${changedPages}</div>
          <div style="color: #64748b; font-size: 13px;">${sv ? 'sidor ändrade' : 'pages changed'}</div>
        </div>
        <div>
          <div style="color: #60a5fa; font-size: 28px; font-weight: 700;">${totalUrls}</div>
          <div style="color: #64748b; font-size: 13px;">${sv ? 'sidor bevakade' : 'pages monitored'}</div>
        </div>
      </div>
    </div>

    ${changes.length === 0 ? `
    <!-- No changes -->
    <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 32px; text-align: center;">
      <p style="color: #64748b; font-size: 14px; margin: 0;">${sv ? 'Inga betydande ändringar den här veckan. Dina bevakade sidor är stabila.' : 'No significant changes detected this week. Your monitored pages are stable.'}</p>
    </div>
    ` : `
    ${buildComplianceSection(complianceChanges, sv)}

    <!-- Top change highlight -->
    ${topChange ? `
    <div style="background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(99,102,241,0.2); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <div style="color: #818cf8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${sv ? 'Viktigaste ändringen' : 'Most important change'}</div>
      <p style="color: #f1f5f9; font-size: 15px; margin: 0; line-height: 1.5;"><strong>${topChange.name}:</strong> ${topChange.summary}</p>
    </div>
    ` : ''}

    <!-- All changes -->
    <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden;">
      <div style="padding: 16px; border-bottom: 1px solid #1e293b;">
        <h3 style="color: #f1f5f9; font-size: 14px; margin: 0;">${sv ? 'Alla ändringar denna vecka (rankade efter vikt)' : 'All changes this week (ranked by importance)'}</h3>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${changeRows}
      </table>
      ${changes.length > 10 ? `<div style="padding: 12px 16px; text-align: center;"><a href="https://app.changebrief.io/dashboard" style="color: #60a5fa; font-size: 13px; text-decoration: none;">${sv ? `Se alla ${changes.length} ändringar →` : `View all ${changes.length} changes →`}</a></div>` : ''}
    </div>
    `}

    <!-- CTA -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://app.changebrief.io/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">${sv ? 'Öppna Dashboard' : 'Open Dashboard'}</a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #1e293b;">
      <p style="color: #475569; font-size: 12px; margin: 0;">
        ${sv ? 'Du får detta mejl för att du har veckorapport aktiverad.' : "You're receiving this because you have weekly digest enabled."}
        <a href="https://app.changebrief.io/dashboard" style="color: #60a5fa; text-decoration: none;">${sv ? 'Hantera inställningar' : 'Manage settings'}</a>
      </p>
      <p style="color: #334155; font-size: 11px; margin: 8px 0 0;">&copy; 2026 changebrief</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendDigestEmail(email: string, html: string, changeCount: number, locale: string = 'en') {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`  → Skipped (no RESEND_API_KEY): ${email}`);
    return;
  }

  const sv = locale === 'sv';
  const subject = changeCount > 0
    ? sv
      ? `Din veckorapport: ${changeCount} ändring${changeCount === 1 ? '' : 'ar'} upptäckt${changeCount === 1 ? '' : 'a'}`
      : `Your weekly digest: ${changeCount} change${changeCount === 1 ? '' : 's'} detected`
    : sv
      ? 'Din veckorapport: alla sidor stabila'
      : 'Your weekly digest: all pages stable';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'changebrief <digest@changebrief.io>',
      reply_to: 'kristian@changebrief.io',
      to: [email],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  → Digest email failed for ${email}: ${response.status} ${err}`);
  } else {
    console.log(`  → Digest sent to ${email} (${changeCount} changes)`);
  }
}

async function main() {
  console.log('Generating weekly digests...\n');

  const digests = await getUsersWithDigest();
  console.log(`Found ${digests.length} users with digest enabled.`);

  for (const digest of digests) {
    const html = buildDigestHtml(digest);
    await sendDigestEmail(digest.email, html, digest.changes.length, digest.locale);
  }

  console.log('\nDone!');
}

main().catch(console.error);
