import { useEffect } from "react";
import { motion } from "motion/react";
import { soundEffects } from "../../utils/soundEffects";

interface DeckShuffleOverlayProps {
  decksPerShoe: number;
  isShuffling: boolean;
  onShuffleComplete?: () => void;
  onManualShufflePreview?: () => void;
}

export function DeckShuffleOverlay({
  decksPerShoe,
  isShuffling,
  onShuffleComplete,
  onManualShufflePreview,
}: DeckShuffleOverlayProps) {
  useEffect(() => {
    if (!isShuffling) return;
    soundEffects.play("shuffle");
    const timer = window.setTimeout(() => {
      onShuffleComplete?.();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [isShuffling, onShuffleComplete]);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="relative h-24 w-16 sm:h-28 sm:w-[4.65rem]">
        {/* Static bottom deck */}
        <div className="absolute inset-0 translate-x-1 translate-y-1 overflow-hidden rounded-lg border border-amber-400/30 bg-zinc-900 shadow-md">
          <img
            src="/cards/BACK.png"
            alt="Shoe base"
            className="h-full w-full object-cover opacity-80"
          />
        </div>

        {/* Left cut half */}
        <motion.div
          animate={
            isShuffling
              ? {
                  x: [0, -24, -4, 0],
                  rotate: [0, -10, 2, 0],
                }
              : { x: 0, rotate: 0 }
          }
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "transform" }}
          className="absolute inset-0 overflow-hidden rounded-lg border border-amber-300/45 shadow-lg"
        >
          <img
            src="/cards/BACK.png"
            alt="Left deck half"
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* Right cut half */}
        <motion.div
          animate={
            isShuffling
              ? {
                  x: [0, 24, 4, 0],
                  rotate: [0, 10, -2, 0],
                }
              : { x: 0, rotate: 0 }
          }
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "transform" }}
          className="absolute inset-0 overflow-hidden rounded-lg border border-amber-300/45 shadow-lg"
        >
          <img
            src="/cards/BACK.png"
            alt="Right deck half"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="rounded-md border border-amber-400/25 bg-zinc-950/85 px-2 py-0.5 font-mono text-amber-200/90">
          {decksPerShoe}D Shoe
        </span>
        {onManualShufflePreview && (
          <button
            type="button"
            disabled={isShuffling}
            onClick={onManualShufflePreview}
            className="rounded-md border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-40 cursor-pointer"
          >
            {isShuffling ? "Shuffling..." : "Shuffle"}
          </button>
        )}
      </div>
    </div>
  );
}