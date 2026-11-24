import { useState } from "react";
import { Coins, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PurchasesPageHeader } from "../../components/purchases/PurchasesPageHeader";
import { PurchasesTable } from "../../components/purchases/PurchasesTable";
import { PurchasesTableSkeleton } from "../../components/purchases/PurchasesTableSkeleton";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { useMyPurchases } from "../../hooks/usePayments";

const PAGE_SIZE = 10;

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const {
    data: purchasesPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMyPurchases({ page, limit: PAGE_SIZE });

  return (
    <section className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PurchasesPageHeader />

        {isLoading && !purchasesPage ? (
          <PurchasesTableSkeleton />
        ) : isError ? (
          <div className="flex min-h-[45vh] items-center justify-center rounded-2xl border border-zinc-800/90 bg-zinc-900/75 p-6">
            <BlackjackErrorState
              title="Unable to load purchase history"
              message={
                error instanceof Error
                  ? error.message
                  : "There was a problem loading your payment receipts."
              }
              onRetry={() => void refetch()}
            />
          </div>
        ) : !purchasesPage || purchasesPage.items.length === 0 ? (
          <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <Receipt className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-white">
              No purchases yet
            </h2>
            <p className="mt-1 max-w-sm text-xs text-zinc-400">
              Once you buy a chip bundle from the store, your order receipts and payment statuses will show up here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/plans")}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-amber-300"
            >
              <Coins className="h-3.5 w-3.5" />
              <span>Browse Chip Plans</span>
            </button>
          </div>
        ) : (
          <PurchasesTable
            data={purchasesPage}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  );
}