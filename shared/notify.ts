import { ChangeAnalysis } from './vision';

// ─── Gemensam payload som alla integrationer kan använda ───

export interface ChangeEvent {
  url: string;
  name: string;
  analysis: ChangeAnalysis;
  diffPercent: number;
  timestamp: string;
}

function buildChangeEvent(url: string, name: string, analysis: ChangeAnalysis, diffPercent: number): ChangeEvent {
  return { url, name, analysis, diffPercent, timestamp: new Date().toISOString() };
}

// ─── Email via Resend ───

export async function sendEmailNotification(
  to: string,
  name: string,
  url: string,
  analysis: ChangeAnalysis,
  locale: string = 'en'
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`  → [EMAIL] Skipped (no RESEND_API_KEY): ${to}`);
    return;
  }

  const sv = locale === 'sv';
  const emoji = analysis.importance >= 7 ? '🔴' : analysis.importance >= 4 ? '🟡' : '🟢';
  const elements = analysis.changedElements.length > 0
    ? analysis.changedElements.map(el => `<li>${el}</li>`).join('')
    : `<li>${sv ? 'Ej specificerat' : 'N/A'}</li>`;

  const actionLabels: Record<string, { en: string; sv: string }> = {
    action_required: { en: '🔴 Action required', sv: '🔴 Åtgärd krävs' },
    review_recommended: { en: '🟡 Review recommended', sv: '🟡 Granskning rekommenderas' },
    info_only: { en: 'ℹ️ Info only', sv: 'ℹ️ Endast information' },
  };

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="padding: 24px;">
        <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 4px;">
          ${emoji} ${sv ? 'Ändring upptäckt' : 'Change detected'}: ${name}
        </h2>
        <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin: 12px 0;">${analysis.summary}</p>
        ${analysis.complianceAction ? `
        <div style="margin: 16px 0; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; ${analysis.complianceAction === 'action_required' ? 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;' : analysis.complianceAction === 'review_recommended' ? 'background: #fffbeb; color: #d97706; border: 1px solid #fde68a;' : 'background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;'}">
          ${actionLabels[analysis.complianceAction]?.[locale as 'en' | 'sv'] || analysis.complianceAction}${analysis.jurisdiction ? ` [${analysis.jurisdiction}]` : ''}${analysis.documentType ? ` · ${analysis.documentType}` : ''}
        </div>` : ''}
        <table style="margin: 16px 0; font-size: 14px; color: #475569;">
          <tr><td style="padding: 4px 16px 4px 0;"><strong>${sv ? 'Vikt' : 'Importance'}:</strong></td><td>${analysis.importance}/10</td></tr>
          <tr><td style="padding: 4px 16px 4px 0;"><strong>URL:</strong></td><td><a href="${url}" style="color: #3b82f6;">${url}</a></td></tr>
        </table>
        <p style="font-size: 14px; color: #475569; margin-bottom: 4px;"><strong>${sv ? 'Ändrade element' : 'Changed elements'}:</strong></p>
        <ul style="font-size: 14px; color: #475569; margin: 0; padding-left: 20px;">${elements}</ul>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="https://app.changebrief.io/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 10px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
            ${sv ? 'Öppna Dashboard' : 'Open Dashboard'}
          </a>
        </div>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding: 16px 24px;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          ${sv ? 'Skickat av' : 'Sent by'} <a href="https://changebrief.io" style="color: #3b82f6; text-decoration: none;">changebrief</a>
          · <a href="https://app.changebrief.io/dashboard" style="color: #94a3b8; text-decoration: none;">${sv ? 'Hantera inställningar' : 'Manage settings'}</a>
        </p>
      </div>
    </div>
  `;

  const subject = sv
    ? `${emoji} ${name}: ${analysis.summary}`
    : `${emoji} ${name}: ${analysis.summary}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'changebrief <notifications@changebrief.io>',
      reply_to: 'kristian@changebrief.io',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  → Email failed: ${response.status} ${err}`);
  } else {
    console.log(`  → Email sent to ${to}`);
  }
}

// ─── Slack ───

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  elements?: Array<{ type: string; text: string }>;
  fields?: Array<{ type: string; text: string }>;
}

export async function sendSlackNotification(
  webhookUrl: string,
  url: string,
  name: string,
  analysis: ChangeAnalysis,
  diffPercent: number
): Promise<void> {
  const emoji = analysis.importance >= 7 ? '🔴' : analysis.importance >= 4 ? '🟡' : '🟢';

  // Compliance-taggar om de finns
  const complianceTag = analysis.complianceAction === 'action_required' ? '🔴 ACTION REQUIRED'
    : analysis.complianceAction === 'review_recommended' ? '🟡 Review recommended'
    : analysis.complianceAction === 'info_only' ? 'ℹ️ Info only' : '';
  const jurisdictionTag = analysis.jurisdiction ? ` [${analysis.jurisdiction}]` : '';
  const docTypeTag = analysis.documentType ? ` • ${analysis.documentType}` : '';
  const complianceLine = complianceTag ? `\n${complianceTag}${jurisdictionTag}${docTypeTag}` : '';

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${emoji} Change on ${name}`, emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*${analysis.summary}*${complianceLine}` }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Importance:* ${analysis.importance}/10` },
        { type: 'mrkdwn', text: `*Pixel diff:* ${diffPercent.toFixed(2)}%` },
        { type: 'mrkdwn', text: `*Changed elements:* ${analysis.changedElements.join(', ') || 'N/A'}` },
        { type: 'mrkdwn', text: `*URL:* <${url}|Open page>` }
      ]
    }
  ];

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks })
  });

  if (!response.ok) {
    console.error(`Slack notification failed: ${response.status} ${response.statusText}`);
  } else {
    console.log('  → Slack notification sent!');
  }
}

