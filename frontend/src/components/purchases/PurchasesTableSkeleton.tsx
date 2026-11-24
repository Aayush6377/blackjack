export function PurchasesTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/75">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="divide-y divide-zinc-800/80">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
          >
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
              <div className="h-3 w-48 animate-pulse rounded bg-zinc-800/70" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}