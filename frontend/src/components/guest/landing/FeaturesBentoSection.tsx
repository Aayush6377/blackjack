import { motion, useReducedMotion } from "motion/react";
import {
  Flame,
  History,
  Layers,
  LifeBuoy,
  Sparkles,
  TicketPercent,
  Wallet,
} from "lucide-react";
import { ChipTokenIcon } from "../../ui/ChipTokenIcon";

export function FeaturesBentoSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section Heading */}
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Built Like a Real Lounge, Tuned for Speed
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-neutral-400 sm:text-sm">
          Every feature—from chip ledger balances and daily streaks to round
          replays and support tickets—works together seamlessly.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* Card 1: Live Rooms & Table Actions (Large Left Card) */}
        <motion.article
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-emerald-950/55 via-neutral-900/90 to-neutral-950 p-6 shadow-xl shadow-black/50 md:col-span-7 sm:p-7"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-300">
              <Layers className="h-3.5 w-3.5" />
              <span>LIVE ROOMS &amp; FULL RULESET</span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-white sm:text-2xl">
              Custom Stakes, Soft/Hard Aces, Splits &amp; Surrender
            </h3>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-neutral-300 sm:text-sm">
              Pick rooms tailored to your bankroll with clear table limits,
              real-time STOMP updates, natural 3:2 blackjacks, pair splitting,
              double downs, insurance, and surrender options.
            </p>
          </div>

          {/* Floating Card Fan Strip */}
          <div className="mt-6 flex items-end justify-between gap-4 border-t border-neutral-800/80 pt-5">
            <div className="flex items-center -space-x-4">
              <motion.img
                src="/cards/AH.png"
                alt="Ace of Hearts"
                whileHover={prefersReducedMotion ? undefined : { y: -8, rotate: -10 }}
                className="h-24 w-16 -rotate-6 rounded-xl border border-amber-400/40 object-cover shadow-lg shadow-black/70 transition sm:h-28 sm:w-20"
              />
              <motion.img
                src="/cards/KH.png"
                alt="King of Hearts"
                whileHover={prefersReducedMotion ? undefined : { y: -8, rotate: 0 }}
                className="h-24 w-16 rounded-xl border border-amber-400/40 object-cover shadow-lg shadow-black/70 transition sm:h-28 sm:w-20"
              />
              <motion.img
                src="/cards/QS.png"
                alt="Queen of Spades"
                whileHover={prefersReducedMotion ? undefined : { y: -8, rotate: 10 }}
                className="h-24 w-16 rotate-6 rounded-xl border border-emerald-400/40 object-cover shadow-lg shadow-black/70 transition sm:h-28 sm:w-20"
              />
            </div>

            <div className="text-right">
              <div className="font-mono text-xs font-bold text-amber-300">
                STOMP + REST
              </div>
              <div className="mt-0.5 text-[11px] text-neutral-400">
                Low-latency table sync
              </div>
            </div>
          </div>
        </motion.article>

        {/* Card 2: Chip Wallet & Daily Streaks (Right Top Card) */}
        <motion.article
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex flex-col justify-between rounded-3xl border border-neutral-800/90 bg-neutral-900/80 p-6 shadow-xl shadow-black/45 md:col-span-5 sm:p-7"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold text-amber-300">
                <Wallet className="h-3.5 w-3.5" />
                <span>WALLET &amp; STREAKS</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-lg border border-orange-400/30 bg-orange-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-orange-300">
                <Flame className="h-3.5 w-3.5" />
                <span>DAILY BONUS</span>
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-white">
              Transparent Chip Ledger &amp; Daily Rewards
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400 sm:text-sm">
              Track every bet, payout, streak claim, and chip pack credit with
              clear post-transaction balances and build daily login streaks for
              extra chips.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <ChipTokenIcon className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Streak Day Reward
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">
              +FREE CHIPS
            </span>
          </div>
        </motion.article>

        {/* Card 3: Round Replays */}
        <motion.article
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="rounded-3xl border border-neutral-800/90 bg-neutral-900/80 p-6 shadow-xl shadow-black/40 md:col-span-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-300">
            <History className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Round Replays &amp; History
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 sm:text-sm">
            Revisit completed rounds, inspect dealt cards and hand outcomes, and
            review how each decision played out against the dealer.
          </p>
        </motion.article>

        {/* Card 4: Packs & Promo Coupons */}
        <motion.article
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="rounded-3xl border border-neutral-800/90 bg-neutral-900/80 p-6 shadow-xl shadow-black/40 md:col-span-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <TicketPercent className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Chip Packs &amp; Coupons
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 sm:text-sm">
            Top up your virtual chip stack with curated packs, bonus chips, and
            eligible promo coupons with verified checkout settlement.
          </p>
        </motion.article>

        {/* Card 5: Dedicated Support Center */}
        <motion.article
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-3xl border border-neutral-800/90 bg-neutral-900/80 p-6 shadow-xl shadow-black/40 md:col-span-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Built-In Support Tickets
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 sm:text-sm">
            Need help with a chip credit, account issue, or table question?
            Open a support ticket directly from your dashboard and track replies.
          </p>
        </motion.article>
      </div>
    </section>
  );
}