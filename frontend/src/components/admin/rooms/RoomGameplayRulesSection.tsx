export interface RoomGameplayRulesValue {
  minWallet: string;
  minBet: string;
  maxBet: string;
  decksPerShoe: string;
  reshuffleThresholdPercent: string;
  blackjackPayout: string;
  dealerHitsSoft17: boolean;
}

export interface RoomGameplayRulesSectionProps {
  value: RoomGameplayRulesValue;
  onChange: (next: RoomGameplayRulesValue) => void;
  disabled?: boolean;
}

const PAYOUT_OPTIONS = ["3:2", "6:5", "1:1"] as const;

export function RoomGameplayRulesSection({
  value,
  onChange,
  disabled = false,
}: RoomGameplayRulesSectionProps) {
  const update = <K extends keyof RoomGameplayRulesValue>(
    key: K,
    val: RoomGameplayRulesValue[K]
  ) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
          Table &amp; Shoe Rules
        </h2>
        <p className="mt-0.5 text-xs text-neutral-400">
          Bankroll requirements, betting limits, deck shoe settings, and
          payout odds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Minimum Wallet (Chips) *
          </label>
          <input
            type="number"
            min={0}
            required
            value={value.minWallet}
            onChange={(e) => update("minWallet", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Minimum Bet *
          </label>
          <input
            type="number"
            min={1}
            required
            value={value.minBet}
            onChange={(e) => update("minBet", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Maximum Bet *
          </label>
          <input
            type="number"
            min={1}
            required
            value={value.maxBet}
            onChange={(e) => update("maxBet", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Decks Per Shoe *
          </label>
          <input
            type="number"
            min={1}
            max={12}
            required
            value={value.decksPerShoe}
            onChange={(e) => update("decksPerShoe", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Reshuffle Threshold (1% – 99%) *
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={99}
              step={1}
              required
              value={value.reshuffleThresholdPercent}
              onChange={(e) => update("reshuffleThresholdPercent", e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 py-2 pr-8 pl-3.5 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-neutral-400">
              %
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Blackjack Payout *
          </label>
          <select
            value={value.blackjackPayout}
            onChange={(e) => update("blackjackPayout", e.target.value)}
            disabled={disabled}
            className="w-full cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          >
            {PAYOUT_OPTIONS.map((payout) => (
              <option key={payout} value={payout}>
                {payout}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-2.5">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Dealer Hits Soft 17
              </div>
              <div className="text-[11px] text-neutral-400">
                When enabled, the dealer draws on soft 17 (A + 6) instead of
                standing.
              </div>
            </div>
            <input
              type="checkbox"
              checked={value.dealerHitsSoft17}
              onChange={(e) => update("dealerHitsSoft17", e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 cursor-pointer accent-amber-400"
            />
          </label>
        </div>
      </div>
    </section>
  );
}