/**
 * Triggar GitHub Actions workflow_dispatch för en omedelbar URL-check.
 * Kräver GITHUB_DISPATCH_TOKEN med workflow-scope i Vercel env vars.
 * Tyst fail om token saknas — checken körs ändå på cron-schemat.
 */
export async function triggerUrlCheckWorkflow(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) return { ok: false, reason: 'no token' };

  try {
    const res = await fetch(
      'https://api.github.com/repos/TWINDEJ/changebrief/actions/workflows/check-urls.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'master' }),
      }
    );
    if (res.status === 204) return { ok: true };
    return { ok: false, reason: `status ${res.status}` };
  } catch {
    return { ok: false, reason: 'fetch failed' };
  }
}
