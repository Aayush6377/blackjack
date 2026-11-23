import { useMemo, useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminRoomUnlockRule, CreateRoomUnlockRulePayload } from "../../../types/room";
import { useAdminRooms, useCreateRoomUnlockRule, useDeleteRoomUnlockRule, useUpdateRoomUnlockRule } from "../../../hooks/useRooms";

export interface RoomUnlockRulesSectionProps {
  currentRoomId?: string;
  existingRules?: AdminRoomUnlockRule[];
  draftRules?: CreateRoomUnlockRulePayload[];
  onDraftRulesChange?: (rules: CreateRoomUnlockRulePayload[]) => void;
  disabled?: boolean;
}

export function RoomUnlockRulesSection({
  currentRoomId,
  existingRules = [],
  draftRules = [],
  onDraftRulesChange,
  disabled = false,
}: RoomUnlockRulesSectionProps) {
  const { data: allRooms = [], isLoading: loadingRooms } = useAdminRooms();
  const createRuleMutation = useCreateRoomUnlockRule();
  const updateRuleMutation = useUpdateRoomUnlockRule();
  const deleteRuleMutation = useDeleteRoomUnlockRule();

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [prerequisiteRoomId, setPrerequisiteRoomId] = useState("");
  const [requiredRounds, setRequiredRounds] = useState("0");
  const [requiredWins, setRequiredWins] = useState("0");
  const [minimumWallet, setMinimumWallet] = useState("0");

  const eligiblePrereqRooms = useMemo(() => {
    return allRooms.filter((r) => r.id !== currentRoomId);
  }, [allRooms, currentRoomId]);

  const resetForm = () => {
    setEditingRuleId(null);
    setPrerequisiteRoomId("");
    setRequiredRounds("0");
    setRequiredWins("0");
    setMinimumWallet("0");
  };

  const startEditRule = (rule: AdminRoomUnlockRule) => {
    setEditingRuleId(rule.id);
    setPrerequisiteRoomId(rule.prerequisiteRoomId);
    setRequiredRounds(String(rule.requiredRounds));
    setRequiredWins(String(rule.requiredWins));
    setMinimumWallet(String(rule.minimumWallet));
  };

  const handleSaveRule = async () => {
    if (!prerequisiteRoomId) {
      toast.error("Please select a prerequisite room.");
      return;
    }

    const payload: CreateRoomUnlockRulePayload = {
      prerequisiteRoomId,
      requiredRounds: Math.max(0, Number(requiredRounds) || 0),
      requiredWins: Math.max(0, Number(requiredWins) || 0),
      minimumWallet: Math.max(0, Number(minimumWallet) || 0),
    };

    // Create-room mode: stage draft rules until room is created
    if (!currentRoomId) {
      onDraftRulesChange?.([...draftRules, payload]);
      toast.success("Added prerequisite rule to draft");
      resetForm();
      return;
    }

    try {
      if (editingRuleId) {
        await updateRuleMutation.mutateAsync({
          roomId: currentRoomId,
          ruleId: editingRuleId,
          payload,
        });
        toast.success("Updated unlock rule");
      } else {
        await createRuleMutation.mutateAsync({
          roomId: currentRoomId,
          payload,
        });
        toast.success("Added unlock rule");
      }
      resetForm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save unlock rule"
      );
    }
  };

  const handleDeleteExistingRule = async (ruleId: string) => {
    if (!currentRoomId) return;
    try {
      await deleteRuleMutation.mutateAsync({ roomId: currentRoomId, ruleId });
      toast.success("Removed unlock rule");
      if (editingRuleId === ruleId) resetForm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove unlock rule"
      );
    }
  };

  const handleRemoveDraftRule = (idx: number) => {
    onDraftRulesChange?.(draftRules.filter((_, i) => i !== idx));
  };

  const roomNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of allRooms) map.set(r.id, r.name);
    return map;
  }, [allRooms]);

  const busy =
    disabled ||
    createRuleMutation.isPending ||
    updateRuleMutation.isPending ||
    deleteRuleMutation.isPending;

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-amber-400" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Unlock Rules
          </h2>
          <p className="text-xs text-neutral-400">
            Optional prerequisites players must meet before unlocking this room.
          </p>
        </div>
      </div>

      {/* Add / Edit Rule Controls */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-[11px] font-medium text-neutral-300">
            Prerequisite Room
          </label>
          <select
            value={prerequisiteRoomId}
            onChange={(e) => setPrerequisiteRoomId(e.target.value)}
            disabled={busy || loadingRooms}
            className="w-full cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-900 px-3 py-2 text-xs text-slate-100 focus:border-amber-400/70 focus:outline-none"
          >
            <option value="">
              {loadingRooms ? "Loading rooms..." : "Select prerequisite room"}
            </option>
            {eligiblePrereqRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.slug})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-neutral-300">
            Required Rounds
          </label>
          <input
            type="number"
            min={0}
            value={requiredRounds}
            onChange={(e) => setRequiredRounds(e.target.value)}
            disabled={busy}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900 px-3 py-2 font-mono text-xs text-slate-100 focus:border-amber-400/70 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-neutral-300">
            Required Wins
          </label>
          <input
            type="number"
            min={0}
            value={requiredWins}
            onChange={(e) => setRequiredWins(e.target.value)}
            disabled={busy}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900 px-3 py-2 font-mono text-xs text-slate-100 focus:border-amber-400/70 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-neutral-300">
            Min Wallet
          </label>
          <input
            type="number"
            min={0}
            value={minimumWallet}
            onChange={(e) => setMinimumWallet(e.target.value)}
            disabled={busy}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900 px-3 py-2 font-mono text-xs text-slate-100 focus:border-amber-400/70 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="button"
            onClick={() => void handleSaveRule()}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{editingRuleId ? "Update Rule" : "Add Rule"}</span>
          </button>

          {editingRuleId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={busy}
              className="cursor-pointer rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Existing Rules (Edit Mode) */}
      {currentRoomId && existingRules.length > 0 && (
        <div className="space-y-2">
          {existingRules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2.5 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-100">
                  {rule.prerequisiteRoomName}{" "}
                  <span className="font-mono text-[11px] text-neutral-500">
                    ({rule.prerequisiteRoomSlug})
                  </span>
                </div>
                <div className="font-mono text-[11px] text-neutral-400">
                  Rounds: {rule.requiredRounds} • Wins: {rule.requiredWins} •
                  Wallet: {rule.minimumWallet.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => startEditRule(rule)}
                  disabled={busy}
                  aria-label="Edit rule"
                  className="cursor-pointer rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-amber-300 transition hover:bg-neutral-700 disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteExistingRule(rule.id)}
                  disabled={busy}
                  aria-label="Delete rule"
                  className="cursor-pointer rounded-lg border border-rose-500/30 bg-rose-950/35 p-1.5 text-rose-300 transition hover:bg-rose-950/60 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Draft Rules (Create Mode) */}
      {!currentRoomId && draftRules.length > 0 && (
        <div className="space-y-2">
          {draftRules.map((rule, idx) => (
            <div
              key={`${rule.prerequisiteRoomId}-${idx}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2.5 text-xs"
            >
              <div>
                <span className="font-semibold text-slate-100">
                  {roomNameById.get(rule.prerequisiteRoomId) ??
                    rule.prerequisiteRoomId}
                </span>{" "}
                <span className="font-mono text-[11px] text-neutral-400">
                  • Rounds: {rule.requiredRounds} • Wins: {rule.requiredWins} •
                  Wallet: {rule.minimumWallet.toLocaleString("en-IN")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDraftRule(idx)}
                disabled={busy}
                aria-label="Remove draft rule"
                className="cursor-pointer rounded-lg border border-rose-500/30 bg-rose-950/35 p-1.5 text-rose-300 transition hover:bg-rose-950/60"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}