// ─── Microsoft Teams ───

export async function sendTeamsNotification(
  webhookUrl: string,
  url: string,
  name: string,
  analysis: ChangeAnalysis,
  diffPercent: number
): Promise<void> {
  const card = {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          { type: 'TextBlock', text: `Change on ${name}`, weight: 'Bolder', size: 'Large', color: analysis.importance >= 7 ? 'Attention' : 'Default' },
          { type: 'TextBlock', text: analysis.summary, wrap: true },
          ...(analysis.complianceAction ? [{
            type: 'TextBlock',
            text: `**${analysis.complianceAction === 'action_required' ? '🔴 ACTION REQUIRED' : analysis.complianceAction === 'review_recommended' ? '🟡 Review recommended' : 'ℹ️ Info only'}**${analysis.jurisdiction ? ` [${analysis.jurisdiction}]` : ''}${analysis.documentType ? ` • ${analysis.documentType}` : ''}`,
            wrap: true, color: analysis.complianceAction === 'action_required' ? 'Attention' : 'Default'
          }] : []),
          {
            type: 'ColumnSet',
            columns: [
              { type: 'Column', width: 'auto', items: [{ type: 'TextBlock', text: `**Importance:** ${analysis.importance}/10`, wrap: true }] },
              { type: 'Column', width: 'auto', items: [{ type: 'TextBlock', text: `**Pixel diff:** ${diffPercent.toFixed(2)}%`, wrap: true }] }
            ]
          },
          { type: 'TextBlock', text: `**Changed elements:** ${analysis.changedElements.join(', ') || 'N/A'}`, wrap: true }
        ],
        actions: [{ type: 'Action.OpenUrl', title: 'Open page', url }]
      }
    }]
  };

  const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(card) });
  if (!response.ok) console.error(`Teams notification failed: ${response.status}`);
  else console.log('  → Teams notification sent!');
}

// ─── Discord ───

