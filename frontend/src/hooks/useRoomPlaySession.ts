import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { gameKeys, roomKeys, useActiveGame, useLeaveGame } from "./useRooms";
import { GameStompClient } from "../services/gameStompClient";
import type { GameStateSnapshot, HandSnapshot, PlayerActionType } from "../types/game";
import type { RoomSummary } from "../types/room";
import { soundEffects } from "../utils/soundEffects";

interface UseRoomPlaySessionOptions {
  room: RoomSummary | null;
  roomId?: string;
  initialRoundId?: string;
}

export function useRoomPlaySession({
  room,
  roomId,
  initialRoundId,
}: UseRoomPlaySessionOptions) {
  const queryClient = useQueryClient();
  const { walletBalance, setWalletBalanceFromSnapshot } = useAuth();
  const { data: initialActiveGame } = useActiveGame();
  const leaveGameMutation = useLeaveGame();

  const [snapshot, setSnapshot] = useState<GameStateSnapshot | null>(null);
  const [stagedBet, setStagedBet] = useState<number>(0);
  const [lastBet, setLastBet] = useState<number>(0);
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [prevDealerCount, setPrevDealerCount] = useState<number>(0);
  const [prevHandCardCounts, setPrevHandCardCounts] = useState<Record<string, number>>({});

  const stompRef = useRef<GameStompClient | null>(null);
  const snapshotRef = useRef<GameStateSnapshot | null>(null);
  const prevStatusRef = useRef<GameStateSnapshot["roundStatus"] | null>(null);
  const hasInitializedRoomRef = useRef<string | null>(null);
  const hasSeededActiveRef = useRef<boolean>(false);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (!room || hasInitializedRoomRef.current === room.id) return;
    hasInitializedRoomRef.current = room.id;
    setStagedBet(0);
    setIsShuffling(true);
  }, [room]);

  useEffect(() => {
    if (hasSeededActiveRef.current) return;
    if (initialActiveGame && (!roomId || initialActiveGame.roomId === roomId)) {
      hasSeededActiveRef.current = true;
      setSnapshot(initialActiveGame);
      prevStatusRef.current = initialActiveGame.roundStatus;
      setWalletBalanceFromSnapshot(initialActiveGame.walletBalance);
    }
  }, [initialActiveGame, roomId, setWalletBalanceFromSnapshot]);

  const handleStateUpdate = useCallback(
    (nextSnap: GameStateSnapshot) => {
      const prev = snapshotRef.current;

      setWalletBalanceFromSnapshot(nextSnap.walletBalance);
      setPrevDealerCount(prev?.dealerCards.length ?? 0);

      const countsMap: Record<string, number> = {};
      for (const h of nextSnap.hands) {
        const prevHand = prev?.hands.find((ph) => ph.handId === h.handId);
        countsMap[h.handId] = prevHand ? prevHand.cards.length : 0;
      }
      setPrevHandCardCounts(countsMap);

      const firstActive = nextSnap.hands.find(
        (h) => h.status === "ACTIVE" && h.handValue < 21
      );
      setSelectedHandId((currentSelected) => {
        if (
          currentSelected &&
          nextSnap.hands.some(
            (h) => h.handId === currentSelected && h.status === "ACTIVE" && h.handValue < 21
          )
        ) {
          return currentSelected;
        }
        return firstActive?.handId ?? nextSnap.hands[0]?.handId ?? null;
      });

      if (prevStatusRef.current !== "COMPLETED" && nextSnap.roundStatus === "COMPLETED") {
        const anyBlackjack = nextSnap.hands.some((h) => h.outcome === "BLACKJACK_WIN");
        if (anyBlackjack) {
          soundEffects.play("blackjack");
        } else if (nextSnap.netResult > 0) {
          soundEffects.play("win");
        } else if (nextSnap.roundOutcome === "PUSH" || nextSnap.netResult === 0) {
          soundEffects.play("push");
        } else {
          soundEffects.play("lose");
        }

        void queryClient.invalidateQueries({ queryKey: roomKeys.all });
        void queryClient.invalidateQueries({ queryKey: gameKeys.active });
      }

      prevStatusRef.current = nextSnap.roundStatus;
      snapshotRef.current = nextSnap;
      setSnapshot(nextSnap);
      setIsSubmitting(false);
      setErrorNotice(null);
    },
    [queryClient, setWalletBalanceFromSnapshot]
  );

  useEffect(() => {
    const client = new GameStompClient({
      onConnect: () => {
        setIsConnected(true);
        setErrorNotice(null);
        const targetRoundId =
          initialRoundId ??
          (snapshotRef.current && snapshotRef.current.roomId === roomId
            ? snapshotRef.current.roundId
            : null);
        if (targetRoundId) {
          try {
            client.subscribeToRound(targetRoundId);
          } catch {
            // Socket not ready yet
          }
        }
      },
      onDisconnect: () => setIsConnected(false),
      onState: handleStateUpdate,
      onError: (err) => {
        setIsSubmitting(false);
        setErrorNotice(err.message || "Game action could not be completed");
      },
      onEvent: (ev) => {
        if (ev.type === "CONTROLLER_TRANSFERRED" && ev.message) {
          setBannerNotice(ev.message);
        }
      },
      onStompError: (msg) => {
        setIsSubmitting(false);
        setErrorNotice(msg);
      },
    });

    stompRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      stompRef.current = null;
    };
  }, [handleStateUpdate, initialRoundId, roomId]);

  const handleDealRound = (betAmount: number) => {
    if (!room || !stompRef.current || betAmount <= 0) return;
    setErrorNotice(null);
    setBannerNotice(null);
    setIsSubmitting(true);
    setLastBet(betAmount);
    try {
      stompRef.current.startRound({ roomId: room.id, betAmount });
    } catch (err) {
      setIsSubmitting(false);
      setErrorNotice(err instanceof Error ? err.message : "Failed to start round");
    }
  };

  const handleDecideInsurance = (accept: boolean) => {
    if (!snapshot || !stompRef.current) return;
    setErrorNotice(null);
    setIsSubmitting(true);
    try {
      stompRef.current.decideInsurance({ roundId: snapshot.roundId, accept });
    } catch (err) {
      setIsSubmitting(false);
      setErrorNotice(err instanceof Error ? err.message : "Insurance decision failed");
    }
  };

  const handleAction = (action: PlayerActionType, handId?: string) => {
    if (!snapshot || !stompRef.current) return;
    setErrorNotice(null);
    setIsSubmitting(true);
    try {
      stompRef.current.executeAction({
        roundId: snapshot.roundId,
        handId: handId ?? selectedHandId,
        action,
      });
    } catch (err) {
      setIsSubmitting(false);
      setErrorNotice(err instanceof Error ? err.message : "Failed to send player action");
    }
  };

  const handleStartNextRound = () => {
    snapshotRef.current = null;
    setSnapshot(null);
    setStagedBet(0);
    setPrevDealerCount(0);
    setPrevHandCardCounts({});
    setSelectedHandId(null);
    setErrorNotice(null);
    prevStatusRef.current = null;
  };

  const activeHand: HandSnapshot | null = useMemo(() => {
    if (!snapshot || snapshot.hands.length === 0) return null;
    if (selectedHandId) {
      const found = snapshot.hands.find((h) => h.handId === selectedHandId);
      if (found) return found;
    }
    return (
      snapshot.hands.find((h) => h.status === "ACTIVE" && h.handValue < 21) ??
      snapshot.hands.find((h) => h.status === "ACTIVE") ??
      snapshot.hands[0]
    );
  }, [snapshot, selectedHandId]);

  return {
    walletBalance,
    snapshot,
    activeHand,
    stagedBet,
    lastBet,
    isConnected,
    isSubmitting,
    isShuffling,
    isLeaving: leaveGameMutation.isPending,
    bannerNotice,
    errorNotice,
    prevDealerCount,
    prevHandCardCounts,
    leaveGameMutation,
    setStagedBet,
    setSelectedHandId,
    setIsShuffling,
    setBannerNotice,
    setErrorNotice,
    handleDealRound,
    handleDecideInsurance,
    handleAction,
    handleStartNextRound,
  };
}