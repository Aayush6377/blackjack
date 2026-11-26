import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  CopyPlus,
  Layers,
  PlusCircle,
  Radio,
  RotateCcw,
  Shield,
} from "lucide-react";
import { ChipTokenIcon } from "../../ui/ChipTokenIcon";

type PreviewMoveId = "INITIAL" | "HIT" | "STAND" | "DOUBLE" | "SPLIT";

interface HandCard {
  code: string;
  hidden?: boolean;
}

interface PreviewScenario {
  id: PreviewMoveId;
  label: string;
  stompEvent: string;
  dealerLabel: string;
  dealerCards: HandCard[];
  playerLabel: string;
  playerCards: HandCard[];
  splitCards?: HandCard[];
  betAmount: string;
  statusText: string;
  outcomeBadge: string;
  outcomeTone: "amber" | "emerald" | "sky";
}

const PREVIEW_SCENARIOS: Record<PreviewMoveId, PreviewScenario> = {
  INITIAL: {
    id: "INITIAL",
    label: "Deal",
    stompEvent: "ROUND_DEALT · /topic/rooms/vip-royale",
    dealerLabel: "Dealer Shows 6",
    dealerCards: [{ code: "6D" }, { code: "KH", hidden: true }],
    playerLabel: "Your Hand · 11 (Hard)",
    playerCards: [{ code: "7S" }, { code: "4C" }],
    betAmount: "500 Chips",
    statusText: "Strong 11 vs. Dealer 6 — choose your table action below.",
    outcomeBadge: "YOUR TURN",
    outcomeTone: "amber",
  },
  HIT: {
    id: "HIT",
    label: "Hit",
    stompEvent: "PLAYER_ACTION · HIT -> CARD_DRAWN (9H)",
    dealerLabel: "Dealer Shows 6",
    dealerCards: [{ code: "6D" }, { code: "KH", hidden: true }],
    playerLabel: "Your Hand · 20",
    playerCards: [{ code: "7S" }, { code: "4C" }, { code: "9H" }],
    betAmount: "500 Chips",
    statusText: "Drew 9 of Hearts for a rock-solid 20. Ready to stand!",
    outcomeBadge: "TOTAL 20",
    outcomeTone: "emerald",
  },
  DOUBLE: {
    id: "DOUBLE",
    label: "Double Down",
    stompEvent: "PLAYER_ACTION · DOUBLE_DOWN -> 2X STAKE LOCKED",
    dealerLabel: "Dealer Busts · 24",
    dealerCards: [{ code: "6D" }, { code: "KH" }, { code: "8S" }],
    playerLabel: "Your Hand · 21!",
    playerCards: [{ code: "7S" }, { code: "4C" }, { code: "10D" }],
    betAmount: "1,000 Chips (2x)",
    statusText: "Doubled wager, drew 10 of Diamonds for 21, and won +2,000 chips.",
    outcomeBadge: "+2,000 CHIPS",
    outcomeTone: "emerald",
  },
  STAND: {
    id: "STAND",
    label: "Stand",
    stompEvent: "ROUND_SETTLED · DEALER_BUST (22)",
    dealerLabel: "Dealer Busts · 22",
    dealerCards: [{ code: "6D" }, { code: "KH" }, { code: "6S" }],
    playerLabel: "Your Hand · 19 (Held)",
    playerCards: [{ code: "10H" }, { code: "9D" }],
    betAmount: "500 Chips",
    statusText: "Dealer hit on 16 and busted with 22. Standard 1:1 win settled.",
    outcomeBadge: "+1,000 CHIPS",
    outcomeTone: "emerald",
  },
  SPLIT: {
    id: "SPLIT",
    label: "Split Pair",
    stompEvent: "PLAYER_ACTION · SPLIT_HANDS -> HAND_1 & HAND_2",
    dealerLabel: "Dealer Shows 5",
    dealerCards: [{ code: "5C" }, { code: "9S", hidden: true }],
    playerLabel: "Hand 1 (19) · Hand 2 (18)",
    playerCards: [{ code: "8S" }, { code: "AH" }],
    splitCards: [{ code: "8D" }, { code: "10C" }],
    betAmount: "500 + 500 Chips",
    statusText: "Split 8s into two independent hands with matching bets.",
    outcomeBadge: "2 ACTIVE HANDS",
    outcomeTone: "sky",
  },
};

const ACTION_BUTTONS: {
  id: PreviewMoveId;
  label: string;
  icon: typeof PlusCircle;
}[] = [
  { id: "INITIAL", label: "Reset Deal", icon: RotateCcw },
  { id: "HIT", label: "Hit", icon: PlusCircle },
  { id: "DOUBLE", label: "Double Down", icon: CopyPlus },
  { id: "STAND", label: "Stand", icon: Shield },
  { id: "SPLIT", label: "Split Pair", icon: Layers },
];

