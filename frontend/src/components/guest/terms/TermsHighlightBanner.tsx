import { AlertTriangle, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";

export function TermsHighlightBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-neutral-900/90 to-emerald-950/20 p-5 shadow-lg shadow-black/30 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/15 text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Important Purchase &amp; Chip Policy
            </div>
            <h2 className="mt-0.5 text-base font-bold text-slate-100 sm:text-lg">
              All Chip Pack Purchases Are Final &amp; Non-Refundable
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-300 sm:text-sm">
              In-game chips are virtual entertainment tokens with no real-world
              cash value. Once a chip pack is purchased, payments cannot be
              refunded or reversed. If your payment was debited but chips were
              not credited to your wallet, raise a ticket with Support and our
              admin team will verify and resolve it.
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2.5 text-xs font-bold text-amber-200 transition hover:border-amber-400/70 hover:bg-amber-500/25 sm:text-sm"
        >
          <LifeBuoy className="h-4 w-4" />
          <span>Sign In for Support</span>
        </Link>
      </div>
    </div>
  );
}