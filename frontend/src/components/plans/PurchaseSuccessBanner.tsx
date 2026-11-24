import { CheckCircle2, Spade, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface CompletedPurchaseInfo {
  purchaseId: string;
  planName: string;
  chipsAwarded: number;
}

interface PurchaseSuccessBannerProps {
  purchase: CompletedPurchaseInfo;
  onDismiss: () => void;
}

export function PurchaseSuccessBanner({
  purchase,
  onDismiss,
}: PurchaseSuccessBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/35 p-4 text-emerald-100 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div>
          <h3 className="text-sm font-bold text-white">
            +{purchase.chipsAwarded.toLocaleString("en-IN")} Chips Added to Your Wallet!
          </h3>
          <p className="mt-0.5 text-xs text-emerald-200/85">
            Your <span className="font-semibold text-white">{purchase.planName}</span> purchase is complete (Ref:{" "}
            <span className="font-mono text-[11px]">{purchase.purchaseId}</span>).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-300"
        >
          <Spade className="h-3.5 w-3.5" />
          <span>Play Now</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss confirmation"
          className="cursor-pointer rounded-lg p-1.5 text-emerald-300/80 transition hover:bg-emerald-900/50 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}