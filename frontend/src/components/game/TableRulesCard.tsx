import type { RoomRules } from "../../types/room";
import { ChipAmount } from "../ui/ChipAmount";

interface TableRulesCardProps {
  slug: string;
  rules: RoomRules;
}

export function TableRulesCard({ slug, rules }: TableRulesCardProps) {
  return (
    <div className="hidden rounded-2xl border border-amber-400/20 bg-zinc-950/85 p-4 text-xs text-zinc-300 shadow-lg lg:block">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wider text-amber-300">
          Table Rules
        </span>
        <span className="font-mono text-[11px] text-zinc-400">{slug}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 px-2.5 py-1.5">
          <span className="text-zinc-400">Blackjack</span>
          <div className="font-semibold text-emerald-300">{rules.blackjackPayout}</div>
        </div>
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 px-2.5 py-1.5">
          <span className="text-zinc-400">Shoe</span>
          <div className="font-semibold text-white">{rules.decksPerShoe} Decks</div>
        </div>
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 px-2.5 py-1.5">
          <span className="text-zinc-400">Dealer</span>
          <div className="font-semibold text-white">
            {rules.dealerHitsSoft17 ? "Hits Soft 17" : "Stands 17"}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 px-2.5 py-1.5">
          <span className="text-zinc-400">Min Wallet</span>
          <div className="mt-0.5 font-semibold text-amber-300">
            <ChipAmount
              amount={rules.minWallet}
              suffix=""
              iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}