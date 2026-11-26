import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChipTokenIcon } from "../../ui/ChipTokenIcon";

export function LandingHeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Left Copy & CTAs */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-sm shadow-black/40">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Blackjack Royale · Live High-Stakes Tables</span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Step Up to the Table.{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              Beat the Dealer to 21.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base lg:text-lg">
            Experience server-authoritative Blackjack with real-time WebSocket
            table sync, split hands, double downs, daily chip streaks, and
            frame-by-frame round replays—engineered for instant, fair play.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-neutral-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <span>Start Playing Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/rules"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-5 py-3.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Game Rules</span>
            </Link>
          </div>

          {/* Trust & Tech Highlights Strip */}
          <div className="mt-9 grid grid-cols-1 gap-3 border-t border-neutral-800/80 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 text-xs text-neutral-300">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Fair Server Shoe</div>
                <div className="text-[11px] text-neutral-400">
                  100% backend-verified deals
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-neutral-300">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
                <Radio className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Live STOMP Sync</div>
                <div className="text-[11px] text-neutral-400">
                  Instant moves &amp; table state
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-neutral-300">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300">
                <ChipTokenIcon className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Daily Chip Streaks</div>
                <div className="text-[11px] text-neutral-400">
                  Free bonus chips every day
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Floating Card Showcase */}
        <div className="relative flex items-center justify-center lg:col-span-5">
          {/* Ambient Emerald + Gold Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl sm:h-80 sm:w-80"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 right-8 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl"
          />

          {/* Floating Felt Card Stage */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.94, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl border border-amber-400/25 bg-gradient-to-b from-emerald-950/65 via-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl shadow-black/75 backdrop-blur-sm sm:p-7"
          >
            {/* Top Status Pill */}
            <div className="flex items-center justify-between border-b border-neutral-800/90 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                  Natural Blackjack · 21
                </span>
              </div>
              <span className="rounded-lg border border-amber-400/35 bg-amber-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
                3 : 2 PAYOUT
              </span>
            </div>

            {/* Fanned Floating Cards */}
            <div className="relative my-7 flex h-52 items-center justify-center sm:h-56">
              {/* Background Left Accent Card */}
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -7, 0], rotate: [-19, -17, -19] }
                }
                transition={{
                  duration: 5.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-4 h-36 w-24 -rotate-[18deg] overflow-hidden rounded-xl border border-neutral-700/80 bg-neutral-900 opacity-55 shadow-xl sm:left-6 sm:h-40 sm:w-28"
              >
                <img
                  src="/cards/7D.png"
                  alt="Seven of Diamonds"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Background Right Accent Card */}
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, 8, 0], rotate: [19, 17, 19] }
                }
                transition={{
                  duration: 5.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-4 h-36 w-24 rotate-[18deg] overflow-hidden rounded-xl border border-neutral-700/80 bg-neutral-900 opacity-55 shadow-xl sm:right-6 sm:h-40 sm:w-28"
              >
                <img
                  src="/cards/10C.png"
                  alt="Ten of Clubs"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Foreground Ace of Spades */}
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -10, 0], rotate: [-7, -5, -7] }
                }
                transition={{
                  duration: 4.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={prefersReducedMotion ? undefined : { y: -16, scale: 1.04 }}
                className="relative z-10 -mr-4 h-44 w-30 -rotate-6 overflow-hidden rounded-2xl border-2 border-amber-400/55 bg-neutral-900 shadow-2xl shadow-black/80 sm:h-48 sm:w-32"
              >
                <img
                  src="/cards/AS.png"
                  alt="Ace of Spades"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Foreground King of Spades */}
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -6, 0], rotate: [7, 9, 7] }
                }
                transition={{
                  duration: 4.8,
                  delay: 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={prefersReducedMotion ? undefined : { y: -16, scale: 1.04 }}
                className="relative z-20 -ml-4 h-44 w-30 rotate-6 overflow-hidden rounded-2xl border-2 border-emerald-400/55 bg-neutral-900 shadow-2xl shadow-black/80 sm:h-48 sm:w-32"
              >
                <img
                  src="/cards/KS.png"
                  alt="King of Spades"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>

            {/* Bottom Floating Chip Settlement Pill */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center justify-between rounded-2xl border border-amber-400/30 bg-neutral-950/90 px-4 py-3 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <ChipTokenIcon className="h-5 w-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">
                    Hand Value: 21 (Soft Ace)
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Instant ledger settlement
                  </div>
                </div>
              </div>
              <span className="font-mono text-sm font-extrabold text-emerald-400">
                +2,500
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}