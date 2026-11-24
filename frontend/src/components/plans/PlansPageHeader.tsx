import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PlansPageHeader() {
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

      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 sm:text-xs">
          Blackjack Royale · Chip Vault
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Chip Store &amp; Plans
        </h1>
        <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
          Top up your bankroll with instant chip bundles, bonus stacks, and limited-time table offers.
        </p>
      </div>
    </div>
  );
}