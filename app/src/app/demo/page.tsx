import Link from 'next/link';

// Hardcoded mock data — no DB or auth needed
const mockChanges = [
  {
    id: 1, url: 'https://www.fi.se/sv/vara-register/foretagsregistret/', name: 'Finansinspektionen — Regulations',
    summary: 'New capital adequacy requirements published for credit institutions. Effective date: 2026-06-01.',
    importance: 9, compliance_action: 'action_required', jurisdiction: 'SE', document_type: 'regulation',
    checked_at: new Date(Date.now() - 2 * 3600_000).toISOString(), reviewed_at: null, change_percent: 4.2,
  },
  {
    id: 2, url: 'https://www.transportstyrelsen.se/sv/vagtrafik/Fordon/', name: 'Transportstyrelsen — Vehicle Standards',
    summary: 'Updated guidance on electric vehicle type approval testing procedures.',
    importance: 6, compliance_action: 'review_recommended', jurisdiction: 'SE', document_type: 'guidance',
    checked_at: new Date(Date.now() - 8 * 3600_000).toISOString(), reviewed_at: null, change_percent: 2.1,
  },
  {
    id: 3, url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1234', name: 'EU DORA — Digital Operational Resilience',
    summary: 'Minor formatting update to article numbering in annex III. No substantive changes.',
    importance: 2, compliance_action: 'info_only', jurisdiction: 'EU', document_type: 'regulation',
    checked_at: new Date(Date.now() - 24 * 3600_000).toISOString(), reviewed_at: new Date(Date.now() - 20 * 3600_000).toISOString(), change_percent: 0.8,
  },
  {
    id: 4, url: 'https://www.datainspektionen.se/', name: 'IMY — Data Privacy Authority',
    summary: 'Published new consultation on cross-border data transfer assessment requirements under GDPR.',
    importance: 7, compliance_action: 'action_required', jurisdiction: 'SE', document_type: 'consultation',
    checked_at: new Date(Date.now() - 4 * 3600_000).toISOString(), reviewed_at: null, change_percent: 5.7,
  },
  {
    id: 5, url: 'https://www.riksbanken.se/sv/penningpolitik/', name: 'Riksbanken — Monetary Policy',
    summary: 'Policy rate decision announcement page updated with new rate: 3.25% (unchanged).',
    importance: 5, compliance_action: 'review_recommended', jurisdiction: 'SE', document_type: 'decision',
    checked_at: new Date(Date.now() - 12 * 3600_000).toISOString(), reviewed_at: null, change_percent: 1.9,
  },
  {
    id: 6, url: 'https://www.fsa.dk/', name: 'Danish FSA — Financial Supervision',
    summary: 'New anti-money laundering reporting guidelines for financial institutions published.',
    importance: 8, compliance_action: 'action_required', jurisdiction: 'DK', document_type: 'guidance',
    checked_at: new Date(Date.now() - 6 * 3600_000).toISOString(), reviewed_at: null, change_percent: 3.4,
  },
];

