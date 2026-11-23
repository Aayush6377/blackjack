import { useMemo, useState } from "react";
import { Plus, RotateCcw, Spade } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { AdminRoomCard } from "../../components/admin/rooms/AdminRoomCard";
import { RoomCardsSkeleton } from "../../components/admin/rooms/RoomCardsSkeleton";
import { RoomsFilterBar, type RoomStatusFilter } from "../../components/admin/rooms/RoomsFilterBar";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import type { AdminGameRoom } from "../../types/room";
import { useAdminRooms, useDeleteAdminRoom, useToggleAdminRoomActive } from "../../hooks/useRooms";

export default function AdminRoomsPage() {
  const navigate = useNavigate();
  const {
    data: rooms = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAdminRooms();
  const deleteRoomMutation = useDeleteAdminRoom();
  const toggleActiveMutation = useToggleAdminRoomActive();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatusFilter>("ALL");
  const [roomToDelete, setRoomToDelete] = useState<AdminGameRoom | null>(null);
  const [roomToDeactivate, setRoomToDeactivate] = useState<AdminGameRoom | null>(null);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((room) => {
      if (statusFilter === "ACTIVE" && !room.active) return false;
      if (statusFilter === "INACTIVE" && room.active) return false;

      if (!q) return true;
      return (
        room.name.toLowerCase().includes(q) ||
        room.slug.toLowerCase().includes(q) ||
        room.difficulty.toLowerCase().includes(q)
      );
    });
  }, [rooms, search, statusFilter]);

  const dependentRoomsSummary = useMemo(() => {
    if (!roomToDeactivate) return [];
    const affected: string[] = [];
    for (const room of rooms) {
      if (room.id === roomToDeactivate.id) continue;
      const dependsOnTarget = room.unlockRules.some(
        (rule) => rule.prerequisiteRoomId === roomToDeactivate.id
      );
      if (dependsOnTarget) {
        affected.push(room.name);
      }
    }
    return affected;
  }, [rooms, roomToDeactivate]);

  const applyActiveState = async (room: AdminGameRoom, nextActive: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({
        roomId: room.id,
        payload: { active: nextActive },
      });
      toast.success(
        nextActive
          ? `Activated room "${room.name}"`
          : `Deactivated room "${room.name}" and removed dependent unlock rules`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update room status"
      );
    }
  };

  const handleToggleActive = (room: AdminGameRoom) => {
    if (room.active) {
      setRoomToDeactivate(room);
    } else {
      void applyActiveState(room, true);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!roomToDeactivate) return;
    await applyActiveState(roomToDeactivate, false);
    setRoomToDeactivate(null);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    const targetId = roomToDelete.id;
    const targetName = roomToDelete.name;
    try {
      await deleteRoomMutation.mutateAsync(targetId);
      setRoomToDelete(null);
      toast.success(`Deleted room "${targetName}"`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete game room"
      );
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <AdminPageHeader
          title="Game Rooms"
          subtitle="Manage Blackjack tables, betting rules, media assets, and room unlock prerequisites."
        />
        <div className="flex min-h-[60vh] flex-1 items-center justify-center">
          <BlackjackErrorState
            title="Unable to load game rooms"
            message="There was a problem loading the game rooms list from the server."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 pb-12">
      <AdminPageHeader
        title="Game Rooms"
        subtitle="Manage Blackjack tables, betting rules, media assets, and room unlock prerequisites."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching || deleteRoomMutation.isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/rooms/new")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              <span>Create Room</span>
            </button>
          </div>
        }
      />

      <RoomsFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={rooms.length}
        filteredCount={filteredRooms.length}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <RoomCardsSkeleton />
      ) : filteredRooms.length === 0 ? (
        <div className="flex min-h-[24rem] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <Spade className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-100">
            No game rooms found
          </h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            {search.trim() || statusFilter !== "ALL"
              ? "No rooms match your current search or status filter."
              : "Get started by creating your first Blackjack room."}
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            {(search.trim() || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="cursor-pointer rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-neutral-700"
              >
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/admin/rooms/new")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Room</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <AdminRoomCard
              key={room.id}
              room={room}
              onEdit={(id) => navigate(`/admin/rooms/${id}/edit`)}
              onDelete={(target) => setRoomToDelete(target)}
              onToggleActive={(target) => handleToggleActive(target)}
              isDeleting={deleteRoomMutation.isPending}
              isTogglingActive={
                toggleActiveMutation.isPending &&
                toggleActiveMutation.variables?.roomId === room.id
              }
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={roomToDeactivate !== null}
        onClose={() => {
          if (!toggleActiveMutation.isPending) {
            setRoomToDeactivate(null);
          }
        }}
        onConfirm={handleConfirmDeactivate}
        variant="warning"
        title="Deactivate Game Room?"
        description="Deactivating this room will remove all unlock rules on other rooms that depend on this room as a prerequisite so players aren't blocked by an unavailable room."
        highlightText={
          roomToDeactivate
            ? dependentRoomsSummary.length > 0
              ? `${roomToDeactivate.name} — Dependent rooms affected: ${dependentRoomsSummary.join(", ")}`
              : `${roomToDeactivate.name} (/${roomToDeactivate.slug}) — Any unlock rules referencing this room will be removed.`
            : undefined
        }
        confirmLabel="Deactivate & Remove Rules"
        cancelLabel="Cancel"
        isLoading={toggleActiveMutation.isPending}
      />

      <ConfirmModal
        open={roomToDelete !== null}
        onClose={() => {
          if (!deleteRoomMutation.isPending) {
            setRoomToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Delete Game Room?"
        description="This action will remove the room and trigger cleanup of its linked rounds, shoes, progress, and unlock rules."
        highlightText={
          roomToDelete
            ? `${roomToDelete.name} (/${roomToDelete.slug})`
            : undefined
        }
        confirmLabel="Delete Room"
        cancelLabel="Cancel"
        isLoading={deleteRoomMutation.isPending}
      />
    </div>
  );
}