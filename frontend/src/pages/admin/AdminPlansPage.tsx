import { useState } from "react";
import { Coins, Plus } from "lucide-react";
import { toast } from "sonner";

import { PlanSkeletonGrid } from "../../components/admin/plans/PlanSkeletonGrid";
import { PlanCard } from "../../components/admin/plans/PlanCard";
import { PlanFormModal } from "../../components/admin/plans/PlanFormModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import {
  useAdminPlans,
  useCreatePlan,
  useDeletePlan,
  useUpdatePlan,
} from "../../hooks/usePlans";
import type {
  ChipPlanResponse,
  CreateChipPlanRequest,
  UpdateChipPlanRequest,
} from "../../types/plan";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";

export default function AdminPlansPage() {
  const { data: plans, isLoading, isError, refetch } = useAdminPlans();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ChipPlanResponse | null>(null);
  const [planToDelete, setPlanToDelete] = useState<ChipPlanResponse | null>(null);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  const openEditModal = (plan: ChipPlanResponse) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (createPlanMutation.isPending || updatePlanMutation.isPending) return;
    setFormOpen(false);
    setEditingPlan(null);
  };

  const handleCreate = async (payload: CreateChipPlanRequest) => {
    const created = await createPlanMutation.mutateAsync(payload);
    toast.success(`Created "${created.name}"`);
    return created;
  };

  const handleUpdate = async (planId: string, payload: UpdateChipPlanRequest) => {
    const updated = await updatePlanMutation.mutateAsync({ planId, payload });
    toast.success(`Updated "${updated.name}"`);
    return updated;
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await deletePlanMutation.mutateAsync(planToDelete.id);
      toast.success(`Deleted "${planToDelete.name}"`);
      setPlanToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete chip plan."
      );
    }
  };

  const isMutating =
    createPlanMutation.isPending ||
    updatePlanMutation.isPending ||
    deletePlanMutation.isPending;

  if (isError) {
  return (
    <div>
      <AdminPageHeader
        title="Plans Management"
        subtitle="Create chip bundles, configure active sales, and manage store visibility."
      />
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <BlackjackErrorState
          title="Unable to load chip plans"
          message="There was a problem fetching plans from the server."
          onRetry={() => void refetch()}
        />
      </div>
    </div>
  );
}

  return (
    <div>
      <AdminPageHeader
        title="Plans Management"
        subtitle="Create chip bundles, configure active sales, and manage store visibility."
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>New Plan</span>
          </button>
        }
      />

      {isLoading ? (
        <PlanSkeletonGrid />
      ) : !plans || plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <Coins className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-100">
            No chip plans configured yet
          </h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            Create your first chip bundle so players can purchase chips in the store.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={openEditModal}
              onDelete={(target) => setPlanToDelete(target)}
              disabled={isMutating}
            />
          ))}
        </div>
      )}

      <PlanFormModal
        open={formOpen}
        onClose={closeFormModal}
        initialPlan={editingPlan}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={
          createPlanMutation.isPending || updatePlanMutation.isPending
        }
      />

      <ConfirmModal
        open={Boolean(planToDelete)}
        onClose={() => !deletePlanMutation.isPending && setPlanToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Chip Plan?"
        description="This action cannot be undone. Removing this plan will immediately take it out of the admin catalog."
        variant="danger"
        highlightText={
          planToDelete
            ? `${planToDelete.name} • ${planToDelete.totalChips.toLocaleString("en-IN")} total chips`
            : undefined
        }
        confirmLabel="Delete Plan"
        isLoading={deletePlanMutation.isPending}
      />
    </div>
  );
}