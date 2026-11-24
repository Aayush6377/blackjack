import { ArrowLeft, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WalletPageHeader() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/rooms", { replace: true });
    }
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={handleBack}
        className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
        <span>Back</span>
      </button>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 sm:text-xs">
            Blackjack Royale · Bankroll &amp; Ledger
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Chip Wallet
          </h1>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Manage your chip balance, redeem promo codes, and review every chip credit and wager.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchases")}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:border-amber-400/55 hover:bg-amber-500/20 sm:self-auto"
        >
          <Receipt className="h-3.5 w-3.5 shrink-0" />
          <span>Purchases &amp; Receipts</span>
        </button>
      </div>
    </div>
  );
}