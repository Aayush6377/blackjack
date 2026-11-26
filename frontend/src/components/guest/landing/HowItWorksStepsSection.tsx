import { motion, useReducedMotion } from "motion/react";
import { Compass, Flame, PlayCircle, UserPlus } from "lucide-react";

interface StepItem {
  number: string;
  tag: string;
  title: string;
  description: string;
  cardCode: string;
  cardAlt: string;
  icon: typeof UserPlus;
  accent: "amber" | "emerald" | "sky";
}

const STEPS: StepItem[] = [
  {
    number: "01",
    tag: "Account & Bankroll",
    title: "Sign Up & Claim Daily Streak Chips",
    description:
      "Create your player profile in seconds, collect your daily streak reward chips, or top up your stack with curated chip packs and promo coupons.",
    cardCode: "AD",
    cardAlt: "Ace of Diamonds",
    icon: UserPlus,
    accent: "amber",
  },
  {
    number: "02",
    tag: "Table Selection",
    title: "Choose a Room & Lock Your Wager",
    description:
      "Browse open rooms with transparent min/max bets, Soft 17 rules, and payout ratios. Place your chip bet and receive your two-card deal.",
    cardCode: "JC",
    cardAlt: "Jack of Clubs",
    icon: Flame,
    accent: "emerald",
  },
  {
    number: "03",
    tag: "Live Play & Replay",
    title: "Outplay the Dealer & Review Replays",
    description:
      "Hit, stand, double down, split pairs, or surrender over real-time STOMP sync—then revisit any settled round frame-by-frame in Replays.",
    cardCode: "KS",
    cardAlt: "King of Spades",
    icon: PlayCircle,
    accent: "sky",
  },
];

const ACCENT_MAP = {
  amber: {
    pill: "border-amber-400/30 bg-amber-500/10 text-amber-300",
    iconBox: "border-amber-400/35 bg-amber-500/15 text-amber-300",
    cardBorder: "border-amber-400/40",
  },
  emerald: {
    pill: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    iconBox: "border-emerald-400/35 bg-emerald-500/15 text-emerald-300",
    cardBorder: "border-emerald-400/40",
  },
  sky: {
    pill: "border-sky-400/30 bg-sky-500/10 text-sky-300",
    iconBox: "border-sky-400/35 bg-sky-500/15 text-sky-300",
    cardBorder: "border-sky-400/40",
  },
};

export function HowItWorksStepsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section Header */}
      <div className="mb-10 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Compass className="h-3.5 w-3.5" />
            <span>Getting Started</span>
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            From Lobby to Live Hand in Three Steps
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-neutral-400 sm:text-sm">
          No complex setup—jump straight into a room, manage your virtual chip
          stack, and track every hand you play.
        </p>
      </div>

      {/* 3-Step Cards Grid */}
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Subtle horizontal connector line on desktop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-14 right-16 left-16 hidden h-px bg-gradient-to-r from-amber-500/30 via-emerald-500/30 to-sky-500/30 lg:block"
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const styles = ACCENT_MAP[step.accent];

          return (
            <motion.article
              key={step.number}
              initial={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.38, delay: idx * 0.1 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-neutral-800/90 bg-neutral-900/80 p-6 shadow-xl shadow-black/45 transition hover:border-neutral-700 sm:p-7"
            >
              <div>
                {/* Top Row: Step Number + Tag + Mini Card */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-mono text-sm font-extrabold shadow-md ${styles.iconBox}`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${styles.pill}`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{step.tag}</span>
                      </span>
                    </div>
                  </div>

                  {/* Floating Mini Playing Card */}
                  <motion.div
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -6, rotate: 6, scale: 1.06 }
                    }
                    className={`h-20 w-14 shrink-0 rotate-3 overflow-hidden rounded-xl border bg-neutral-950 shadow-lg shadow-black/75 transition ${styles.cardBorder}`}
                  >
                    <img
                      src={`/cards/${step.cardCode}.png`}
                      alt={step.cardAlt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                </div>

                {/* Title & Description */}
                <h3 className="mt-5 text-lg font-bold text-white sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400 sm:text-sm">
                  {step.description}
                </p>
              </div>

              {/* Bottom Step Progress Bar */}
              <div className="mt-6 flex items-center justify-between border-t border-neutral-800/80 pt-3.5 font-mono text-[11px] text-neutral-500">
                <span>PHASE {step.number} OF 03</span>
                <span className="text-neutral-400 transition group-hover:text-amber-300">
                  Blackjack Royale
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}