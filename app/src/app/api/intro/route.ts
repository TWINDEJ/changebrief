import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Lazy init — undviker att Vercel build faller när RESEND_API_KEY saknas i build-env.
// Endpointen anropas bara i runtime där env-varen finns.

// Max-längder på fält — håller mejlen läsbar och stoppar missbruk.
const LIMITS = {
  name: 120,
  email: 200,
  company: 200,
  urls: 2000,
  times: 500,
  message: 2000,
};

function clean(input: unknown, max: number): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, max);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`intro:${ip}`, 3, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // Honeypot: om "website"-fältet är ifyllt är det en bot. Svara 200 men
    // skicka inte mejl — tyst drop är bättre än att signalera att vi filtrerade.
    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const name = clean(body.name, LIMITS.name);
    const email = clean(body.email, LIMITS.email);
    const company = clean(body.company, LIMITS.company);
    const urls = clean(body.urls, LIMITS.urls);
    const times = clean(body.times, LIMITS.times);
    const message = clean(body.message, LIMITS.message);

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const lines: Array<[string, string]> = [
      ['Namn', name],
      ['E-post', email],
    ];
    if (company) lines.push(['Företag', company]);
    if (urls) lines.push(['URL:er att bevaka', urls]);
    if (times) lines.push(['Önskade tider', times]);
    if (message) lines.push(['Meddelande', message]);

    const textBody = [
      'Ny förfrågan om intromöte från changebrief.io/intro',
      '',
      ...lines.map(([k, v]) => `${k}:\n${v}\n`),
      `IP: ${ip}`,
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #334155;">
        <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 16px;">Ny förfrågan om intromöte</h2>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          ${lines
            .map(
              ([k, v]) => `
            <tr>
              <td style="vertical-align: top; padding: 8px 12px 8px 0; color: #64748b; white-space: nowrap;">${escapeHtml(k)}</td>
              <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(v)}</td>
            </tr>`,
            )
            .join('')}
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Skickat från changebrief.io/intro · IP ${escapeHtml(ip)}</p>
      </div>
    `;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY missing — intro request dropped', { email, name });
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }
    const resend = new Resend(apiKey);
    const notificationEmail = process.env.INTRO_NOTIFICATION_EMAIL || 'kristian@changebrief.io';
    const fromEmail = (process.env.EMAIL_FROM || 'changeBrief <noreply@changebrief.io>').trim();

    await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      replyTo: email,
      subject: `Intromöte changebrief — ${name}`,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Intro form error:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}
