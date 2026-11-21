import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BACKEND_URL } from "../lib/apiClient";
import { tokenStorage } from "../lib/tokenStorage";
import type { GameActionCommand, GameErrorPayload, GameEventPayload, GameStateSnapshot, InsuranceCommand, StartRoundRequest } from "../types/game";

export interface GameStompHandlers {
  onState: (snapshot: GameStateSnapshot) => void;
  onError?: (error: GameErrorPayload) => void;
  onEvent?: (event: GameEventPayload) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onStompError?: (message: string) => void;
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export class GameStompClient {
  private client: Client | null = null;
  private subs: StompSubscription[] = [];
  private handlers: GameStompHandlers;

  constructor(handlers: GameStompHandlers) {
    this.handlers = handlers;
  }

  connect(): void {
    if (this.client?.active) {
      return;
    }

    const token = tokenStorage.getAccessToken();

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws/game`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.subscribeQueues(client);
        this.handlers.onConnect?.();
      },
      onWebSocketClose: () => {
        this.handlers.onDisconnect?.();
      },
      onStompError: (frame) => {
        this.handlers.onStompError?.(frame.headers["message"] || "WebSocket STOMP error");
      },
    });

    this.client = client;
    client.activate();
  }

  private subscribeQueues(client: Client): void {
    this.clearSubscriptions();

    const stateSub = client.subscribe("/user/queue/game.state", (msg: IMessage) => {
      if (!msg.body) return;
      const snapshot = JSON.parse(msg.body) as GameStateSnapshot;
      this.handlers.onState(snapshot);
    });

    const errorSub = client.subscribe("/user/queue/game.errors", (msg: IMessage) => {
      if (!msg.body) return;
      const errPayload = JSON.parse(msg.body) as GameErrorPayload;
      this.handlers.onError?.(errPayload);
    });

    const eventSub = client.subscribe("/user/queue/game.events", (msg: IMessage) => {
      if (!msg.body) return;
      const eventPayload = JSON.parse(msg.body) as GameEventPayload;
      this.handlers.onEvent?.(eventPayload);
    });

    this.subs = [stateSub, errorSub, eventSub];
  }

  private clearSubscriptions(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.subs = [];
  }

  subscribeToRound(roundId: string): void {
    this.publish("/app/game.subscribe", JSON.stringify(roundId));
  }

  startRound(payload: Omit<StartRoundRequest, "idempotencyKey"> & { idempotencyKey?: string }): string {
    const idempotencyKey = payload.idempotencyKey ?? createIdempotencyKey();
    const body: StartRoundRequest = {
      roomId: payload.roomId,
      betAmount: payload.betAmount,
      idempotencyKey,
    };
    this.publish("/app/game.start", JSON.stringify(body));
    return idempotencyKey;
  }

  decideInsurance(payload: Omit<InsuranceCommand, "idempotencyKey"> & { idempotencyKey?: string }): string {
    const idempotencyKey = payload.idempotencyKey ?? createIdempotencyKey();
    const body: InsuranceCommand = {
      roundId: payload.roundId,
      accept: payload.accept,
      idempotencyKey,
    };
    this.publish("/app/game.insurance", JSON.stringify(body));
    return idempotencyKey;
  }

  executeAction(payload: Omit<GameActionCommand, "idempotencyKey"> & { idempotencyKey?: string }): string {
    const idempotencyKey = payload.idempotencyKey ?? createIdempotencyKey();
    const body: GameActionCommand = {
      roundId: payload.roundId,
      handId: payload.handId ?? null,
      action: payload.action,
      idempotencyKey,
    };
    this.publish("/app/game.action", JSON.stringify(body));
    return idempotencyKey;
  }

  private publish(destination: string, body: string): void {
    if (!this.client || !this.client.connected) {
      throw new Error("WebSocket is not connected yet");
    }
    this.client.publish({ destination, body });
  }

  disconnect(): void {
    this.clearSubscriptions();
    if (this.client) {
      void this.client.deactivate();
      this.client = null;
    }
  }
}