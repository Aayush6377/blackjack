import type {
  GameActionType,
  HandOutcome,
  HandStatus,
  InsuranceStatus,
  ReplayActionItemResponse,
  ReplayCard,
  ReplayHandSnapshot,
  RoundReplayResponse,
} from "../types/replay";

export interface ReplayHandView {
  handId: string;
  handNumber: number;
  cards: ReplayCard[];
  betAmount: number;
  handValue: number;
  status: HandStatus;
  outcome: HandOutcome | null;
}

export interface ReplayTableStepState {
  stepIndex: number;
  currentAction: ReplayActionItemResponse | null;
  dealerCards: ReplayCard[];
  dealerTotal: number;
  hideHoleCard: boolean;
  hands: ReplayHandView[];
  activeHandId: string | null;
  activeBetAmount: number;
  insuranceStatus: InsuranceStatus;
  insuranceBet: number;
  isSettled: boolean;
}

export function formatActionLabel(type: GameActionType): string {
  switch (type) {
    case "ROUND_STARTED":
      return "Round Started";
    case "PLAYER_HIT":
      return "Hit";
    case "PLAYER_STAND":
      return "Stand";
    case "PLAYER_DOUBLE_DOWN":
      return "Double Down";
    case "PLAYER_SPLIT":
      return "Split Hand";
    case "PLAYER_SURRENDERED":
      return "Surrender";
    case "INSURANCE_ACCEPTED":
      return "Insurance Accepted";
    case "INSURANCE_DECLINED":
      return "Insurance Declined";
  }
}

export function formatCardShort(card: ReplayCard): string {
  if (typeof card === "string") {
    return card.trim();
  }
  if (typeof card.code === "string" && card.code.length > 0) {
    return card.code.trim();
  }
  const rank = typeof card.rank === "string" ? card.rank : "";
  const suit = typeof card.suit === "string" ? card.suit : "";
  return `${rank}${suit}`.trim() || "BACK";
}

function cardRankToken(card: ReplayCard): string {
  const code = formatCardShort(card).toUpperCase();
  if (code.length >= 2) {
    return code.slice(0, -1);
  }
  return code;
}