export async function sendDiscordNotification(
  webhookUrl: string,
  url: string,
  name: string,
  analysis: ChangeAnalysis,
  diffPercent: number
): Promise<void> {
  const color = analysis.importance >= 7 ? 0xFF0000 : analysis.importance >= 4 ? 0xFFA500 : 0x00FF00;

  const embed = {
    embeds: [{
      title: `Change on ${name}`,
      description: analysis.summary,
      color,
      fields: [
        { name: 'Importance', value: `${analysis.importance}/10`, inline: true },
        { name: 'Pixel diff', value: `${diffPercent.toFixed(2)}%`, inline: true },
        { name: 'Changed elements', value: analysis.changedElements.join(', ') || 'N/A' },
        { name: 'URL', value: url }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(embed) });
  if (!response.ok) console.error(`Discord notification failed: ${response.status}`);
  else console.log('  → Discord notification sent!');
}

// ─── PagerDuty ───

export async function sendPagerDutyAlert(
  routingKey: string,
  url: string,
  name: string,
  analysis: ChangeAnalysis,
  diffPercent: number
): Promise<void> {
  const severity = analysis.importance >= 8 ? 'critical' : analysis.importance >= 6 ? 'error' : analysis.importance >= 4 ? 'warning' : 'info';

  const payload = {
    routing_key: routingKey,
    event_action: 'trigger',
    payload: {
      summary: `[changebrief] ${name}: ${analysis.summary}`,
      severity,
      source: 'changebrief',
      component: name,
      custom_details: { url, importance: analysis.importance, diffPercent: diffPercent.toFixed(2), changedElements: analysis.changedElements, summary: analysis.summary }
    },
    links: [{ href: url, text: 'Open page' }]
  };

  const response = await fetch('https://events.pagerduty.com/v2/enqueue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) console.error(`PagerDuty alert failed: ${response.status}`);
  else console.log('  → PagerDuty alert sent!');
}

// ─── Jira ───

export async function createJiraIssue(
  baseUrl: string, email: string, apiToken: string, projectKey: string,
  url: string, name: string, analysis: ChangeAnalysis, diffPercent: number
): Promise<void> {
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const issue = {
    fields: {
      project: { key: projectKey },
      issuetype: { name: 'Task' },
      summary: `[changebrief] Change on ${name} (${analysis.importance}/10)`,
      description: { type: 'doc', version: 1, content: [
        { type: 'paragraph', content: [{ type: 'text', text: analysis.summary }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'URL: ' }, { type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] }] },
      ]},
      labels: ['changebrief', `importance-${analysis.importance}`]
    }
  };

  const response = await fetch(`${baseUrl}/rest/api/3/issue`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }, body: JSON.stringify(issue) });
  if (!response.ok) console.error(`Jira issue failed: ${response.status}`);
  else { const data = await response.json() as { key: string }; console.log(`  → Jira issue created: ${data.key}`); }
}

// ─── Per-URL Webhook (Pro+ feature) ───

export async function sendWebhookNotification(
  webhookUrl: string, url: string, name: string, analysis: ChangeAnalysis, diffPercent: number
): Promise<void> {
  const payload = {
    event: 'change.detected',
    url, name,
    summary: analysis.summary,
    importance: analysis.importance,
    changedElements: analysis.changedElements,
    changePercent: diffPercent,
    timestamp: new Date().toISOString(),
  };
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'changebrief/1.0' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    console.error(`  → Webhook failed: ${response.status} ${webhookUrl}`);
  } else {
    console.log(`  → Webhook sent to ${webhookUrl}`);
  }
}

// ─── Generic Webhook ───

export async function sendGenericWebhook(
  webhookUrl: string, url: string, name: string, analysis: ChangeAnalysis, diffPercent: number
): Promise<void> {
  const event = buildChangeEvent(url, name, analysis, diffPercent);
  const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) });
  if (!response.ok) console.error(`Webhook failed: ${response.status}`);
  else console.log('  → Webhook sent!');
}
