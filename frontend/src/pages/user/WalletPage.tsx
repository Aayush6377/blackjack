import { useState } from "react";
import { WalletPageHeader } from "../../components/wallet/WalletPageHeader";
import { WalletBalanceCard } from "../../components/wallet/WalletBalanceCard";
import { RedeemCouponCard } from "../../components/wallet/RedeemCouponCard";
import { ChipTransactionsSection } from "../../components/wallet/ChipTransactionsSection";
import { useAuth } from "../../hooks/useAuth";
import { useWalletTransactions } from "../../hooks/useWallet";

const PAGE_SIZE = 10;

export default function WalletPage() {
  const { walletBalance, isWalletLoading, refreshWallet } = useAuth();
  const [page, setPage] = useState(0);

  const {
    data: transactionsPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useWalletTransactions({ page, limit: PAGE_SIZE });

  return (
    <section className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <WalletPageHeader />

        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <WalletBalanceCard
            walletBalance={walletBalance}
            isWalletLoading={isWalletLoading}
            onRefreshWallet={refreshWallet}
          />
          <RedeemCouponCard />
        </div>

        <ChipTransactionsSection
          data={transactionsPage}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error instanceof Error ? error : null}
          onRetry={() => void refetch()}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}