/**
 * Enkel in-memory rate limiter för Vercel serverless.
 *
 * Begränsning: varje serverless-instans har sin egen Map,
 * så limiten gäller per instans, inte globalt. Det stoppar
 * ändå uppenbara attacker (snabba requests mot samma instans).
 *
 * För produktion med hög trafik: byt till Vercel KV eller Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Rensa gamla entries var 5:e minut för att undvika minnesläcka
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Kontrollera rate limit för en given nyckel (t.ex. IP eller user ID).
 * @param key - Unik identifierare (IP, user ID, API key prefix)
 * @param limit - Max antal requests per fönster
 * @param windowMs - Tidsfönster i millisekunder (default 60s)
 */
export function checkRateLimit(key: string, limit: number, windowMs: number = 60_000): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // Nytt fönster
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return {
    allowed: entry.count <= limit,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Extrahera klient-IP från Vercel request headers.
 */
export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')
    || 'unknown';
}
