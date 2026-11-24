import { useState } from "react";
import { CheckCircle2, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useRedeemCoupon } from "../../hooks/useCoupons";
import type { RedeemCouponResponse } from "../../types/coupon";

export function RedeemCouponCard() {
  const redeemMutation = useRedeemCoupon();

  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRedeemed, setLastRedeemed] =
    useState<RedeemCouponResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setErrorMessage("Please enter a coupon code.");
      return;
    }

    try {
      const result = await redeemMutation.mutateAsync({ code: normalized });
      setLastRedeemed(result);
      setCode("");
      toast.success(
        `+${result.chipsAwarded.toLocaleString("en-IN")} chips added from ${result.code}!`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to redeem coupon code.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Ticket className="h-4 w-4" />
          <span>Redeem Promo Code</span>
        </div>
        <h2 className="mt-1.5 text-base font-bold text-white">
          Have a Royale Voucher?
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Enter an active promo code below to credit bonus chips straight to your wallet.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="ENTER CODE (E.G. ROYALE500)"
            maxLength={60}
            disabled={redeemMutation.isPending}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-sm font-semibold uppercase text-white placeholder-zinc-500 outline-none transition focus:border-amber-400/60 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={redeemMutation.isPending || !code.trim()}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {redeemMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <span>Redeem Code</span>
            )}
          </button>
        </form>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/35 px-3.5 py-2 text-xs font-medium text-rose-200"
        >
          {errorMessage}
        </div>
      )}

      {!errorMessage && lastRedeemed && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-950/35 px-3.5 py-2 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            Claimed <span className="font-mono font-bold text-white">{lastRedeemed.code}</span> for{" "}
            <span className="font-mono font-bold text-emerald-300">
              +{lastRedeemed.chipsAwarded.toLocaleString("en-IN")} Chips
            </span>
            .
          </span>
        </div>
      )}
    </div>
  );
}