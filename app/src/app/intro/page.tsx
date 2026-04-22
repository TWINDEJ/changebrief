import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { type Locale, t as translate } from '@/lib/i18n';
import { IntroForm } from './intro-form';

export const metadata: Metadata = {
  title: 'Book an intro call — changebrief',
  description: 'Get help setting up your first monitors. 30 minutes with Kristian.',
};

export default async function IntroPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || 'en';
  const t = (key: Parameters<typeof translate>[0]) => translate(key, locale);

  return (
    <div className="min-h-screen px-4 py-12 sm:py-20" style={{ background: 'var(--app-bg)' }}>
      <div className="mx-auto max-w-xl">
        <Link
          href="https://changebrief.io"
          className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'var(--app-text-muted)' }}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          changebrief.io
        </Link>

        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl" style={{ color: 'var(--app-text)' }}>
          {t('intro.title')}
        </h1>
        <p className="mt-3 text-base" style={{ color: 'var(--app-text-secondary)' }}>
          {t('intro.subtitle')}
        </p>

        <div className="mt-8">
          <IntroForm />
        </div>
      </div>
    </div>
  );
}
