export function RoomCardsSkeleton() {
  return (
    <div
      aria-label="Loading game rooms"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse overflow-hidden rounded-2xl border border-neutral-800/90 bg-neutral-900/75"
        >
          <div className="h-36 w-full bg-neutral-800/90" />
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-neutral-800" />
                <div className="h-3.5 w-28 rounded bg-neutral-800/80" />
              </div>
              <div className="h-6 w-16 rounded-full bg-neutral-800" />
            </div>

            <div className="h-9 w-full rounded bg-neutral-800/70" />

            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-14 rounded-xl bg-neutral-950/70" />
              <div className="h-14 rounded-xl bg-neutral-950/70" />
              <div className="h-14 rounded-xl bg-neutral-950/70" />
              <div className="h-14 rounded-xl bg-neutral-950/70" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <div className="h-9 w-20 rounded-xl bg-neutral-800" />
              <div className="h-9 w-20 rounded-xl bg-neutral-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}