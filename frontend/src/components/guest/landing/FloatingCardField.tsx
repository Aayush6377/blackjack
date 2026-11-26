import { motion, useReducedMotion } from "motion/react";

interface FloatingCardSpec {
  code: string;
  className: string;
  rotate: number;
  floatY: number;
  duration: number;
  delay: number;
}

const FLOATING_CARDS: FloatingCardSpec[] = [
  {
    code: "AS",
    className: "top-10 left-[5%] h-24 w-16 sm:h-28 sm:w-20 opacity-25 blur-[0.3px]",
    rotate: -14,
    floatY: 14,
    duration: 6.2,
    delay: 0,
  },
  {
    code: "KH",
    className: "top-24 right-[6%] h-24 w-16 sm:h-28 sm:w-20 opacity-20",
    rotate: 12,
    floatY: -16,
    duration: 7.1,
    delay: 0.6,
  },
  {
    code: "QD",
    className: "bottom-28 left-[8%] hidden h-24 w-16 opacity-20 md:block",
    rotate: 9,
    floatY: -12,
    duration: 6.8,
    delay: 1.1,
  },
  {
    code: "10C",
    className: "bottom-20 right-[8%] hidden h-24 w-16 opacity-20 md:block",
    rotate: -11,
    floatY: 15,
    duration: 7.5,
    delay: 0.3,
  },
];

export function FloatingCardField() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {FLOATING_CARDS.map((card) => (
        <motion.div
          key={card.code}
          initial={{
            opacity: 0,
            rotate: card.rotate,
            y: 0,
          }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.2, rotate: card.rotate, y: 0 }
              : {
                  opacity: [0.16, 0.28, 0.16],
                  y: [0, card.floatY, 0],
                  rotate: [card.rotate - 2, card.rotate + 2, card.rotate - 2],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : {
                  duration: card.duration,
                  delay: card.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className={`absolute overflow-hidden rounded-xl border border-amber-400/25 bg-neutral-900 shadow-2xl shadow-black/70 ${card.className}`}
        >
          <img
            src={`/cards/${card.code}.png`}
            alt=""
            className="h-full w-full object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}