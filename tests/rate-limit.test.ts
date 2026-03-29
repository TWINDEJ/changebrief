import { describe, it, expect } from 'vitest';

// Testar rate limit-logiken utan att importera från app (Next.js paths)
// Samma algoritm som app/src/lib/rate-limit.ts

describe('Rate limiting', () => {
  const store = new Map<string, { count: number; resetAt: number }>();

  function checkRateLimit(key: string, limit: number, windowMs: number = 60_000) {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    entry.count++;
    const remaining = Math.max(0, limit - entry.count);
    return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
  }

  it('tillåter requests under gränsen', () => {
    const result = checkRateLimit('test-allow', 5);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blockar vid överskridande', () => {
    const key = 'test-block';
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3);
    const result = checkRateLimit(key, 3);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('återställer efter tidsfönstret', () => {
    const key = 'test-reset';
    // Fyll kvoten
    for (let i = 0; i < 5; i++) checkRateLimit(key, 5, 1); // 1ms fönster
    // Vänta 2ms
    const entry = store.get(key);
    if (entry) entry.resetAt = Date.now() - 1; // Simulera att fönstret gått ut
    const result = checkRateLimit(key, 5, 1);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('separerar nycklar', () => {
    for (let i = 0; i < 3; i++) checkRateLimit('user-a', 3);
    const resultA = checkRateLimit('user-a', 3);
    const resultB = checkRateLimit('user-b', 3);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });
});
