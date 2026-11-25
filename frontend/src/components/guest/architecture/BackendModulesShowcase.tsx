interface ModuleInfo {
  pkg: string;
  role: string;
}

const BACKEND_MODULES: ModuleInfo[] = [
  {
    pkg: "game",
    role: "Core Blackjack engine: shoe shuffling, card dealing, player actions (hit, stand, double, split, surrender, insurance), hand evaluation, and round settlement.",
  },
  {
    pkg: "room",
    role: "Manages table rooms, betting limits, dealer rules (Soft 17 / payouts), player seats, and room progress.",
  },
  {
    pkg: "wallet",
    role: "Handles user chip balances and immutable chip transaction history across bets, payouts, rewards, and pack credits.",
  },
  {
    pkg: "auth & security",
    role: "JWT authentication, OAuth2 login, OTP verification, refresh tokens, role-based access control, and security filters.",
  },
  {
    pkg: "user",
    role: "User accounts, profile updates, avatar management, OTP password/account deletion flows, and post-deletion cleanup events.",
  },
  {
    pkg: "plan, payment & coupon",
    role: "Chip pack catalog, payment attempts/checkout verification, promo coupon validation, and redemption tracking.",
  },
  {
    pkg: "reward & replay",
    role: "Daily streak reward configurations/claims and persisted round/hand history for reviewing past games.",
  },
  {
    pkg: "support, admin & analytics",
    role: "User support tickets with admin resolution workflows, admin management endpoints, audit logs, and platform metrics.",
  },
  {
    pkg: "config, common.dto, exception, media & notification",
    role: "Redis & WebSocket/STOMP configuration, shared pagination/response DTOs, global exception handling, image storage, and notifications.",
  },
];

export function BackendModulesShowcase() {
  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/30 sm:p-6">
      <div className="mb-5 border-b border-neutral-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
          Inside the Backend Box · com.aayush.blackjack
        </div>
        <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
          Modular Monolith Services &amp; Responsibilities
        </h2>
        <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
          Instead of splitting into a multi-service network, all domain modules
          live inside one Spring Boot 4.1.2 codebase with clear package
          boundaries and shared relational data in PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {BACKEND_MODULES.map((mod) => (
          <div
            key={mod.pkg}
            className="rounded-xl border border-neutral-800/90 bg-neutral-950/80 p-4"
          >
            <div className="font-mono text-xs font-bold text-emerald-300">
              {mod.pkg}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-300">
              {mod.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}