import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";

export type ConfirmVariant = "default" | "warning" | "danger" | "success";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  variant?: ConfirmVariant;
  highlightText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  disableBackdropClose?: boolean;
}

const VARIANT_STYLES: Record<
  ConfirmVariant,
  {
    suit: string;
    iconWrapper: string;
    iconClass: string;
    highlightClass: string;
    confirmBtnClass: string;
    Icon: typeof HelpCircle;
  }
> = {
  default: {
    suit: "♠",
    iconWrapper: "border-amber-500/30 bg-amber-500/10",
    iconClass: "text-amber-400",
    highlightClass: "border-amber-500/25 bg-amber-500/10 text-amber-200",
    confirmBtnClass:
      "bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-amber-500/15 focus:ring-amber-400/60",
    Icon: HelpCircle,
  },
  warning: {
    suit: "♦",
    iconWrapper: "border-amber-400/40 bg-amber-500/15",
    iconClass: "text-amber-300",
    highlightClass: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    confirmBtnClass:
      "bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-amber-500/20 focus:ring-amber-400/60",
    Icon: AlertTriangle,
  },
  danger: {
    suit: "♥",
    iconWrapper: "border-rose-500/35 bg-rose-500/15",
    iconClass: "text-rose-400",
    highlightClass: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    confirmBtnClass:
      "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20 focus:ring-rose-400/60",
    Icon: ShieldAlert,
  },
  success: {
    suit: "♣",
    iconWrapper: "border-emerald-500/35 bg-emerald-500/15",
    iconClass: "text-emerald-400",
    highlightClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    confirmBtnClass:
      "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-emerald-500/20 focus:ring-emerald-400/60",
    Icon: CheckCircle2,
  },
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  variant = "default",
  highlightText,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  disableBackdropClose = false,
}: ConfirmModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const styles = VARIANT_STYLES[variant];
  const IconComponent = styles.Icon;

  // Close on Escape key and lock background scroll while open
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isLoading, onClose]);

  const handleBackdropClick = () => {
    if (!isLoading && !disableBackdropClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-description"
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.95, y: 10 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900 p-6 shadow-2xl shadow-black/80"
          >
            {/* Subtle Ambient Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 right-0 h-32 w-48 rounded-full bg-emerald-900/30 blur-2xl"
            />

            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.iconWrapper}`}
                >
                  <IconComponent className={`h-5 w-5 ${styles.iconClass}`} />
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 text-[10px] font-bold ${styles.iconClass}`}
                  >
                    {styles.suit}
                  </span>
                </div>

                <div>
                  <h3
                    id="confirm-modal-title"
                    className="text-lg font-bold tracking-tight text-slate-100"
                  >
                    {title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                aria-label="Close modal"
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <p
              id="confirm-modal-description"
              className="mt-3.5 text-sm leading-relaxed text-neutral-300"
            >
              {description}
            </p>

            {/* Optional Highlight Box (Chips / Warning Detail) */}
            {highlightText && (
              <div
                className={`mt-4 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${styles.highlightClass}`}
              >
                {highlightText}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-neutral-600 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-500/50"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 ${styles.confirmBtnClass}`}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{confirmLabel}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}