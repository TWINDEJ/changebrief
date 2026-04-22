import { FeedSkeleton } from '../skeleton';

export default function ActivityLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      <section>
        <div className="h-5 w-24 rounded mb-1" style={{ background: 'var(--app-bg-muted)' }} />
        <div className="h-3 w-56 rounded mb-4" style={{ background: 'var(--app-bg-muted)' }} />
        <FeedSkeleton rows={5} />
      </section>
    </div>
  );
}
