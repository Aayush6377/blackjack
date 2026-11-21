import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ActionControlsBar } from "../../components/game/ActionControlsBar";
import { BettingChipTray } from "../../components/game/BettingChipTray";
import { BlackjackFeltTable } from "../../components/game/BlackjackFeltTable";
import { TableHeader } from "../../components/game/TableHeader";
import { TableRulesCard } from "../../components/game/TableRulesCard";
import { AppFooter } from "../../components/ui/AppFooter";
import { useRoomPlaySession } from "../../hooks/useRoomPlaySession";
import { useRoom } from "../../hooks/useRooms";
import type { RoomSummary } from "../../types/room";

interface LocationState {
  room?: RoomSummary;
  roundId?: string;
  resume?: boolean;
}

export default function RoomPlayPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirectedLowWalletRef = useRef<boolean>(false);

  const navState = (location.state as LocationState | null) ?? null;

  const {
    data: fetchedRoom,
    isLoading: isRoomLoading,
    isError: isRoomError,
    error: roomError,
  } = useRoom(navState?.room ? undefined : roomId);

  const room = navState?.room ?? fetchedRoom ?? null;

  const session = useRoomPlaySession({
    room,
    roomId,
    initialRoundId: navState?.roundId,
  });

  useEffect(() => {
    if (!room || typeof session.walletBalance !== "number") return;
    if (session.walletBalance >= room.rules.minWallet) return;

    const isMidRound = session.snapshot?.roundStatus === "IN_PROGRESS";
    if (isMidRound || hasRedirectedLowWalletRef.current) return;

    hasRedirectedLowWalletRef.current = true;

    const notice = `Your wallet has ${session.walletBalance.toLocaleString("en-IN")} Chips, which is below ${room.name}'s minimum wallet entry of ${room.rules.minWallet.toLocaleString("en-IN")} Chips. You can get more chips by purchasing plans or claiming daily rewards.`;

    void (async () => {
      if (session.snapshot && session.snapshot.roundStatus !== "IN_PROGRESS") {
        try {
          await session.leaveGameMutation.mutateAsync(session.snapshot.roundId);
        } catch {
          // Ignore if already left
        }
      }
      navigate("/rooms", {
        replace: true,
        state: { lowWalletNotice: notice },
      });
    })();
  }, [room, session.walletBalance, session.snapshot, session.leaveGameMutation, navigate]);

  const handleLeaveRoom = async () => {
    if (session.snapshot && session.snapshot.roundStatus !== "IN_PROGRESS") {
      try {
        await session.leaveGameMutation.mutateAsync(session.snapshot.roundId);
      } catch {
        // Ignore if already left
      }
    }
    navigate("/rooms");
  };

  const handleLeaveCompletedGame = async (gameId: string) => {
    try {
      await session.leaveGameMutation.mutateAsync(gameId);
      navigate("/rooms");
    } catch (err) {
      session.setErrorNotice(
        err instanceof Error ? err.message : "Unable to leave table right now"
      );
    }
  };

  if (isRoomLoading && !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
        Loading table...
      </div>
    );
  }

  if (isRoomError || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 p-6 text-center text-zinc-200">
        <p className="text-sm text-rose-300">
          {roomError?.message || "Room not found or unavailable."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-300 cursor-pointer"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  const showBettingTray = !session.snapshot || session.snapshot.roundStatus === "WAITING";

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-zinc-950 text-zinc-100">
      {room.backgroundUrl ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${room.backgroundUrl})` }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(21,128,61,0.35),_rgba(9,9,11,0.92)_75%)]"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-zinc-950/45 via-zinc-950/25 to-zinc-950/65"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-6 lg:py-5">
        <TableHeader
          room={room}
          isConnected={session.isConnected}
          controllerTab={session.snapshot?.controllerTab ?? true}
          isLeaving={session.isLeaving}
          onLeaveRoom={handleLeaveRoom}
        />

        {(session.bannerNotice || session.errorNotice) && (
          <div className="space-y-2">
            {session.bannerNotice && (
              <div className="flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-950/90 px-4 py-2 text-xs text-amber-200">
                <span>{session.bannerNotice}</span>
                <button
                  type="button"
                  onClick={() => session.setBannerNotice(null)}
                  className="font-semibold text-amber-300 hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {session.errorNotice && (
              <div className="flex items-center justify-between rounded-xl border border-rose-500/45 bg-rose-950/90 px-4 py-2 text-xs text-rose-200">
                <span>{session.errorNotice}</span>
                <button
                  type="button"
                  onClick={() => session.setErrorNotice(null)}
                  className="font-semibold text-rose-300 hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3.5 lg:grid lg:grid-cols-[1fr_385px] lg:items-start lg:gap-5 xl:grid-cols-[1fr_415px]">
          <BlackjackFeltTable
            rules={room.rules}
            dealerCards={session.snapshot?.dealerCards ?? []}
            dealerTotal={session.snapshot?.dealerTotal ?? 0}
            roundStatus={session.snapshot?.roundStatus}
            insuranceAvailable={session.snapshot?.insuranceAvailable ?? false}
            insuranceStatus={session.snapshot?.insuranceStatus ?? "NONE"}
            originalBet={session.snapshot?.originalBet ?? session.stagedBet}
            hands={session.snapshot?.hands ?? []}
            selectedHandId={session.activeHand?.handId ?? null}
            prevDealerCount={session.prevDealerCount}
            prevHandCardCounts={session.prevHandCardCounts}
            isShuffling={session.isShuffling}
            isSubmitting={session.isSubmitting}
            onShuffleComplete={() => session.setIsShuffling(false)}
            onManualShufflePreview={() => session.setIsShuffling(true)}
            onDecideInsurance={session.handleDecideInsurance}
            onSelectHand={(handId) => session.setSelectedHandId(handId)}
          />

          <aside className="flex flex-col gap-3.5 lg:sticky lg:top-4">
            {showBettingTray ? (
              <BettingChipTray
                rules={room.rules}
                stagedBet={session.stagedBet}
                lastBet={session.lastBet}
                maxAffordableBet={session.walletBalance ?? undefined}
                isConnected={session.isConnected}
                isSubmitting={session.isSubmitting}
                onChangeStagedBet={session.setStagedBet}
                onDealRound={session.handleDealRound}
              />
            ) : session.snapshot ? (
              <ActionControlsBar
                snapshot={session.snapshot}
                activeHand={session.activeHand}
                isConnected={session.isConnected}
                isSubmitting={session.isSubmitting}
                isLeaving={session.isLeaving}
                onAction={session.handleAction}
                onStartNextRound={session.handleStartNextRound}
                onLeaveGame={handleLeaveCompletedGame}
              />
            ) : null}

            <TableRulesCard slug={room.slug} rules={room.rules} />
          </aside>
        </div>
      </div>

      <AppFooter className="relative z-10 mt-6" />
    </div>
  );
}