import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Mellansida — Outlook SafeLinks pre-fetchar GET-länkar och konsumerar
// one-time tokens. Därför visar vi en knapp som triggar POST (server action).

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : null;
  const email = typeof params.email === 'string' ? params.email : null;

  if (!token || !email) {
    redirect('/login');
  }

  async function handleVerify() {
    'use server';
    await signIn('magic-link', {
      token,
      email,
      redirectTo: '/dashboard',
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--app-bg)' }}>
      <div className="w-full max-w-sm space-y-6 rounded-2xl shadow-lg p-8 text-center" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--app-accent)' }}>
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Confirm sign in</h1>
        <p className="text-sm text-slate-500">
          Click the button below to sign in as <strong className="text-slate-700">{email}</strong>
        </p>
        <form action={handleVerify}>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl px-4 py-3.5 text-sm font-semibold text-white"
            style={{ background: 'var(--app-accent)' }}
          >
            Sign in
          </button>
        </form>
        <a href="/login" className="block text-xs text-slate-400 hover:text-slate-600">
          Back to login
        </a>
      </div>
    </div>
  );
}
