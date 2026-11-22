import { useMemo, useState } from "react";
import { Gift, Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { RewardSkeletonGrid } from "../../components/admin/rewards/RewardSkeletonGrid";
import { RewardConfigCard } from "../../components/admin/rewards/RewardConfigCard";
import { RewardConfigFormModal } from "../../components/admin/rewards/RewardConfigFormModal";
import { BulkRewardModal } from "../../components/admin/rewards/BulkRewardModal";
import { BulkDeleteRewardModal } from "../../components/admin/rewards/BulkDeleteRewardModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { useAdminRewardConfigs, useBulkCreateRewardConfigs, useBulkDeleteRewardConfigs, useCreateRewardConfig,
  useDeleteRewardConfig, useUpdateRewardConfig } from "../../hooks/useRewards";
import type { BulkCreateRewardConfigRequest, BulkDeleteRewardConfigRequest, CreateRewardConfigRequest,
  RewardConfigResponse, UpdateRewardConfigRequest } from "../../types/reward";

export default function AdminRewardsPage() {
  const { data: configs, isLoading, isError, refetch } = useAdminRewardConfigs();
  const createMutation = useCreateRewardConfig();
  const bulkCreateMutation = useBulkCreateRewardConfigs();
  const bulkDeleteMutation = useBulkDeleteRewardConfigs();
  const updateMutation = useUpdateRewardConfig();
  const deleteMutation = useDeleteRewardConfig();

  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<RewardConfigResponse | null>(null);
  const [configToDelete, setConfigToDelete] =
    useState<RewardConfigResponse | null>(null);

  const sortedConfigs = useMemo(() => {
    if (!configs) return [];
    return [...configs].sort((a, b) => a.dayNumber - b.dayNumber);
  }, [configs]);

  const maxDay = useMemo(() => {
    if (sortedConfigs.length === 0) return 1;
    return Math.max(...sortedConfigs.map((c) => c.dayNumber));
  }, [sortedConfigs]);

  const suggestedNextDay = useMemo(() => {
    if (sortedConfigs.length === 0) return 1;
    return maxDay + 1;
  }, [sortedConfigs, maxDay]);

  const openCreateModal = () => {
    setEditingConfig(null);
    setFormOpen(true);
  };

  const openEditModal = (config: RewardConfigResponse) => {
    setEditingConfig(config);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setFormOpen(false);
    setEditingConfig(null);
  };

  const handleCreate = async (payload: CreateRewardConfigRequest) => {
    const created = await createMutation.mutateAsync(payload);
    toast.success(`Created Day ${created.dayNumber} reward`);
    return created;
  };

  const handleBulkCreate = async (payload: BulkCreateRewardConfigRequest) => {
    const createdList = await bulkCreateMutation.mutateAsync(payload);
    toast.success(
      `Created ${Array.isArray(createdList) ? createdList.length : payload.days} reward days`
    );
    return createdList;
  };

  const handleBulkDelete = async (payload: BulkDeleteRewardConfigRequest) => {
    const result = await bulkDeleteMutation.mutateAsync(payload);
    toast.success(
      `Deleted ${result.deletedCount} reward ${result.deletedCount === 1 ? "day" : "days"}`
    );
    return result;
  };

  const handleUpdate = async (
    configId: string,
    payload: UpdateRewardConfigRequest
  ) => {
    const updated = await updateMutation.mutateAsync({ configId, payload });
    toast.success(`Updated Day ${updated.dayNumber} reward`);
    return updated;
  };

  const handleConfirmDelete = async () => {
    if (!configToDelete) return;
    try {
      await deleteMutation.mutateAsync(configToDelete.id);
      toast.success(`Deleted Day ${configToDelete.dayNumber} reward`);
      setConfigToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete reward configuration."
      );
    }
  };

  const isMutating =
    createMutation.isPending ||
    bulkCreateMutation.isPending ||
    bulkDeleteMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <AdminPageHeader
          title="Daily Reward Management"
          subtitle="Configure daily login streak rewards, chip payouts, and active streak days."
        />
        <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center">
          <BlackjackErrorState
            title="Unable to load reward configurations"
            message="There was a problem fetching daily reward settings from the server."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <AdminPageHeader
        title="Daily Reward Management"
        subtitle="Configure daily login streak rewards, chip payouts, and active streak days."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {sortedConfigs.length > 0 && (
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={isMutating}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-500/35 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-950/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Bulk Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              disabled={isMutating}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/35 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers className="h-4 w-4" />
              <span>Bulk Generate</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={isMutating}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Add Day</span>
            </button>
          </div>
        }
      />

      {isLoading ? (
        <RewardSkeletonGrid />
      ) : sortedConfigs.length === 0 ? (
        <div className="flex min-h-[26rem] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <Gift className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-100">
            No daily rewards configured yet
          </h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            Add individual streak days or generate a multi-day reward schedule.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/35 bg-neutral-900 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-neutral-800"
            >
              <Layers className="h-4 w-4" />
              <span>Bulk Generate</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              <span>Add Day</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedConfigs.map((config) => (
            <RewardConfigCard
              key={config.id}
              config={config}
              onEdit={openEditModal}
              onDelete={(target) => setConfigToDelete(target)}
              disabled={isMutating}
            />
          ))}
        </div>
      )}

      <RewardConfigFormModal
        open={formOpen}
        onClose={closeFormModal}
        initialConfig={editingConfig}
        suggestedNextDay={suggestedNextDay}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <BulkRewardModal
        open={bulkOpen}
        onClose={() => !bulkCreateMutation.isPending && setBulkOpen(false)}
        suggestedStartDay={suggestedNextDay}
        onBulkCreate={handleBulkCreate}
        isSubmitting={bulkCreateMutation.isPending}
      />

      <BulkDeleteRewardModal
        open={bulkDeleteOpen}
        onClose={() => !bulkDeleteMutation.isPending && setBulkDeleteOpen(false)}
        maxDay={maxDay}
        onBulkDelete={handleBulkDelete}
        isSubmitting={bulkDeleteMutation.isPending}
      />

      <ConfirmModal
        open={Boolean(configToDelete)}
        onClose={() => !deleteMutation.isPending && setConfigToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Reward Day?"
        description="This action cannot be undone. Removing this day configuration will remove it from the daily reward schedule."
        variant="danger"
        highlightText={
          configToDelete
            ? `Day ${configToDelete.dayNumber} • +${configToDelete.chipsReward.toLocaleString("en-IN")} chips`
            : undefined
        }
        confirmLabel="Delete Day"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}