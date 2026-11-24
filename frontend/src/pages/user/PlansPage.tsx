import { useState } from "react";
import { Coins } from "lucide-react";
import { toast } from "sonner";
import { PlansPageHeader } from "../../components/plans/PlansPageHeader";
import { PlanCard } from "../../components/plans/PlanCard";
import { PlansGridSkeleton } from "../../components/plans/PlansGridSkeleton";
import { PurchaseSuccessBanner, type CompletedPurchaseInfo } from "../../components/plans/PurchaseSuccessBanner";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { useAuth } from "../../hooks/useAuth";
import { useActivePlans } from "../../hooks/usePlans";
import { useCreatePaymentOrder, useVerifyPayment } from "../../hooks/usePayments";
import { loadRazorpayCheckout } from "../../lib/razorpay";
import type { ChipPlanResponse } from "../../types/plan";

export default function PlansPage() {
  const { user } = useAuth();
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isError: isPlansError,
    error: plansError,
    refetch,
  } = useActivePlans();

  const createOrderMutation = useCreatePaymentOrder();
  const verifyPaymentMutation = useVerifyPayment();

  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedPurchase, setCompletedPurchase] =
    useState<CompletedPurchaseInfo | null>(null);

  const isCheckoutBusy =
    activePlanId !== null ||
    createOrderMutation.isPending ||
    verifyPaymentMutation.isPending;

  const handlePurchasePlan = async (plan: ChipPlanResponse) => {
    if (isCheckoutBusy) return;

    setCheckoutError(null);
    setActivePlanId(plan.id);

    try {
      const [RazorpayConstructor, order] = await Promise.all([
        loadRazorpayCheckout(),
        createOrderMutation.mutateAsync({ planId: plan.id }),
      ]);

      const razorpay = new RazorpayConstructor({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "Blackjack Royale",
        description: `${order.planName} (${order.chipsAwarded.toLocaleString("en-IN")} Chips)`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        },
        theme: {
          color: "#f59e0b",
        },
        handler: async (response) => {
          try {
            const verified = await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setCompletedPurchase({
              purchaseId: verified.purchaseId,
              planName: order.planName,
              chipsAwarded: verified.chipsAwarded,
            });
            toast.success(
              `+${verified.chipsAwarded.toLocaleString("en-IN")} chips credited to your wallet!`
            );
          } catch (verifyErr) {
            const message =
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment verification failed. If money was deducted, chips will sync automatically via webhook.";
            setCheckoutError(message);
            toast.error(message);
          } finally {
            setActivePlanId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setActivePlanId(null);
          },
        },
      });

      razorpay.on("payment.failed", (failureResponse) => {
        const reason =
          failureResponse.error?.description ||
          "Payment could not be completed. Please try again.";
        setCheckoutError(reason);
        toast.error(reason);
        setActivePlanId(null);
      });

      razorpay.open();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to start checkout.";
      setCheckoutError(message);
      toast.error(message);
      setActivePlanId(null);
    }
  };

  return (
    <section className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PlansPageHeader />

        {completedPurchase && (
          <PurchaseSuccessBanner
            purchase={completedPurchase}
            onDismiss={() => setCompletedPurchase(null)}
          />
        )}

        {checkoutError && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
            <span>{checkoutError}</span>
            <button
              type="button"
              onClick={() => setCheckoutError(null)}
              className="ml-4 cursor-pointer text-xs font-semibold text-rose-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {isPlansError ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <BlackjackErrorState
              title="Unable to load chip plans"
              message={
                plansError instanceof Error
                  ? plansError.message
                  : "There was a problem loading available chip bundles."
              }
              onRetry={() => void refetch()}
            />
          </div>
        ) : isPlansLoading ? (
          <PlansGridSkeleton />
        ) : plans.length === 0 ? (
          <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <Coins className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-white">
              No chip plans available right now
            </h2>
            <p className="mt-1 max-w-sm text-xs text-zinc-400">
              Check back soon for new chip packages, or claim your daily bonus chips to keep playing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isProcessing={activePlanId === plan.id}
                disabled={isCheckoutBusy}
                onSelectPlan={(target) => void handlePurchasePlan(target)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}