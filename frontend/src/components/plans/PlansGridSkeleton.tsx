export function PlansGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-[22rem] animate-pulse flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded-full bg-zinc-800" />
              <div className="h-6 w-16 rounded-full bg-zinc-800" />
            </div>
            <div className="mt-4 h-6 w-40 rounded-lg bg-zinc-800" />
            <div className="mt-2 h-9 w-full rounded-lg bg-zinc-800/70" />
            <div className="mt-4 h-28 w-full rounded-xl bg-zinc-950/80" />
          </div>
          <div>
            <div className="mb-3 h-7 w-24 rounded-lg bg-zinc-800" />
            <div className="h-10 w-full rounded-xl bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}