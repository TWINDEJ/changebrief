import { cache } from 'react';
import { auth } from '@/lib/auth';
import { getUserByEmail, getWatchedUrls, getDashboardStats } from '@/lib/db';

/**
 * Deduplicerade data-hämtningar med React cache().
 * Inom samma server-request körs varje funktion max en gång,
 * oavsett om layout + page + component alla anropar den.
 */

export const getSession = cache(async () => {
  return auth();
});

export const getUser = cache(async () => {
  const session = await getSession();
  if (!session?.user?.email) return null;
  return getUserByEmail(session.user.email);
});

export const getUserUrls = cache(async (userId: string) => {
  return getWatchedUrls(userId) as Promise<any[]>;
});

export const getUserStats = cache(async (userId: string) => {
  return getDashboardStats(userId);
});
