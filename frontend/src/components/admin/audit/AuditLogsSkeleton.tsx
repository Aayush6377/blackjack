export function AuditLogsSkeleton() {
  return (
    <div
      aria-label="Loading audit logs"
      className="space-y-3 rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-4"
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="flex animate-pulse flex-col gap-3 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <div className="h-5 w-44 rounded-full bg-neutral-800" />
            <div className="h-3.5 w-64 rounded bg-neutral-800/80" />
          </div>
          <div className="flex items-center justify-between gap-4 md:justify-end">
            <div className="h-4 w-32 rounded bg-neutral-800" />
            <div className="h-8 w-8 rounded-lg bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}