const BADGE_CLASSES = {
  amber: "border-amber-400/40 bg-amber-500/15 text-amber-300",
  emerald: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  sky: "border-sky-400/40 bg-sky-500/15 text-sky-300",
};

function TableCardTile({ card, index }: { card: HandCard; index: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (card.hidden) {
    return (
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: index * 3 - 2 }}
        transition={{ duration: 0.28, delay: index * 0.06 }}
        className="flex h-28 w-20 flex-col items-center justify-center rounded-xl border-2 border-amber-400/45 bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-950 shadow-xl shadow-black/75 sm:h-32 sm:w-22"
      >
        <div className="flex h-20 w-14 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-500/5">
          <span className="font-mono text-[10px] font-bold tracking-widest text-amber-300/80">
            HOLE
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: index * 3 - 3 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.04 }}
      className="h-28 w-20 overflow-hidden rounded-xl border border-amber-400/35 bg-neutral-900 shadow-xl shadow-black/75 sm:h-32 sm:w-22"
    >
      <img
        src={`/cards/${card.code}.png`}
        alt={`Card ${card.code}`}
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}

export function LiveTablePreviewSection() {
  const [activeMove, setActiveMove] = useState<PreviewMoveId>("INITIAL");
  const scenario = PREVIEW_SCENARIOS[activeMove];

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive Table Sandbox</span>
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Test Real Table Moves Before You Sit Down
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-neutral-400 sm:text-sm">
          Tap any action below to preview how server-validated Blackjack hands,
          STOMP events, and chip settlements play out in real time.
        </p>
      </div>

      {/* Main Felt Stage */}
      <div className="overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-b from-emerald-950/55 via-neutral-900/90 to-neutral-950 p-5 shadow-2xl shadow-black/70 sm:p-8">
        {/* Top Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/90 pb-4">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-neutral-950/90 px-3 py-1.5 font-mono text-[11px] text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>{scenario.stompEvent}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950/90 px-3 py-1.5 text-xs text-neutral-300">
              <ChipTokenIcon className="h-4 w-4 text-amber-400" />
              <span className="font-mono font-semibold text-white">
                {scenario.betAmount}
              </span>
            </div>

            <span
              className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-bold tracking-wider ${BADGE_CLASSES[scenario.outcomeTone]}`}
            >
              {scenario.outcomeBadge}
            </span>
          </div>
        </div>

        {/* Table Felt Area: Dealer vs Player */}
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.65 }}
            transition={{ duration: 0.18 }}
            className="my-7 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {/* Dealer Zone */}
            <div className="flex flex-col items-center justify-between rounded-2xl border border-neutral-800/90 bg-neutral-950/65 p-5 text-center">
              <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                House Dealer
              </div>
              <div className="my-4 flex min-h-[8.5rem] items-center justify-center gap-2.5">
                {scenario.dealerCards.map((card, idx) => (
                  <TableCardTile
                    key={`dealer-${scenario.id}-${card.code}-${idx}`}
                    card={card}
                    index={idx}
                  />
                ))}
              </div>
              <span className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-xs font-semibold text-slate-200">
                {scenario.dealerLabel}
              </span>
            </div>

            {/* Player Zone */}
            <div className="flex flex-col items-center justify-between rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-5 text-center">
              <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                Player Seat
              </div>

              <div className="my-4 flex min-h-[8.5rem] flex-wrap items-center justify-center gap-5">
                <div className="flex items-center justify-center gap-2">
                  {scenario.playerCards.map((card, idx) => (
                    <TableCardTile
                      key={`player-${scenario.id}-${card.code}-${idx}`}
                      card={card}
                      index={idx}
                    />
                  ))}
                </div>

                {scenario.splitCards && (
                  <div className="flex items-center justify-center gap-2 border-l border-amber-400/30 pl-5">
                    {scenario.splitCards.map((card, idx) => (
                      <TableCardTile
                        key={`split-${scenario.id}-${card.code}-${idx}`}
                        card={card}
                        index={idx}
                      />
                    ))}
                  </div>
                )}
              </div>

              <span className="rounded-lg border border-amber-400/30 bg-neutral-950 px-3 py-1 font-mono text-xs font-semibold text-amber-300">
                {scenario.playerLabel}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Status Note + Interactive Action Controls */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-800/90 bg-neutral-950/90 p-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-2.5 text-xs text-neutral-300 sm:text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>{scenario.statusText}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ACTION_BUTTONS.map(({ id, label, icon: Icon }) => {
              const isSelected = activeMove === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveMove(id)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                    isSelected
                      ? "border-amber-400 bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                      : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-amber-400/40 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}