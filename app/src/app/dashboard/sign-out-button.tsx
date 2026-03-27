'use client';

import { signOut } from 'next-auth/react';
import { useLocale } from '../locale-provider';

export function SignOutButton() {
  const { t } = useLocale();
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="cursor-pointer text-sm text-slate-500 transition hover:text-white"
    >
      {t('header.signout')}
    </button>
  );
}
