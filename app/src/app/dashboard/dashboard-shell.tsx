'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { useScrolled } from './scroll-header';
import { Confetti } from './confetti';

interface Props {
  children: ReactNode;
  header: ReactNode;
}

export function DashboardShell({ children, header }: Props) {
  const scrolled = useScrolled();
  const [showConfetti, setShowConfetti] = useState(false);
  const clearConfetti = useCallback(() => setShowConfetti(false), []);

  // Exponera triggerConfetti globalt så add-url-form kan anropa den
  if (typeof window !== 'undefined') {
    (window as any).__triggerConfetti = () => setShowConfetti(true);
  }

  return (
    <>
      <Confetti active={showConfetti} onDone={clearConfetti} />
      <header
        className={`sticky top-0 z-30 border-b px-4 sm:px-6 py-4 transition-all duration-300 ${
          scrolled ? 'shadow-md backdrop-blur-xl' : ''
        }`}
        style={{
          borderColor: 'var(--app-border)',
          background: scrolled ? 'var(--app-glass)' : 'var(--app-header-bg)',
        }}
      >
        {header}
      </header>
      {children}
    </>
  );
}
