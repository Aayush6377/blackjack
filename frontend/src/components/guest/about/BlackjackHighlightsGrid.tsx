import { Cpu, Radio, ShieldCheck } from "lucide-react";

const HIGHLIGHTS = [
  {
    title: "Server-Authoritative Game Engine",
    description:
      "Shoe management, hit/stand/double/split/surrender moves, hand valuation, and round settlements execute on the backend so game rules and payouts cannot be spoofed.",
    icon: Cpu,
  },
  {
    title: "Real-Time WebSocket & STOMP Sync",
    description:
      "Live room events, table actions, and hand updates stream smoothly over WebSocket and STOMP channels while keeping state consistent across reloads and replays.",
    icon: Radio,
  },
  {
    title: "Wallet, Audit & Support Integrity",
    description:
      "Chip transactions, daily streaks, coupon redemptions, admin audit logs, and support ticket workflows are structured around transactional consistency and clean cleanup.",
    icon: ShieldCheck,
  },
];

export function BlackjackHighlightsGrid() {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {HIGHLIGHTS.map(({ title, description, icon: Icon }) => (
        <div
          key={title}
          className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/25 sm:p-6"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white sm:text-lg">{title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400 sm:text-sm">
            {description}
          </p>
        </div>
      ))}
    </section>
  );
}