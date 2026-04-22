'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../locale-provider';

const tabs = [
  { href: '/dashboard/monitors', label: { en: '① Monitors', sv: '① Bevakningar' } },
  { href: '/dashboard/activity', label: { en: '② Activity', sv: '② Aktivitet' } },
  { href: '/dashboard/reports', label: { en: '③ Reports', sv: '③ Rapporter' } },
  { href: '/dashboard/settings', label: { en: 'Settings', sv: 'Inställningar' } },
] as const;

export function TabNav() {
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <nav
      className="flex flex-nowrap gap-1 border-b px-4 sm:px-6 overflow-x-auto"
      style={{ borderColor: 'var(--app-border)' }}
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
              isActive ? '' : 'hover:opacity-80'
            }`}
            style={{
              color: isActive ? 'var(--app-text)' : 'var(--app-text-muted)',
              borderBottom: isActive ? '2px solid #818cf8' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