export function calculateBlackjackTotal(cards: ReplayCard[]): number {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    const rank = cardRankToken(card);
    if (rank === "A") {
      total += 11;
      aces += 1;
    } else if (rank === "K" || rank === "Q" || rank === "J" || rank === "10" || rank === "T") {
      total += 10;
    } else {
      const parsed = Number.parseInt(rank, 10);
      if (Number.isFinite(parsed)) {
        total += parsed;
      }
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function getSourceCardsForHand(
  handId: string,
  actionCards: ReplayCard[],
  finalHandsById: Map<string, ReplayHandSnapshot>
): ReplayCard[] {
  const finalCards = finalHandsById.get(handId)?.cards ?? [];
  if (finalCards.length >= actionCards.length && finalCards.length > 0) {
    return finalCards;
  }
  return actionCards;
}

export function buildReplayStepState(
  replay: RoundReplayResponse,
  stepIndex: number
): ReplayTableStepState {
  const clampedStep = Math.max(0, Math.min(stepIndex, replay.actions.length));
  const executedActions = replay.actions.slice(0, clampedStep);
  const currentAction =
    clampedStep > 0 ? executedActions[executedActions.length - 1] : null;

  const finalHandsById = new Map<string, ReplayHandSnapshot>();
  replay.hands.forEach((h) => finalHandsById.set(h.handId, h));

  const handsMap = new Map<string, ReplayHandView>();
  let activeHandId: string | null = null;
  let activeBetAmount = replay.round.originalBet;
  let insuranceStatus: InsuranceStatus = "NONE";
  let insuranceBet = 0;
  let roundStarted = false;

  for (const act of executedActions) {
    if (act.actionType === "ROUND_STARTED") {
      roundStarted = true;
      const betFromData =
        typeof act.actionData?.betAmount === "number"
          ? act.actionData.betAmount
          : replay.round.originalBet;
      activeBetAmount = betFromData;

      if (act.handId) {
        const sourceCards = getSourceCardsForHand(
          act.handId,
          act.handCards ?? [],
          finalHandsById
        );
        // Deal only the initial 2 cards on ROUND_STARTED
        const initialCards = sourceCards.slice(0, 2);

        handsMap.set(act.handId, {
          handId: act.handId,
          handNumber: act.handNumber ?? 1,
          cards: initialCards,
          betAmount: act.handBetAmount ?? betFromData,
          handValue: calculateBlackjackTotal(initialCards),
          status: "ACTIVE",
          outcome: null,
        });
        activeHandId = act.handId;
      }
      continue;
    }

    if (act.actionType === "INSURANCE_ACCEPTED") {
      insuranceStatus = "ACCEPTED";
      insuranceBet =
        replay.round.insuranceBet || Math.floor(replay.round.originalBet / 2);
      continue;
    }

    if (act.actionType === "INSURANCE_DECLINED") {
      insuranceStatus = "DECLINED";
      insuranceBet = 0;
      continue;
    }

    if (act.handId) {
      const existing = handsMap.get(act.handId) ?? {
        handId: act.handId,
        handNumber: act.handNumber ?? handsMap.size + 1,
        cards: [],
        betAmount: act.handBetAmount ?? replay.round.originalBet,
        handValue: 0,
        status: "ACTIVE" as HandStatus,
        outcome: null,
      };

      const sourceCards = getSourceCardsForHand(
        act.handId,
        act.handCards ?? [],
        finalHandsById
      );

      let nextCards = existing.cards;
      let nextStatus: HandStatus = existing.status;

      if (act.actionType === "PLAYER_HIT" || act.actionType === "PLAYER_DOUBLE_DOWN") {
        // Reveal one additional card per HIT / DOUBLE_DOWN step
        const nextCount = Math.min(sourceCards.length, existing.cards.length + 1);
        nextCards = sourceCards.slice(0, nextCount);
        const liveTotal = calculateBlackjackTotal(nextCards);
        nextStatus = liveTotal > 21 ? "BUSTED" : "ACTIVE";
      } else if (act.actionType === "PLAYER_STAND") {
        nextStatus = "STOOD";
      } else if (act.actionType === "PLAYER_SURRENDERED") {
        nextStatus = "SURRENDERED";
      } else if (act.actionType === "PLAYER_SPLIT") {
        // Split each hand to its first card, then draw second card on primary hand
        const splitCards = sourceCards.slice(0, 1);
        nextCards = splitCards;
        nextStatus = "ACTIVE";

        replay.hands.forEach((fh) => {
          if (!handsMap.has(fh.handId)) {
            const secondHandCards = fh.cards.slice(0, 1);
            handsMap.set(fh.handId, {
              handId: fh.handId,
              handNumber: fh.handNumber,
              cards: secondHandCards,
              betAmount: fh.betAmount,
              handValue: calculateBlackjackTotal(secondHandCards),
              status: "ACTIVE",
              outcome: null,
            });
          }
        });
      }

      const nextBet =
        act.handBetAmount ??
        (act.actionType === "PLAYER_DOUBLE_DOWN"
          ? existing.betAmount * 2
          : existing.betAmount);

      handsMap.set(act.handId, {
        ...existing,
        cards: nextCards,
        betAmount: nextBet,
        handValue: calculateBlackjackTotal(nextCards),
        status: nextStatus,
        outcome: null,
      });

      activeHandId = act.handId;
      activeBetAmount = nextBet;
    }
  }

  const orderedHands = Array.from(handsMap.values()).sort(
    (a, b) => a.handNumber - b.handNumber
  );

  const isAtEnd = clampedStep === replay.actions.length && replay.actions.length > 0;
  const allHandsFinished =
    orderedHands.length > 0 &&
    orderedHands.every((h) => h.status !== "ACTIVE");

  const revealDealerFull = isAtEnd || allHandsFinished;

  let dealerCards: ReplayCard[] = [];
  let dealerTotal = 0;

  if (!roundStarted) {
    dealerCards = [];
    dealerTotal = 0;
  } else if (revealDealerFull) {
    dealerCards = replay.round.dealerCards;
    dealerTotal = replay.round.dealerTotal;
  } else {
    // Show upcard + face-down hole card until hands finish / round settles
    dealerCards = replay.round.dealerCards.slice(0, 2);
    dealerTotal = calculateBlackjackTotal(dealerCards.slice(0, 1));
  }

  const hideHoleCard = roundStarted && !revealDealerFull && dealerCards.length >= 2;

  const finalizedHands: ReplayHandView[] = orderedHands.map((h) => {
    if (!revealDealerFull) return h;
    const finalSnap = finalHandsById.get(h.handId);
    if (!finalSnap) return h;
    return {
      ...h,
      cards: finalSnap.cards,
      betAmount: finalSnap.betAmount,
      handValue: finalSnap.handValue,
      status: finalSnap.status,
      outcome: finalSnap.outcome,
    };
  });

  if (revealDealerFull) {
    finalizedHands.forEach((h) => {
      if (h.handId === activeHandId) {
        activeBetAmount = h.betAmount;
      }
    });
  }

  return {
    stepIndex: clampedStep,
    currentAction,
    dealerCards,
    dealerTotal,
    hideHoleCard,
    hands: finalizedHands,
    activeHandId,
    activeBetAmount,
    insuranceStatus,
    insuranceBet,
    isSettled: revealDealerFull,
  };
}