import { useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { CouponFormModal } from "../../components/admin/coupons/CouponFormModal";
import { CouponsTable } from "../../components/admin/coupons/CouponsTable";
import { CouponsTableSkeleton } from "../../components/admin/coupons/CouponsTableSkeleton";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  useAdminCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useSetCouponActive,
  useUpdateCoupon,
} from "../../hooks/useCoupons";
import type { CouponResponse, CreateCouponRequest, UpdateCouponRequest } from "../../types/coupon";

export default function AdminCouponsPage() {
  const {
    data: coupons = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminCoupons();

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const setActiveMutation = useSetCouponActive();
  const deleteMutation = useDeleteCoupon();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponResponse | null>(
    null
  );
  const [couponToDeactivate, setCouponToDeactivate] =
    useState<CouponResponse | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<CouponResponse | null>(
    null
  );

  const busyCouponId =
    setActiveMutation.isPending && setActiveMutation.variables
      ? setActiveMutation.variables.couponId
      : deleteMutation.isPending && deleteMutation.variables
      ? deleteMutation.variables
      : null;

  const isModalSubmitting =
    createMutation.isPending || updateMutation.isPending;

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormModalOpen(true);
  };

  const openEditModal = (coupon: CouponResponse) => {
    setEditingCoupon(coupon);
    setFormModalOpen(true);
  };

  const handleCreate = async (payload: CreateCouponRequest) => {
    await createMutation.mutateAsync(payload);
    toast.success(`Coupon ${payload.code} created`);
  };

  const handleUpdate = async (
    couponId: string,
    payload: UpdateCouponRequest
  ) => {
    await updateMutation.mutateAsync({ couponId, payload });
    toast.success("Coupon updated");
  };

  const handleToggleActiveClick = async (coupon: CouponResponse) => {
    if (coupon.active) {
      setCouponToDeactivate(coupon);
      return;
    }

    try {
      await setActiveMutation.mutateAsync({
        couponId: coupon.id,
        active: true,
      });
      toast.success(`Coupon ${coupon.code} activated`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to activate coupon"
      );
    }
  };

  const confirmDeactivate = async () => {
    if (!couponToDeactivate) return;
    const target = couponToDeactivate;
    try {
      await setActiveMutation.mutateAsync({
        couponId: target.id,
        active: false,
      });
      toast.success(`Coupon ${target.code} deactivated`);
      setCouponToDeactivate(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to deactivate coupon"
      );
    }
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    const target = couponToDelete;
    try {
      await deleteMutation.mutateAsync(target.id);
      toast.success(`Coupon ${target.code} deleted`);
      setCouponToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete coupon"
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 pb-10">
      <AdminPageHeader
        title="Coupons"
        subtitle="Create promo codes, configure chip rewards, control user/global limits, and manage active windows."
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
        }
      />

      {isError ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <BlackjackErrorState
            title="Unable to load coupons"
            message={
              error instanceof Error
                ? error.message
                : "There was a problem fetching coupons."
            }
            onRetry={() => void refetch()}
          />
        </div>
      ) : isLoading ? (
        <CouponsTableSkeleton />
      ) : coupons.length === 0 ? (
        <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-400">
            <Ticket className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-white">
            No coupons created yet
          </h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            Create your first promo coupon to reward players with bonus chips.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Coupon</span>
          </button>
        </div>
      ) : (
        <CouponsTable
          coupons={coupons}
          busyCouponId={busyCouponId}
          onEdit={openEditModal}
          onToggleActive={(c) => void handleToggleActiveClick(c)}
          onDelete={(c) => setCouponToDelete(c)}
        />
      )}

      <CouponFormModal
        open={formModalOpen}
        editingCoupon={editingCoupon}
        isSubmitting={isModalSubmitting}
        onClose={() => {
          if (!isModalSubmitting) {
            setFormModalOpen(false);
            setEditingCoupon(null);
          }
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Deactivate Warning Modal */}
      <ConfirmModal
        open={Boolean(couponToDeactivate)}
        onClose={() => {
          if (!setActiveMutation.isPending) {
            setCouponToDeactivate(null);
          }
        }}
        onConfirm={() => void confirmDeactivate()}
        variant="warning"
        title="Deactivate Coupon?"
        description="Players will no longer be able to redeem this coupon until you activate it again."
        highlightText={
          couponToDeactivate
            ? `${couponToDeactivate.code} (+${couponToDeactivate.chipReward.toLocaleString("en-IN")} chips · ${couponToDeactivate.timesRedeemed} redeemed)`
            : undefined
        }
        confirmLabel="Deactivate Coupon"
        cancelLabel="Keep Active"
        isLoading={setActiveMutation.isPending}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={Boolean(couponToDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setCouponToDelete(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
        variant="danger"
        title="Delete Coupon?"
        description="This permanently removes the coupon. Historical redemption records and player chip balances remain preserved."
        highlightText={
          couponToDelete
            ? `${couponToDelete.code} (${couponToDelete.timesRedeemed} total redemptions)`
            : undefined
        }
        confirmLabel="Delete Coupon"
        cancelLabel="Cancel"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}