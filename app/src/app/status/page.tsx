import Link from 'next/link';

async function getHealthStatus() {
  try {
    // Server-side fetch till egen health-endpoint
    const baseUrl = process.env.AUTH_URL || 'https://app.changebrief.io';
    const res = await fetch(`${baseUrl}/api/health`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    return res.json();
  } catch {
    return { status: 'unknown', checks: {} };
  }
}

export default async function StatusPage() {
  const health = await getHealthStatus();
  const isHealthy = health.status === 'healthy';

  const statusColor = isHealthy ? 'bg-emerald-500' : 'bg-red-500';
  const statusText = isHealthy ? 'All systems operational' : 'Degraded performance';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#2563eb' }}>
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              change<span className="font-display-italic" style={{ color: 'var(--app-text)' }}>brief</span>
              <span className="text-slate-400 font-normal ml-2">Status</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Overall status */}
        <div className={`rounded-2xl p-6 text-white ${isHealthy ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${isHealthy ? 'bg-emerald-300 animate-pulse' : 'bg-red-300'}`} />
            <h2 className="text-xl font-semibold">{statusText}</h2>
          </div>
          <p className="mt-2 text-sm opacity-80">
            Last checked: {health.timestamp ? new Date(health.timestamp).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' }) : 'Unknown'}
          </p>
        </div>

        {/* Individual checks */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Components</h3>

          {/* App */}
          <div className="rounded-xl bg-white border border-slate-200 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Application (app.changebrief.io)</p>
              <p className="text-xs text-slate-400">Dashboard, API, authentication</p>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
          </div>

          {/* Database */}
          <div className="rounded-xl bg-white border border-slate-200 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Database (Turso)</p>
              <p className="text-xs text-slate-400">
                {health.checks?.database?.ok
                  ? `Responding in ${health.checks.database.ms}ms`
                  : health.checks?.database?.error || 'Unknown'}
              </p>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${health.checks?.database?.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>

          {/* Engine */}
          <div className="rounded-xl bg-white border border-slate-200 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Monitoring Engine</p>
              <p className="text-xs text-slate-400">Runs every 6 hours via GitHub Actions</p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>

          {/* Landing page */}
          <div className="rounded-xl bg-white border border-slate-200 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Landing Page (changebrief.io)</p>
              <p className="text-xs text-slate-400">Cloudflare Pages</p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
            Back to changebrief
          </Link>
        </div>
      </main>
    </div>
  );
}
