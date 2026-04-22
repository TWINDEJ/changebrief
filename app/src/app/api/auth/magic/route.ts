import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createMagicToken } from '@/lib/db';

// Lazy init så build inte faller när RESEND_API_KEY saknas i build-env.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const trimmed = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY missing — magic link not sent');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }
    const resend = new Resend(apiKey);

    const token = await createMagicToken(trimmed);

    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/login/verify?token=${token}&email=${encodeURIComponent(trimmed)}`;

    await resend.emails.send({
      from: (process.env.EMAIL_FROM || 'changeBrief <noreply@changebrief.io>').trim(),
      to: trimmed,
      subject: `Your changeBrief sign-in code for ${trimmed}`,
      text: [
        'changeBrief — AI-powered webpage change monitoring',
        '',
        `Hello,`,
        '',
        `You requested to sign in to changeBrief with ${trimmed}.`,
        '',
        'To complete your sign-in, visit the link below:',
        verifyUrl,
        '',
        'This link will expire in 15 minutes for security reasons.',
        '',
        'If you did not request this email, no action is needed — your account is safe.',
        '',
        '---',
        'changeBrief — https://changebrief.io',
        'AI-powered monitoring that tells you what changed on any webpage.',
        'Questions? Reply to this email or contact support@changebrief.io',
      ].join('\n'),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #334155;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">
              change<span style="color: #2563eb;">brief</span>
            </h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">AI-powered webpage change monitoring</p>
          </div>
          <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            You requested to sign in to your changeBrief account with <strong>${trimmed}</strong>.
            Click the button below to continue.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Sign in to changeBrief
            </a>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
            This link will expire in 15 minutes for security reasons.
            If you did not request this email, no action is needed — your account is safe.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px;" />
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
            <a href="https://changebrief.io" style="color: #64748b; text-decoration: none;">changeBrief</a> — AI-powered monitoring that tells you what changed on any webpage.<br/>
            Questions? Contact <a href="mailto:support@changebrief.io" style="color: #64748b;">support@changebrief.io</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
