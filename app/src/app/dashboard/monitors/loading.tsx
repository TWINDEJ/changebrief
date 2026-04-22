import { GridSkeleton } from '../skeleton';

export default function MonitorsLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      <section>
        <div className="h-5 w-36 rounded mb-3" style={{ background: 'var(--app-bg-muted)' }} />
        <div className="rounded-xl glass-card p-4 mb-4">
          <div className="h-10 rounded-lg" style={{ background: 'var(--app-bg-secondary)' }} />
        </div>
        <GridSkeleton items={4} />
      </section>
      <section>
        <div className="h-5 w-24 rounded mb-3" style={{ background: 'var(--app-bg-muted)' }} />
        <GridSkeleton items={6} />
      </section>
    </div>
  );
}
