import { useEffect, useMemo, useRef, useState } from "react";
import { diagramsApi, type PresencePeer } from "@/services/diagramsApi";
import type { DiagramCanvasHandle } from "@/components/diagrams/DiagramCanvas";
import { cn } from "@/lib/utils";

type Props = {
  token: string;
  canvasRef: React.RefObject<DiagramCanvasHandle | null>;
  enabled?: boolean;
  className?: string;
};

function clientId(): string {
  const key = "vigodesk.diagram.presenceClientId";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Poll-based live cursors for EDIT share links (draw.io / Lucid-style presence).
 */
export function PresenceCursors({ token, canvasRef, enabled = true, className }: Props) {
  const id = useMemo(() => clientId(), []);
  const [peers, setPeers] = useState<PresencePeer[]>([]);
  const posRef = useRef({ x: 0, y: 0 });
  const name = useMemo(() => {
    try {
      return localStorage.getItem("vigodesk.diagram.presenceName") || "Guest";
    } catch {
      return "Guest";
    }
  }, []);

  useEffect(() => {
    if (!enabled || !token) return;

    const onMove = (e: MouseEvent) => {
      const host = canvasRef.current?.getGraph()?.container;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      posRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove);

    const tick = async () => {
      try {
        const graph = canvasRef.current?.getGraph();
        const selectionIds =
          graph
            ?.getSelectionCells()
            .map((c) => c.getId())
            .filter(Boolean) as string[] | undefined;
        const res = await diagramsApi.presenceHeartbeat(token, {
          clientId: id,
          name,
          x: posRef.current.x,
          y: posRef.current.y,
          selectionIds,
        });
        setPeers(res.peers);
      } catch {
        /* ignore transient */
      }
    };

    void tick();
    const timer = window.setInterval(() => void tick(), 1500);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.clearInterval(timer);
      void diagramsApi.presenceLeave(token, id);
    };
  }, [enabled, token, canvasRef, id, name]);

  if (!enabled || !peers.length) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-40 overflow-hidden", className)}>
      {peers.map((peer) => (
        <div
          key={peer.clientId}
          className="absolute -translate-x-1 -translate-y-1 transition-transform duration-150"
          style={{ left: peer.x, top: peer.y }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" className="drop-shadow">
            <path
              d="M1 1 L1 17 L5.5 13.5 L8.5 19 L11 17.5 L8 12 L14 12 Z"
              fill={peer.color}
              stroke="#fff"
              strokeWidth="1"
            />
          </svg>
          <span
            className="ml-3 -mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow"
            style={{ background: peer.color }}
          >
            {peer.name}
          </span>
        </div>
      ))}
    </div>
  );
}
