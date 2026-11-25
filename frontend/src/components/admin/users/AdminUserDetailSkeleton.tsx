export function AdminUserDetailSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-neutral-800" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-800" />
            <div className="h-4 w-64 animate-pulse rounded bg-neutral-800/70" />
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <div className="h-16 animate-pulse rounded-xl bg-neutral-800/60" />
              <div className="h-16 animate-pulse rounded-xl bg-neutral-800/60" />
              <div className="h-16 animate-pulse rounded-xl bg-neutral-800/60" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800/90 bg-neutral-950/90">
        <div className="border-b border-neutral-800 bg-neutral-900/70 px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded bg-neutral-800" />
        </div>
        <div className="divide-y divide-neutral-800/75">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between px-5 py-4">
              <div className="h-4 w-44 animate-pulse rounded bg-neutral-800" />
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-800/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}