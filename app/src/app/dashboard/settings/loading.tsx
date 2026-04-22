export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-32 rounded" style={{ background: 'var(--app-bg-muted)' }} />
      <div className="rounded-xl h-96" style={{ background: 'var(--app-bg-card)', border: '1px solid var(--app-border)' }} />
    </div>
  );
}
