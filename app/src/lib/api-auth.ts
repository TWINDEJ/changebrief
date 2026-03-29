import { NextRequest } from 'next/server';
import { getUserByApiKey } from './db';

/**
 * Authenticate a request via Bearer token (API key).
 * Returns the user row or null if invalid/missing.
 */
export async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const key = authHeader.slice(7).trim();
  if (!key.startsWith('cb_')) return null;

  return getUserByApiKey(key);
}
