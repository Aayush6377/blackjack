export function CouponsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70">
      <div className="border-b border-neutral-800 bg-neutral-900 px-5 py-3.5">
        <div className="h-4 w-48 animate-pulse rounded bg-neutral-800" />
      </div>
      <div className="divide-y divide-neutral-800/80">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
          >
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-52 animate-pulse rounded bg-neutral-800/70" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-800" />
              <div className="h-8 w-16 animate-pulse rounded-lg bg-neutral-800" />
              <div className="h-8 w-16 animate-pulse rounded-lg bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}