const mockSources = [
  { name: 'Finansinspektionen', url: 'fi.se', category: 'Finance & Banking', status: 'active', lastCheck: '2h ago' },
  { name: 'Transportstyrelsen', url: 'transportstyrelsen.se', category: 'Transport & Infrastructure', status: 'active', lastCheck: '2h ago' },
  { name: 'EU DORA', url: 'eur-lex.europa.eu', category: 'Finance & Banking', status: 'active', lastCheck: '2h ago' },
  { name: 'IMY', url: 'datainspektionen.se', category: 'Data & Privacy', status: 'active', lastCheck: '2h ago' },
  { name: 'Riksbanken', url: 'riksbanken.se', category: 'Finance & Banking', status: 'active', lastCheck: '2h ago' },
  { name: 'Danish FSA', url: 'fsa.dk', category: 'Finance & Banking', status: 'active', lastCheck: '2h ago' },
  { name: 'Norwegian FSA', url: 'finanstilsynet.no', category: 'Finance & Banking', status: 'active', lastCheck: '6h ago' },
  { name: 'EBA', url: 'eba.europa.eu', category: 'Finance & Banking', status: 'active', lastCheck: '6h ago' },
];

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    action_required: 'bg-red-50 text-red-700 border-red-200',
    review_recommended: 'bg-amber-50 text-amber-700 border-amber-200',
    info_only: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  const labels: Record<string, string> = {
    action_required: 'Action required',
    review_recommended: 'Review',
    info_only: 'Info',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[action] || ''}`}>
      {labels[action] || action}
    </span>
  );
}

export default function DemoPage() {
  const actionRequired = mockChanges.filter(c => c.compliance_action === 'action_required' && !c.reviewed_at).length;
  const reviewRecommended = mockChanges.filter(c => c.compliance_action === 'review_recommended' && !c.reviewed_at).length;
  const reviewed = mockChanges.filter(c => c.reviewed_at).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Demo banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2.5 px-4 text-sm font-medium">
        This is an interactive demo with sample data.{' '}
        <Link href="/login" className="underline font-semibold hover:text-blue-100">
          Sign up free
        </Link>{' '}
        to monitor your own regulatory sources.
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              change<span className="text-blue-600">brief</span>
            </h1>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700 ml-2">
              Demo
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1.5 text-sm font-medium text-white hover:from-blue-400 hover:to-indigo-400 transition-all"
          >
            Get started free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Stats */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600/70 font-medium">Action required</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{actionRequired}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <p className="text-xs text-amber-600/70 font-medium">Review</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{reviewRecommended}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
              <p className="text-xs text-emerald-600/70 font-medium">Reviewed (7d)</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{reviewed}</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">Last check</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">2h ago</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">Pages monitored</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{mockSources.length}<span className="text-sm font-normal text-slate-500">/25</span></p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">Changes (7d)</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{mockChanges.length}</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">Total checks (7d)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">48</p>
            </div>
          </div>
        </section>

        {/* Activity feed */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900/90 mb-1">Recent changes</h2>
          <p className="text-sm text-slate-500 mb-4">AI-powered summaries of regulatory changes, ranked by importance.</p>
          <div className="space-y-3">
            {mockChanges
              .sort((a, b) => b.importance - a.importance)
              .map((change) => (
              <div key={change.id} className="rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white ${
                        change.importance >= 7 ? 'bg-red-500' : change.importance >= 4 ? 'bg-amber-500' : 'bg-slate-400'
                      }`}>
                        {change.importance}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 truncate">{change.name}</span>
                      <ActionBadge action={change.compliance_action} />
                      {change.jurisdiction && (
                        <span className="text-xs text-slate-400 font-mono">[{change.jurisdiction}]</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{change.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{timeAgo(change.checked_at)}</span>
                      <span>{change.change_percent.toFixed(1)}% pixel diff</span>
                      {change.document_type && <span className="capitalize">{change.document_type}</span>}
                      {change.reviewed_at && <span className="text-emerald-600 font-medium">Reviewed</span>}
                    </div>
                  </div>
                  {!change.reviewed_at && (
                    <button
                      className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-default opacity-60"
                      title="Sign up to review changes"
                    >
                      Mark reviewed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mid-scroll conversion nudge */}
        <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Monitor your own sources in 60 seconds</p>
              <p className="text-xs text-blue-700/70 mt-0.5">Free — 3 sources, 7-day history, AI classification. No credit card.</p>
            </div>
          </div>
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-sm"
          >
            Start free
          </Link>
        </section>

        {/* Sources */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900/90 mb-1">Monitored sources</h2>
          <p className="text-sm text-slate-500 mb-4">Regulatory agencies being monitored every 6 hours.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockSources.map((source) => (
              <div key={source.url} className="rounded-xl bg-white border border-slate-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{source.name}</p>
                  <p className="text-xs text-slate-400">{source.url} · {source.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{source.lastCheck}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Ready to monitor your regulatory landscape?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Add your own sources. Get AI-powered change summaries. Stay compliant without manual checking.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-white text-blue-700 px-6 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              Start free — 3 sources included
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium hover:bg-white/10 transition-all"
            >
              Learn more
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
