const STEPS = [
  {
    step: "01",
    title: "Client Request & Auth Filter",
    detail:
      "React + Vite sends REST calls with a Bearer token (or connects over WebSocket/STOMP). Spring Security validates JWT claims, token version, and role permissions.",
  },
  {
    step: "02",
    title: "Cache Check & Service Logic",
    detail:
      "Domain services check Redis Cache for eligible cached data (such as plans or user profiles) before hitting PostgreSQL, keeping hot reads fast.",
  },
  {
    step: "03",
    title: "Transactional State & Settlement",
    detail:
      "Game moves, chip wallet adjustments, coupon/reward claims, payments, and support tickets run inside Spring @Transactional boundaries against PostgreSQL.",
  },
  {
    step: "04",
    title: "Real-Time Sync & Standardized DTOs",
    detail:
      "Table events broadcast over STOMP topics to connected players, while REST responses return clean DTOs or structured error payloads.",
  },
];

export function RequestLifecycleSteps() {
  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/30 sm:p-6">
      <div className="mb-4 border-b border-neutral-800/80 pb-3.5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
          Request Flow
        </div>
        <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
          How a Request Travels Through the System
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item) => (
          <div
            key={item.step}
            className="rounded-xl border border-neutral-800 bg-neutral-950/75 p-4"
          >
            <div className="font-mono text-xs font-bold text-amber-400">
              STEP {item.step}
            </div>
            <h3 className="mt-1.5 text-sm font-bold text-white">
              {item.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}