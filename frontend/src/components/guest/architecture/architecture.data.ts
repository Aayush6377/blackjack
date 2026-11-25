import { MarkerType, type Edge, type Node } from "@xyflow/react";

export const ACCENT_STYLES = {
  emerald: {
    box: "border-emerald-400/50 bg-neutral-950 shadow-lg shadow-emerald-950/40",
    eyebrow: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  rose: {
    box: "border-rose-400/50 bg-neutral-950 shadow-lg shadow-rose-950/40",
    eyebrow: "text-rose-400",
    dot: "bg-rose-400",
  },
  sky: {
    box: "border-sky-400/50 bg-neutral-950 shadow-lg shadow-sky-950/40",
    eyebrow: "text-sky-400",
    dot: "bg-sky-400",
  },
  amber: {
    box: "border-amber-400/50 bg-neutral-950 shadow-lg shadow-amber-950/40",
    eyebrow: "text-amber-400",
    dot: "bg-amber-400",
  },
};

export const MODULE_STYLES = {
  amber: "border-amber-500/25 bg-neutral-950/90 hover:border-amber-400/50",
  emerald:
    "border-emerald-500/25 bg-neutral-950/90 hover:border-emerald-400/50",
  sky: "border-sky-500/25 bg-neutral-950/90 hover:border-sky-400/50",
  neutral: "border-neutral-800 bg-neutral-950/90 hover:border-neutral-700",
};

export const MODULE_TEXT = {
  amber: "text-amber-300",
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  neutral: "text-neutral-300",
};

export const flowNodes: Node[] = [
    {
        id: "frontend",
        type: "serviceBox",
        position: { x: 20, y: 155 },
        data: {
            eyebrow: "Client Layer",
            title: "React + Vite SPA",
            description:
            "TanStack Query, Zod validation, Motion UI, REST API client & STOMP subscriber.",
            accent: "emerald",
            hasRightSource: true,
            hasRightTarget: true,
        },
    },
    {
        id: "backend-group",
        type: "backendContainer",
        position: { x: 385, y: 20 },
        style: { width: 490, height: 425 },
        data: {
            subtitle: "Modular Monolith · com.aayush.blackjack",
            title: "Spring Boot 4.1.2 Backend",
            badge: "REST + WebSocket/STOMP",
        },
    },
    {
        id: "mod-auth-user",
        type: "moduleCard",
        parentId: "backend-group",
        extent: "parent",
        draggable: false,
        position: { x: 16, y: 68 },
        style: { width: 222, height: 96 },
        data: {
            packages: "auth · security · user",
            title: "Identity & Profiles",
            detail: "JWT, OAuth2, OTP flows, roles & profile cache.",
            accent: "amber",
        },
    },
    {
        id: "mod-game-room",
        type: "moduleCard",
        parentId: "backend-group",
        extent: "parent",
        draggable: false,
        position: { x: 252, y: 68 },
        style: { width: 222, height: 96 },
        data: {
            packages: "game · room · replay",
            title: "Blackjack Table Engine",
            detail: "Shoe, moves, settlement, room rules & round replays.",
            accent: "emerald",
        },
    },
    {
        id: "mod-wallet-commerce",
        type: "moduleCard",
        parentId: "backend-group",
        extent: "parent",
        draggable: false,
        position: { x: 16, y: 178 },
        style: { width: 222, height: 96 },
        data: {
            packages: "wallet · plan · payment · coupon · reward",
            title: "Chips & Commerce",
            detail: "Chip ledger, plans, payments, coupons & daily streaks.",
            accent: "amber",
        },
    },
    {
        id: "mod-ops-support",
        type: "moduleCard",
        parentId: "backend-group",
        extent: "parent",
        draggable: false,
        position: { x: 252, y: 178 },
        style: { width: 222, height: 96 },
        data: {
            packages: "support · admin · analytics",
            title: "Support & Admin Ops",
            detail: "Tickets, resolutions, dashboard stats & audit logs.",
            accent: "sky",
        },
    },
    {
        id: "mod-infra",
        type: "moduleCard",
        parentId: "backend-group",
        extent: "parent",
        draggable: false,
        position: { x: 16, y: 288 },
        style: { width: 458, height: 118 },
        data: {
            packages: "config · common.dto · exception · media · notification",
            title: "Shared Platform & Infrastructure",
            detail:
            "Redis & STOMP config, pagination DTOs, global error handling, avatar media & notifications.",
            accent: "neutral",
        },
    },
        {
        id: "redis",
        type: "serviceBox",
        position: { x: 985, y: 78 },
        data: {
            eyebrow: "Cache Layer",
            title: "Redis Cache",
            description:
            "Caches hot reads (plans, user profiles) and fast ephemeral state with TTL.",
            accent: "rose",
            hasLeftTarget: true,
        },
    },
    {
        id: "postgres",
        type: "serviceBox",
        position: { x: 985, y: 268 },
        data: {
            eyebrow: "Primary Database",
            title: "PostgreSQL + Flyway",
            description:
            "Persists users, rooms, rounds, hands, wallet ledger, tickets & audit logs.",
            accent: "sky",
            hasLeftTarget: true,
        },
    },
];

export const flowEdges: Edge[] = [
    {
        id: "e-fe-to-be",
        source: "frontend",
        sourceHandle: "right-out",
        target: "backend-group",
        targetHandle: "rest-in",
        type: "smoothstep",
        animated: true,
        label: "REST + JWT",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#fbbf24" },
        style: { stroke: "#fbbf24", strokeWidth: 2 },
        labelStyle: { fill: "#fde68a", fontSize: 11, fontWeight: 700 },
        labelBgStyle: { fill: "#09090b", fillOpacity: 0.95 },
        labelBgPadding: [8, 5],
        labelBgBorderRadius: 6,
    },
    {
        id: "e-be-to-fe-stomp",
        source: "backend-group",
        sourceHandle: "stomp-out",
        target: "frontend",
        targetHandle: "right-in",
        type: "smoothstep",
        animated: true,
        label: "STOMP Events",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#34d399" },
        style: { stroke: "#34d399", strokeWidth: 2, strokeDasharray: "5 4" },
        labelStyle: { fill: "#a7f3d0", fontSize: 11, fontWeight: 700 },
        labelBgStyle: { fill: "#09090b", fillOpacity: 0.95 },
        labelBgPadding: [8, 5],
        labelBgBorderRadius: 6,
    },
    {
        id: "e-be-to-redis",
        source: "backend-group",
        sourceHandle: "redis-out",
        target: "redis",
        targetHandle: "left-in",
        type: "smoothstep",
        label: "Cache Get/Evict",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#fb7185" },
        style: { stroke: "#fb7185", strokeWidth: 2 },
        labelStyle: { fill: "#fecdd3", fontSize: 11, fontWeight: 700 },
        labelBgStyle: { fill: "#09090b", fillOpacity: 0.95 },
        labelBgPadding: [8, 5],
        labelBgBorderRadius: 6,
    },
    {
        id: "e-be-to-pg",
        source: "backend-group",
        sourceHandle: "pg-out",
        target: "postgres",
        targetHandle: "left-in",
        type: "smoothstep",
        label: "JPA / JDBC",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#38bdf8" },
        style: { stroke: "#38bdf8", strokeWidth: 2 },
        labelStyle: { fill: "#bae6fd", fontSize: 11, fontWeight: 700 },
        labelBgStyle: { fill: "#09090b", fillOpacity: 0.95 },
        labelBgPadding: [8, 5],
        labelBgBorderRadius: 6,
    },
];