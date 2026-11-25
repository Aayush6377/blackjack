export function AdminTicketsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/60">
      <div className="h-10 border-b border-neutral-800/80 bg-neutral-900/70" />
      <div className="divide-y divide-neutral-800/70 p-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="my-1.5 h-12 animate-pulse rounded-lg bg-neutral-900/80"
          />
        ))}
      </div>
    </div>
  );
}