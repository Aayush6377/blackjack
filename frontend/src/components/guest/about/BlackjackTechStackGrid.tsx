const STACK_ITEMS = [
  { label: "Backend Framework", value: "Spring Boot 4.1.2" },
  { label: "Frontend Client", value: "React & Vite" },
  { label: "Primary Database", value: "PostgreSQL" },
  { label: "Caching & State", value: "Redis Cache" },
  { label: "Realtime Messaging", value: "WebSocket & STOMP" },
  { label: "Schema Migrations", value: "Flyway" },
];

export function BlackjackTechStackGrid() {
  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-6 shadow-xl shadow-black/30 sm:p-7">
      <div className="mb-5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
          Technology Ecosystem
        </div>
        <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
          Built With — Blackjack Royale Stack
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {STACK_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800/90 bg-neutral-950/85 px-4 py-3.5"
          >
            <span className="text-xs font-medium text-neutral-400 sm:text-sm">
              {item.label}
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-300 sm:text-sm">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}