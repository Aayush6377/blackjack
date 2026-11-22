export function PlanSkeletonGrid() {
  return (
    <div
      aria-label="Loading chip plans"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-36 rounded-lg bg-neutral-800" />
              <div className="h-3.5 w-full max-w-[220px] rounded bg-neutral-800/80" />
            </div>
            <div className="h-6 w-16 rounded-full bg-neutral-800" />
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 space-y-2">
            <div className="h-6 w-28 rounded bg-neutral-800" />
            <div className="h-3 w-20 rounded bg-neutral-800/80" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="h-6 w-24 rounded bg-neutral-800" />
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded-lg bg-neutral-800" />
              <div className="h-8 w-16 rounded-lg bg-neutral-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}