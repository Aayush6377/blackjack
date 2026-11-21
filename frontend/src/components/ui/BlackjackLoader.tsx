import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface BlackjackLoaderProps {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  show?: boolean;
  size?: "sm" | "md" | "lg";
}

const MINI_CARDS = [
  { id: "spade", rank: "A", suit: "♠", isRed: false, x: -26, rotate: -14, delay: 0 },
  { id: "heart", rank: "K", suit: "♥", isRed: true, x: -9, rotate: -5, delay: 0.12 },
  { id: "diamond", rank: "Q", suit: "♦", isRed: true, x: 9, rotate: 5, delay: 0.24 },
  { id: "club", rank: "J", suit: "♣", isRed: false, x: 26, rotate: 14, delay: 0.36 },
];

export function BlackjackLoader({
  label = "Loading...",
  sublabel,
  fullScreen = false,
  show = true,
  size = "md",
}: BlackjackLoaderProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: {
      stage: "h-16 w-28",
      card: "h-12 w-9 rounded-md text-[10px]",
      ring: "h-16 w-16",
      labelText: "text-xs",
    },
    md: {
      stage: "h-24 w-40",
      card: "h-16 w-12 rounded-lg text-xs",
      ring: "h-24 w-24",
      labelText: "text-sm",
    },
    lg: {
      stage: "h-28 w-48",
      card: "h-20 w-14 rounded-xl text-sm",
      ring: "h-28 w-28",
      labelText: "text-base",
    },
  }[size];

  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 select-none"
    >
      {/* Animated Card Fan + Gold Aura */}
      <div className={`relative flex items-center justify-center ${sizeConfig.stage}`}>
        {/* Subtle Gold Halo Ring */}
        <motion.div
          aria-hidden="true"
          className={`absolute rounded-full border border-amber-400/30 bg-emerald-950/50 shadow-[0_0_28px_rgba(217,176,74,0.16)] ${sizeConfig.ring}`}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  scale: [1, 1.06, 1],
                  opacity: [0.55, 0.9, 0.55],
                }
          }
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Fanned Miniature Cards */}
        {MINI_CARDS.map((card) => (
          <motion.div
            key={card.id}
            aria-hidden="true"
            className={`absolute flex flex-col justify-between border border-amber-200/40 bg-stone-100 p-1.5 shadow-lg shadow-black/60 ${sizeConfig.card}`}
            initial={
              prefersReducedMotion
                ? { x: card.x, rotate: card.rotate, opacity: 1 }
                : { x: 0, y: 8, rotate: 0, opacity: 0.7 }
            }
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    x: [0, card.x, card.x * 0.85, card.x],
                    y: [8, -6, 2, -4],
                    rotate: [0, card.rotate, card.rotate * 0.7, card.rotate],
                    opacity: [0.75, 1, 0.95, 1],
                  }
            }
            transition={{
              duration: 1.8,
              delay: card.delay,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          >
            <span
              className={`font-bold leading-none ${
                card.isRed ? "text-rose-600" : "text-neutral-900"
              }`}
            >
              {card.rank}
            </span>
            <span
              className={`self-center leading-none ${
                card.isRed ? "text-rose-600" : "text-neutral-900"
              }`}
            >
              {card.suit}
            </span>
            <span
              className={`self-end rotate-180 font-bold leading-none ${
                card.isRed ? "text-rose-600" : "text-neutral-900"
              }`}
            >
              {card.rank}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Customizable Label */}
      {label && (
        <div className="flex items-center gap-1.5 text-center">
          <span className={`font-medium tracking-wide text-amber-200 ${sizeConfig.labelText}`}>
            {label}
          </span>
          {!prefersReducedMotion && (
            <span className="inline-flex gap-0.5 text-amber-400" aria-hidden="true">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
                  transition={{
                    duration: 1,
                    delay: dot * 0.18,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  .
                </motion.span>
              ))}
            </span>
          )}
        </div>
      )}

      {sublabel && (
        <p className="max-w-xs text-center text-xs text-neutral-400">{sublabel}</p>
      )}
    </div>
  );

  if (!fullScreen) {
    return show ? content : null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="blackjack-fullscreen-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md"
        >
          <div className="rounded-2xl border border-amber-500/20 bg-emerald-950/30 px-8 py-7 shadow-2xl">
            {content}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}