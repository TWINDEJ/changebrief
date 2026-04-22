'use client';

import { type ReactNode } from 'react';
import { useScrolled } from './scroll-header';

interface Props {
  children: ReactNode;
  header: ReactNode;
}

export function DashboardShell({ children, header }: Props) {
  const scrolled = useScrolled();

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b px-4 sm:px-6 py-4 transition-all duration-300 ${
          scrolled ? 'shadow-sm' : ''
        }`}
        style={{
          borderColor: 'var(--app-border)',
          background: 'var(--app-header-bg)',
        }}
      >
        {header}
      </header>
      {children}
    </>
  );
}
