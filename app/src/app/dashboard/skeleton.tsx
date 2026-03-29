'use client';

function Bone({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl glass-card px-4 py-3 animate-fade-in">
          <Bone className="h-3 w-16 mb-3" />
          <Bone className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}

export function FeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {[...Array(4)].map((_, i) => (
          <Bone key={i} className="h-7 w-20" />
        ))}
      </div>
      <div className="rounded-xl glass-card overflow-hidden divide-y divide-slate-100">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3" style={{ animationDelay: `${i * 80}ms` }}>
            <Bone className="h-3 w-24 shrink-0" />
            <Bone className="h-2 w-2 !rounded-full shrink-0" />
            <Bone className="h-3 w-28 shrink-0" />
            <Bone className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="rounded-xl glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Bone className="h-2.5 w-2.5 !rounded-full" />
            <Bone className="h-4 w-32" />
          </div>
          <Bone className="h-3 w-48 mb-2" />
          <Bone className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
