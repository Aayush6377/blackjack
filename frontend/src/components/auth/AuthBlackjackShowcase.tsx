import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export interface AuthBlackjackShowcaseProps {
  headline?: string;
  subcopy?: string;
  className?: string;
}

interface TableCallout {
  id: string;
  badge: string;
  title: string;
  detail: string;
  suit: string;
  isRed?: boolean;
}

const CALLOUTS: TableCallout[] = [
  {
    id: "natural-21",
    badge: "3:2 PAYOUT",
    title: "Natural Blackjack",
    detail: "Ace + Ten-value card locks an instant 21 on the deal.",
    suit: "♠",
  },
  {
    id: "split-double",
    badge: "TACTICAL PLAY",
    title: "Double Down & Split",
    detail: "Press your advantage on strong totals or pair hands.",
    suit: "♥",
    isRed: true,
  },
  {
    id: "real-time",
    badge: "MULTIPLAYER",
    title: "High-Stakes Tables",
    detail: "Take your seat, stack your chips, and beat the dealer.",
    suit: "♦",
    isRed: true,
  },
];

const SHUFFLE_CARDS = [0, 1, 2, 3, 4];

export function AuthBlackjackShowcase({
  headline = "Every hand is a new edge.",
  subcopy = "Step onto the felt, stack your chips, and chase 21.",
  className = "",
}: AuthBlackjackShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dealCycle, setDealCycle] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CALLOUTS.length);
      setDealCycle((prev) => prev + 1);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const currentCallout = CALLOUTS[activeIndex];

  return (
    <aside
      aria-label="Blackjack table showcase"
      className={`relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-amber-500/15 bg-neutral-950 p-10 xl:p-12 select-none ${className}`}
    >
      {/* Ambient Felt & Gold Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[460px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-900/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 right-8 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
      />

      {/* Decorative Casino Felt Table Arcs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-8 bottom-36 rounded-[48px] border border-emerald-500/15 bg-gradient-to-b from-emerald-950/35 via-emerald-950/15 to-transparent shadow-[inset_0_0_80px_rgba(6,78,59,0.28)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-12 top-14 bottom-44 rounded-[40px] border border-amber-400/10"
      />

      <div className="relative z-10 flex items-start justify-between pt-2 px-4">
        <div className="flex flex-col items-start gap-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
            Dealer Stands on 17
          </span>

          <div className="relative flex h-24 w-32 items-center">
            {/* Dealer Upcard: 10 of Clubs */}
            <motion.div
              aria-hidden="true"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { y: [0, -3, 0], rotate: [-8, -6, -8] }
              }
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-24 w-16 flex-col justify-between rounded-xl border border-amber-300/40 bg-stone-100 p-2 text-neutral-900 shadow-xl shadow-black/75"
            >
              <span className="text-xs font-black leading-none">10</span>
              <span className="self-center text-xl leading-none">♣</span>
              <span className="self-end rotate-180 text-xs font-black leading-none">
                10
              </span>
            </motion.div>

            {/* Dealer Hole Card (Face Down) */}
            <motion.div
              aria-hidden="true"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { y: [0, -4, 0], rotate: [7, 9, 7] }
              }
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              className="-ml-5 flex h-24 w-16 items-center justify-center rounded-xl border border-amber-500/45 bg-neutral-900 p-1.5 shadow-xl shadow-black/80"
            >
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-amber-400/35 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.14),transparent_70%)]">
                <span className="text-sm text-amber-400/70">♠</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Continuous Riffle / Cascade Shuffling Deck (Right) */}
        <div className="flex flex-col items-end gap-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-amber-400/70 uppercase">
            Auto-Shuffle
          </span>

          <div className="relative h-24 w-28 flex items-center justify-center">
            {SHUFFLE_CARDS.map((index) => {
              const isLeftHalf = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  aria-hidden="true"
                  style={{ zIndex: index }}
                  animate={
                    prefersReducedMotion
                      ? { x: index * 1.5, y: -index * 1.5, rotate: index * 2 - 4 }
                      : {
                          x: [
                            index * 1.5,
                            isLeftHalf ? -22 : 22,
                            index * 1.5,
                          ],
                          y: [
                            -index * 1.5,
                            -10 - index * 2,
                            -index * 1.5,
                          ],
                          rotate: [
                            index * 2 - 4,
                            isLeftHalf ? -16 : 16,
                            index * 2 - 4,
                          ],
                        }
                  }
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 1.1,
                    delay: index * 0.08,
                    ease: "easeInOut",
                  }}
                  className="absolute flex h-22 w-15 items-center justify-center rounded-xl border border-amber-400/45 bg-neutral-900 p-1 shadow-lg shadow-black/80"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-lg border border-amber-500/25 bg-emerald-950/60">
                    <span className="text-xs font-bold text-amber-300/80">
                      21
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center Table Etching + Hero Player Hand + Chip Stacks */}
      <div className="relative z-10 my-auto flex flex-col items-center py-4">
        <div className="mb-5 text-center">
          <p className="font-mono text-xs font-bold tracking-[0.32em] text-amber-400/45 uppercase">
            BLACKJACK PAYS 3 TO 2
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-emerald-400/40 uppercase">
            INSURANCE PAYS 2 TO 1
          </p>
        </div>

        {/* Main Betting Circle & Fanned Player Hand */}
        <div className="relative flex h-64 w-full max-w-md items-center justify-center">
          {/* Glowing Gold Betting Ring */}
          <motion.div
            aria-hidden="true"
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.04, 1], opacity: [0.45, 0.8, 0.45] }
            }
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-52 w-52 rounded-full border-2 border-dashed border-amber-400/25 bg-emerald-950/45 shadow-[0_0_50px_rgba(16,185,129,0.16)]"
          />

          {/* Left Card: Ace of Spades */}
          <motion.div
            key={`player-ace-${dealCycle}`}
            aria-hidden="true"
            initial={
              prefersReducedMotion
                ? { x: -68, y: 10, rotate: -18, opacity: 1 }
                : { x: 130, y: -130, rotate: 28, opacity: 0, scale: 0.85 }
            }
            animate={
              prefersReducedMotion
                ? { x: -68, y: 10, rotate: -18, opacity: 1 }
                : {
                    x: -68,
                    y: [10, 4, 10],
                    rotate: -18,
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={{
              x: { type: "spring", stiffness: 200, damping: 20 },
              rotate: { type: "spring", stiffness: 200, damping: 20 },
              opacity: { duration: 0.25 },
              scale: { type: "spring", stiffness: 200, damping: 20 },
              y: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
            }}
            className="absolute z-10 flex h-40 w-27 flex-col justify-between rounded-2xl border border-amber-400/50 bg-neutral-900 p-3 shadow-2xl shadow-black/85"
          >
            <div className="flex items-center justify-between text-amber-300">
              <span className="text-lg font-black leading-none">A</span>
              <span className="text-base leading-none text-amber-400">♠</span>
            </div>

            <span className="self-center text-4xl leading-none text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              ♠
            </span>

            <div className="flex items-center justify-between rotate-180 text-amber-300">
              <span className="text-lg font-black leading-none">A</span>
              <span className="text-base leading-none text-amber-400">♠</span>
            </div>
          </motion.div>

          {/* Center Card: Queen of Diamonds */}
          <motion.div
            key={`player-queen-${dealCycle}`}
            aria-hidden="true"
            initial={
              prefersReducedMotion
                ? { x: 0, y: -6, rotate: 0, opacity: 1 }
                : { x: 145, y: -125, rotate: 32, opacity: 0, scale: 0.85 }
            }
            animate={
              prefersReducedMotion
                ? { x: 0, y: -6, rotate: 0, opacity: 1 }
                : {
                    x: 0,
                    y: [-6, -12, -6],
                    rotate: 0,
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={{
              x: { type: "spring", stiffness: 200, damping: 20, delay: 0.1 },
              rotate: { type: "spring", stiffness: 200, damping: 20, delay: 0.1 },
              opacity: { duration: 0.25, delay: 0.1 },
              scale: { type: "spring", stiffness: 200, damping: 20, delay: 0.1 },
              y: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            }}
            className="relative z-20 flex h-40 w-27 flex-col justify-between rounded-2xl border border-amber-300/60 bg-stone-100 p-3 text-neutral-900 shadow-2xl shadow-black/85"
          >
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-lg font-black leading-none">Q</span>
              <span className="text-base leading-none">♦</span>
            </div>

            <span className="self-center text-4xl leading-none text-rose-600">
              ♦
            </span>

            <div className="flex items-center justify-between rotate-180 text-rose-600">
              <span className="text-lg font-black leading-none">Q</span>
              <span className="text-base leading-none">♦</span>
            </div>
          </motion.div>

          {/* Right Card: King of Hearts */}
          <motion.div
            key={`player-king-${dealCycle}`}
            aria-hidden="true"
            initial={
              prefersReducedMotion
                ? { x: 68, y: 10, rotate: 18, opacity: 1 }
                : { x: 160, y: -120, rotate: 36, opacity: 0, scale: 0.85 }
            }
            animate={
              prefersReducedMotion
                ? { x: 68, y: 10, rotate: 18, opacity: 1 }
                : {
                    x: 68,
                    y: [10, 4, 10],
                    rotate: 18,
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={{
              x: { type: "spring", stiffness: 200, damping: 20, delay: 0.2 },
              rotate: { type: "spring", stiffness: 200, damping: 20, delay: 0.2 },
              opacity: { duration: 0.25, delay: 0.2 },
              scale: { type: "spring", stiffness: 200, damping: 20, delay: 0.2 },
              y: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            }}
            className="absolute z-30 flex h-40 w-27 flex-col justify-between overflow-hidden rounded-2xl border border-amber-300/70 bg-stone-100 p-3 text-neutral-900 shadow-2xl shadow-black/90"
          >
            {!prefersReducedMotion && (
              <motion.span
                aria-hidden="true"
                animate={{ x: ["-160%", "220%"] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatDelay: 2.3,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent"
              />
            )}

            <div className="flex items-center justify-between text-rose-600">
              <span className="text-lg font-black leading-none">K</span>
              <span className="text-base leading-none">♥</span>
            </div>

            <span className="self-center text-4xl leading-none text-rose-600">
              ♥
            </span>

            <div className="flex items-center justify-between rotate-180 text-rose-600">
              <span className="text-lg font-black leading-none">K</span>
              <span className="text-base leading-none">♥</span>
            </div>
          </motion.div>

          {/* Left Stacked Chips */}
          <motion.div
            aria-hidden="true"
            animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-2 left-4 z-30 flex flex-col items-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-amber-100 bg-amber-500 font-mono text-xs font-black text-neutral-950 shadow-lg shadow-black/90 ring-2 ring-neutral-950">
              500
            </div>
            <div className="-mt-8 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-emerald-200 bg-emerald-700 font-mono text-xs font-black text-white shadow-lg shadow-black/90 ring-2 ring-neutral-950 -z-10">
              100
            </div>
            <div className="-mt-8 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-rose-200 bg-rose-700 font-mono text-xs font-black text-white shadow-lg shadow-black/90 ring-2 ring-neutral-950 -z-20">
              50
            </div>
          </motion.div>

          {/* Right High-Roller Chip Stack */}
          <motion.div
            aria-hidden="true"
            animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
            transition={{
              duration: 2.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-4 right-5 z-30 flex flex-col items-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-amber-300 bg-neutral-900 font-mono text-xs font-black text-amber-300 shadow-lg shadow-black/90 ring-2 ring-amber-500/40">
              1K
            </div>
            <div className="-mt-8 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-amber-100 bg-amber-500 font-mono text-xs font-black text-neutral-950 shadow-lg shadow-black/90 ring-2 ring-neutral-950 -z-10">
              500
            </div>
          </motion.div>
        </div>

        {/* Rotating 3-Card Game Callout */}
        <div className="mt-4 w-full max-w-md min-h-[100px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCallout.id}
              initial={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }
              }
              animate={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              exit={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }
              }
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="rounded-2xl border border-amber-500/20 bg-neutral-900/90 p-4 backdrop-blur-sm shadow-xl shadow-black/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                  <span
                    className={
                      currentCallout.isRed ? "text-rose-400" : "text-amber-400"
                    }
                  >
                    {currentCallout.suit}
                  </span>
                  <span>{currentCallout.badge}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {CALLOUTS.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveIndex(idx);
                        setDealCycle((c) => c + 1);
                      }}
                      aria-label={`Show ${item.title}`}
                      className={`h-1.5 cursor-pointer rounded-full transition-all ${
                        idx === activeIndex
                          ? "w-5 bg-amber-400"
                          : "w-1.5 bg-neutral-700 hover:bg-neutral-500"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h3 className="mt-2 text-base font-bold text-slate-100">
                {currentCallout.title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
                {currentCallout.detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Headline */}
      <div className="relative z-10">
        <h2 className="text-2xl xl:text-3xl font-black tracking-tight text-slate-100">
          {headline}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
          {subcopy}
        </p>
      </div>
    </aside>
  );
}