import { motion, useReducedMotion } from "motion/react";

export interface BlackjackLogoProps {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onClick?: () => void;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    emblemBox: "h-10 w-12",
    card: "h-8 w-6 rounded-md p-1 text-[9px]",
    backCardOffset: { x: -5, y: 1, rotate: -14 },
    frontCardOffset: { x: 5, y: -1, rotate: 10 },
    chipBadge: "h-4 w-4 text-[8px] bottom-0.5 right-0.5",
    title: "text-base",
    subtitle: "text-[10px]",
    gap: "gap-2.5",
  },
  md: {
    emblemBox: "h-12 w-14",
    card: "h-10 w-7 rounded-lg p-1 text-[10px]",
    backCardOffset: { x: -6, y: 2, rotate: -15 },
    frontCardOffset: { x: 6, y: -1, rotate: 11 },
    chipBadge: "h-5 w-5 text-[9px] bottom-0.5 right-0.5",
    title: "text-xl",
    subtitle: "text-[11px]",
    gap: "gap-3",
  },
  lg: {
    emblemBox: "h-16 w-20",
    card: "h-14 w-10 rounded-xl p-1.5 text-xs",
    backCardOffset: { x: -9, y: 2, rotate: -16 },
    frontCardOffset: { x: 9, y: -2, rotate: 12 },
    chipBadge: "h-6 w-6 text-[10px] bottom-1 right-1",
    title: "text-2xl sm:text-3xl",
    subtitle: "text-xs",
    gap: "gap-4",
  },
};

export function BlackjackLogo({
  title = "BLACKJACK",
  subtitle = "HIGH STAKES • LIVE TABLE",
  size = "md",
  showText = true,
  onClick,
  className = "",
}: BlackjackLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const cfg = SIZE_CONFIG[size];

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={`group inline-flex items-center select-none text-left focus:outline-none ${
        onClick ? "cursor-pointer" : ""
      } ${cfg.gap} ${className}`}
      aria-label={`${title} logo`}
    >
      {/* Animated 21 Card Emblem */}
      <motion.div
        whileHover={prefersReducedMotion ? undefined : "hover"}
        whileTap={prefersReducedMotion || !onClick ? undefined : { scale: 0.96 }}
        className={`relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${cfg.emblemBox}`}
      >
        {/* Emerald Felt Radial Glow */}
        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  scale: [1, 1.12, 1],
                  opacity: [0.45, 0.75, 0.45],
                }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500/25 blur-md group-hover:bg-amber-400/25 transition-colors duration-300"
        />

        {/* Back Card: Ace of Spades (Obsidian & Gold) */}
        <motion.div
          aria-hidden="true"
          initial={
            prefersReducedMotion
              ? {
                  x: cfg.backCardOffset.x,
                  y: cfg.backCardOffset.y,
                  rotate: cfg.backCardOffset.rotate,
                }
              : { x: 0, y: 4, rotate: 0, opacity: 0 }
          }
          animate={{
            x: cfg.backCardOffset.x,
            y: cfg.backCardOffset.y,
            rotate: cfg.backCardOffset.rotate,
            opacity: 1,
          }}
          variants={{
            hover: {
              x: cfg.backCardOffset.x - 2,
              y: cfg.backCardOffset.y - 2,
              rotate: cfg.backCardOffset.rotate - 5,
            },
          }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className={`absolute flex flex-col justify-between border border-amber-400/50 bg-neutral-900 shadow-lg shadow-black/70 ${cfg.card}`}
        >
          <span className="font-extrabold leading-none text-amber-300">A</span>
          <span className="self-center leading-none text-amber-400">♠</span>
          <span className="self-end rotate-180 font-extrabold leading-none text-amber-300">
            A
          </span>
        </motion.div>

        {/* Front Card: King of Hearts (Ivory Stone & Crimson) */}
        <motion.div
          aria-hidden="true"
          initial={
            prefersReducedMotion
              ? {
                  x: cfg.frontCardOffset.x,
                  y: cfg.frontCardOffset.y,
                  rotate: cfg.frontCardOffset.rotate,
                }
              : { x: 0, y: 4, rotate: 0, opacity: 0 }
          }
          animate={{
            x: cfg.frontCardOffset.x,
            y: cfg.frontCardOffset.y,
            rotate: cfg.frontCardOffset.rotate,
            opacity: 1,
          }}
          variants={{
            hover: {
              x: cfg.frontCardOffset.x + 2,
              y: cfg.frontCardOffset.y - 2,
              rotate: cfg.frontCardOffset.rotate + 5,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 20,
            delay: prefersReducedMotion ? 0 : 0.08,
          }}
          className={`relative z-10 flex flex-col justify-between overflow-hidden border border-amber-300/60 bg-stone-100 shadow-xl shadow-black/80 ${cfg.card}`}
        >
          {/* Subtle Diagonal Foil Sheen on Hover */}
          {!prefersReducedMotion && (
            <motion.span
              aria-hidden="true"
              variants={{
                hover: {
                  x: ["-140%", "180%"],
                  transition: { duration: 0.65, ease: "easeInOut" },
                },
              }}
              className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"
            />
          )}

          <span className="font-extrabold leading-none text-rose-600">K</span>
          <span className="self-center leading-none text-rose-600">♥</span>
          <span className="self-end rotate-180 font-extrabold leading-none text-rose-600">
            K
          </span>
        </motion.div>

        {/* Floating "21" Poker Chip Badge */}
        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -1.5, 0],
                }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute z-20 flex items-center justify-center rounded-full border border-dashed border-amber-200 bg-emerald-900 font-black tracking-tighter text-amber-300 shadow-md shadow-black/90 ring-2 ring-neutral-950 ${cfg.chipBadge}`}
        >
          21
        </motion.div>
      </motion.div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider bg-gradient-to-r from-slate-100 via-amber-200 to-amber-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-amber-200 group-hover:to-amber-500 ${cfg.title}`}
            >
              {title}
            </span>
            <span
              aria-hidden="true"
              className="inline-block text-xs text-amber-400 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
            >
              ♠
            </span>
          </div>

          {subtitle && (
            <span
              className={`mt-1 font-semibold tracking-[0.18em] text-emerald-400/80 uppercase ${cfg.subtitle}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Wrapper>
  );
}