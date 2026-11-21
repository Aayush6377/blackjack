import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  ChevronDown,
  Compass,
  Home,
  RefreshCw,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

export type ErrorVariant = "generic" | "notFound" | "unauthorized" | "network" | "table";

export interface BlackjackErrorStateProps {
  variant?: ErrorVariant;
  code?: string;
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onHome?: () => void;
  homeLabel?: string;
  showHome?: boolean;
  fullScreen?: boolean;
  extraActions?: React.ReactNode;
}

const VARIANT_CONFIG: Record<
  ErrorVariant,
  {
    code: string;
    title: string;
    message: string;
    suit: string;
    accentClass: string;
    badgeClass: string;
    Icon: typeof AlertTriangle;
  }
> = {
  generic: {
    code: "ERR",
    title: "Something went wrong",
    message: "An unexpected issue interrupted this action. Your saved progress and wallet ledger remain intact.",
    suit: "♠",
    accentClass: "text-amber-400",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Icon: AlertTriangle,
  },
  notFound: {
    code: "404",
    title: "Table or page not found",
    message: "The route you're looking for doesn't exist or the room may have moved.",
    suit: "♦",
    accentClass: "text-rose-400",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    Icon: Compass,
  },
  unauthorized: {
    code: "401",
    title: "Session access required",
    message: "Your authentication session isn't active or expired. Sign in again to continue playing.",
    suit: "♣",
    accentClass: "text-amber-300",
    badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    Icon: ShieldAlert,
  },
  network: {
    code: "OFFLINE",
    title: "Connection interrupted",
    message: "Unable to reach the server or live game socket. Check your connection and try syncing again.",
    suit: "♥",
    accentClass: "text-rose-400",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    Icon: WifiOff,
  },
  table: {
    code: "TABLE",
    title: "Unable to sync table state",
    message: "We couldn't complete that table operation safely. No duplicate chips were moved.",
    suit: "♠",
    accentClass: "text-amber-400",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Icon: AlertTriangle,
  },
};

export function BlackjackErrorState({
  variant = "generic",
  code,
  title,
  message,
  details,
  onRetry,
  retryLabel = "Try again",
  onHome,
  homeLabel = "Back to rooms",
  showHome = true,
  fullScreen = false,
  extraActions,
}: BlackjackErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const preset = VARIANT_CONFIG[variant];
  const IconComponent = preset.Icon;
  const resolvedCode = code ?? preset.code;
  const resolvedTitle = title ?? preset.title;
  const resolvedMessage = message ?? preset.message;

  const handleDefaultHome = () => {
    if (onHome) {
      onHome();
      return;
    }
    window.location.assign("/rooms");
  };

  const card = (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900/95 p-6 sm:p-8 text-center shadow-2xl shadow-black/70"
    >
      {/* Subtle Felt Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-emerald-900/35 blur-3xl"
      />

      {/* Decorative Tilted Card Motif */}
      <div className="relative mx-auto mb-5 flex h-24 w-32 items-center justify-center select-none">
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { rotate: [-14, -11, -14] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-20 w-14 -translate-x-4 rounded-xl border border-amber-500/25 bg-neutral-950/90 shadow-lg flex flex-col justify-between p-1.5 text-[11px] text-neutral-500"
        >
          <span className="font-semibold leading-none">{resolvedCode}</span>
          <span className={`self-center text-sm leading-none ${preset.accentClass}`}>
            {preset.suit}
          </span>
          <span className="self-end rotate-180 font-semibold leading-none">
            {resolvedCode}
          </span>
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : { y: [0, -3, 0], rotate: [8, 10, 8] }
          }
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 flex h-20 w-14 translate-x-4 flex-col items-center justify-center rounded-xl border border-amber-400/40 bg-stone-100 text-neutral-900 shadow-xl"
        >
          <IconComponent className={`h-6 w-6 ${preset.accentClass}`} />
        </motion.div>
      </div>

      {/* Status Pill */}
      <div className="mb-3 flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wider uppercase ${preset.badgeClass}`}
        >
          <span>{preset.suit}</span>
          <span>{resolvedCode}</span>
        </span>
      </div>

      {/* Title & Description */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
        {resolvedTitle}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">
        {resolvedMessage}
      </p>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{retryLabel}</span>
          </button>
        )}

        {showHome && (
          <button
            type="button"
            onClick={handleDefaultHome}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-amber-500/40 hover:bg-neutral-800 hover:text-amber-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            <Home className="h-4 w-4" />
            <span>{homeLabel}</span>
          </button>
        )}

        {extraActions}
      </div>

      {/* Optional Expandable Technical Details */}
      {details && (
        <div className="mt-6 border-t border-neutral-800 pt-4 text-left">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between text-xs font-medium text-neutral-400 hover:text-amber-300"
          >
            <span>Technical details</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showDetails ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDetails && (
            <pre className="mt-2.5 max-h-36 overflow-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-[11px] leading-relaxed text-rose-300/90">
              {details}
            </pre>
          )}
        </div>
      )}
    </motion.div>
  );

  if (!fullScreen) {
    return card;
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      {card}
    </div>
  );
}