import { useEffect } from "react";
import { motion } from "motion/react";
import type { CardCode } from "../../types/game";
import { soundEffects } from "../../utils/soundEffects";

interface PlayingCardProps {
  cardCode?: CardCode | null;
  faceDown?: boolean;
  dealIndex?: number;
  playDealSound?: boolean;
  compact?: boolean;
  highlight?: boolean;
}

export function PlayingCard({
  cardCode,
  faceDown = false,
  dealIndex = 0,
  playDealSound = false,
  compact = false,
  highlight = false,
}: PlayingCardProps) {
  const showBack = faceDown || !cardCode;
  const src = showBack ? "/cards/BACK.png" : `/cards/${cardCode}.png`;

  useEffect(() => {
    if (!playDealSound) return;
    const timer = window.setTimeout(() => {
      soundEffects.play("cardDeal");
    }, dealIndex * 110);
    return () => window.clearTimeout(timer);
  }, [playDealSound, dealIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -36, scale: 0.88, rotate: -6 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 24,
        delay: dealIndex * 0.11,
      }}
      className={`relative aspect-[691/1056] shrink-0 overflow-hidden rounded-xl border shadow-2xl select-none ${
        compact ? "w-16 sm:w-20" : "w-20 sm:w-24 md:w-28"
      } ${
        highlight
          ? "border-amber-300 ring-2 ring-amber-400/60"
          : "border-amber-200/25 bg-zinc-900"
      }`}
    >
      <img
        src={src}
        alt={showBack ? "Face-down card" : `Card ${cardCode}`}
        draggable={false}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.endsWith("/cards/BACK.png")) {
            target.src = "/cards/BACK.png";
          }
        }}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
    </motion.div>
  );
}