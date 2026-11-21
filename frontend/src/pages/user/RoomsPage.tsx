import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ActiveGameBanner } from "../../components/rooms/ActiveGameBanner";
import { RoomRulesModal } from "../../components/rooms/RoomRulesModal";
import { RoomsGrid } from "../../components/rooms/RoomsGrid";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useActiveGame, useLeaveGame, useRooms } from "../../hooks/useRooms";
import type { RoomSummary } from "../../types/room";

interface RoomsLocationState {
  lowWalletNotice?: string;
}

function formatChips(amount: number): string {
  return `${amount.toLocaleString("en-IN")} ${amount === 1 ? "Chip" : "Chips"}`;
}

export default function RoomsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: rooms = [], isLoading: isRoomsLoading, isError: isRoomsError, error: roomsError, refetch } = useRooms();
  const { data: activeGame } = useActiveGame();
  const leaveGameMutation = useLeaveGame();

  const [selectedRulesRoom, setSelectedRulesRoom] = useState<RoomSummary | null>(null);
  const [entryNotice, setEntryNotice] = useState<string | null>(null);
  const [lowWalletModalMessage, setLowWalletModalMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = (location.state as RoomsLocationState | null) ?? null;
    if (!state?.lowWalletNotice) return;

    setLowWalletModalMessage(state.lowWalletNotice);
    setEntryNotice(state.lowWalletNotice);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleEnterRoom = (room: RoomSummary) => {
    if (!room.unlocked) {
      setEntryNotice(`${room.name} is locked. Complete its unlock requirements first.`);
      return;
    }
    if (!room.eligibleToPlay) {
      setEntryNotice(
        `You need at least ${formatChips(room.rules.minWallet)} in your wallet to enter ${room.name}.`
      );
      return;
    }

    setEntryNotice(null);
    setSelectedRulesRoom(null);
    navigate(`/rooms/${room.id}`, { state: { room } });
  };

  const handleResumeRoom = (roomId: string, roundId: string) => {
    navigate(`/rooms/${roomId}`, { state: { roundId, resume: true } });
  };

  const handleLeaveGame = (gameId: string) => {
    leaveGameMutation.mutate(gameId);
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Blackjack Royale · Tables &amp; Rules
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Game Rooms
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Pick an unlocked table, review shoe &amp; payout rules, and enter a room when ready.
            </p>
          </div>
        </div>

        {/* Active Game Banner */}
        {activeGame && (
          <ActiveGameBanner
            activeGame={activeGame}
            isLeaving={leaveGameMutation.isPending}
            onResumeRoom={handleResumeRoom}
            onLeaveGame={handleLeaveGame}
          />
        )}

        {/* Entry / Action Feedback */}
        {entryNotice && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <span>{entryNotice}</span>
            <button
              type="button"
              onClick={() => setEntryNotice(null)}
              className="ml-4 text-xs font-semibold text-amber-300 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {leaveGameMutation.isError && (
          <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
            {leaveGameMutation.error.message}
          </div>
        )}

        {isRoomsError ? (
          <div className="rounded-2xl border border-rose-500/35 bg-rose-950/20 p-6 text-center">
            <p className="text-sm text-rose-200">
              {roomsError?.message || "Unable to load rooms right now."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-300 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <RoomsGrid
            rooms={rooms}
            isLoading={isRoomsLoading}
            onEnterRoom={handleEnterRoom}
            onInspectRules={(room) => setSelectedRulesRoom(room)}
          />
        )}

        <RoomRulesModal
          room={selectedRulesRoom}
          onClose={() => setSelectedRulesRoom(null)}
          onEnterRoom={handleEnterRoom}
        />

        <ConfirmModal
          open={Boolean(lowWalletModalMessage)}
          onClose={() => setLowWalletModalMessage(null)}
          onConfirm={() => {
            setLowWalletModalMessage(null);
            navigate("/wallet");
          }}
          variant="warning"
          title="Insufficient Chips for Room"
          description={lowWalletModalMessage ?? ""}
          highlightText="Tip: You can top up your chips by purchasing plans or claiming daily rewards in your Wallet."
          confirmLabel="Open Wallet"
          cancelLabel="Stay in Rooms"
        />
      </div>
    </section>
  );
}