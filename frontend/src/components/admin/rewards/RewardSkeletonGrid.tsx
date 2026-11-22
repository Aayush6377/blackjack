export function RewardSkeletonGrid() {
  return (
    <div
      aria-label="Loading daily reward configurations"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 7 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="h-5 w-20 rounded-lg bg-neutral-800" />
            <div className="h-6 w-16 rounded-full bg-neutral-800" />
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 space-y-2">
            <div className="h-6 w-28 rounded bg-neutral-800" />
            <div className="h-3 w-24 rounded bg-neutral-800/80" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <div className="h-8 w-16 rounded-lg bg-neutral-800" />
            <div className="h-8 w-16 rounded-lg bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}