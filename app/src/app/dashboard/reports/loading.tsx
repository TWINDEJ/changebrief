export default function ReportsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-64 rounded mb-2" style={{ background: 'var(--app-bg-muted)' }} />
        <div className="h-4 w-96 rounded" style={{ background: 'var(--app-bg-muted)' }} />
      </div>
      <div className="rounded-xl h-28" style={{ background: 'var(--app-bg-card)', borderLeft: '4px solid var(--app-bg-muted)' }} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl h-24" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }} />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-xl h-96" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }} />
        </div>
      </div>
    </div>
  );
}
