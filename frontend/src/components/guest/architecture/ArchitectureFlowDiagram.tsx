import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ACCENT_STYLES, flowEdges, flowNodes, MODULE_STYLES, MODULE_TEXT } from "./architecture.data";

interface ServiceNodeData extends Record<string, unknown> {
  eyebrow: string;
  title: string;
  description: string;
  accent: "emerald" | "rose" | "sky" | "amber";
  hasLeftTarget?: boolean;
  hasRightSource?: boolean;
  hasLeftSource?: boolean;
  hasRightTarget?: boolean;
}

interface ModuleNodeData extends Record<string, unknown> {
  packages: string;
  title: string;
  detail: string;
  accent: "amber" | "emerald" | "sky" | "neutral";
}

interface BackendGroupData extends Record<string, unknown> {
  title: string;
  subtitle: string;
  badge: string;
}

const HANDLE_HIDDEN = "!h-2 !w-2 !min-w-0 !border-0 !bg-transparent !opacity-0";

function ServiceBoxNode({ data }: NodeProps<Node<ServiceNodeData>>) {
  const styles = ACCENT_STYLES[data.accent];

  return (
    <div
      className={`w-56 rounded-2xl border p-4 text-left transition ${styles.box}`}
    >
      {data.hasLeftTarget && (
        <Handle
          type="target"
          id="left-in"
          position={Position.Left}
          className={HANDLE_HIDDEN}
        />
      )}
      {data.hasLeftSource && (
        <Handle
          type="source"
          id="left-out"
          position={Position.Left}
          className={HANDLE_HIDDEN}
        />
      )}
      {data.hasRightSource && (
        <Handle
          type="source"
          id="right-out"
          position={Position.Right}
          className={HANDLE_HIDDEN}
        />
      )}
      {data.hasRightTarget && (
        <Handle
          type="target"
          id="right-in"
          position={Position.Right}
          className={HANDLE_HIDDEN}
        />
      )}

      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-widest ${styles.eyebrow}`}
        >
          {data.eyebrow}
        </span>
      </div>

      <div className="mt-1.5 text-sm font-bold text-white">{data.title}</div>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
        {data.description}
      </p>
    </div>
  );
}

function BackendContainerNode({ data }: NodeProps<Node<BackendGroupData>>) {
  return (
    <div className="h-full w-full rounded-2xl border border-amber-400/40 bg-neutral-900/75 p-4 shadow-2xl shadow-black/60 backdrop-blur-xs">
      <Handle
        type="target"
        id="rest-in"
        position={Position.Left}
        style={{ top: "28%" }}
        className={HANDLE_HIDDEN}
      />
      <Handle
        type="source"
        id="stomp-out"
        position={Position.Left}
        style={{ top: "72%" }}
        className={HANDLE_HIDDEN}
      />
      <Handle
        type="source"
        id="redis-out"
        position={Position.Right}
        style={{ top: "28%" }}
        className={HANDLE_HIDDEN}
      />
      <Handle
        type="source"
        id="pg-out"
        position={Position.Right}
        style={{ top: "72%" }}
        className={HANDLE_HIDDEN}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/90 pb-2.5">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
            {data.subtitle}
          </div>
          <div className="text-sm font-bold text-white">{data.title}</div>
        </div>
        <span className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-amber-300">
          {data.badge}
        </span>
      </div>
    </div>
  );
}

function ModuleCardNode({ data }: NodeProps<Node<ModuleNodeData>>) {
  return (
    <div
      className={`h-full w-full rounded-xl border p-3 text-left transition ${MODULE_STYLES[data.accent]}`}
    >
      <div
        className={`truncate font-mono text-[10px] font-bold ${MODULE_TEXT[data.accent]}`}
      >
        {data.packages}
      </div>
      <div className="mt-0.5 text-xs font-bold text-white">{data.title}</div>
      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-400">
        {data.detail}
      </p>
    </div>
  );
}

const NODE_TYPES = {
  serviceBox: ServiceBoxNode,
  backendContainer: BackendContainerNode,
  moduleCard: ModuleCardNode,
};

export function ArchitectureFlowDiagram() {
  const { nodes, edges } = useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
    return { nodes: flowNodes, edges: flowEdges };
  }, []);

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-4 shadow-2xl shadow-black/40 sm:p-6">
      <div className="mb-4 flex flex-col justify-between gap-2 border-b border-neutral-800/80 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            High-Level Architecture (HLL)
          </div>
          <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
            Frontend, Spring Boot Backend, Redis &amp; PostgreSQL Flow
          </h2>
        </div>
        <span className="w-fit rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 font-mono text-[11px] text-neutral-400">
          Drag nodes or zoom with controls
        </span>
      </div>

      <div className="h-[500px] w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/95">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.14 }}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color="#27272a"
          />
          <Controls
            showInteractive={false}
            className="!border-neutral-800 !bg-neutral-900 !text-neutral-200 [&>button]:!border-neutral-800 [&>button]:!bg-neutral-900 [&>button]:!text-neutral-200 hover:[&>button]:!bg-neutral-800"
          />
        </ReactFlow>
      </div>
    </section>
  );
}