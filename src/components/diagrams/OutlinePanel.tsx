import { useEffect, useRef } from "react";
import type { DiagramCanvasHandle } from "@/components/diagrams/DiagramCanvas";
import { cn } from "@/lib/utils";

type Props = {
  canvasRef: React.RefObject<DiagramCanvasHandle | null>;
  open: boolean;
  className?: string;
};

/**
 * Mini-map outline (draw.io Outline dialog): click to pan the main viewport.
 */
export function OutlinePanel({ canvasRef, open, className }: Props) {
  const canvasEl = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const paint = () => {
      const graph = canvasRef.current?.getGraph();
      const dest = canvasEl.current;
      if (!graph || !dest) {
        raf = requestAnimationFrame(paint);
        return;
      }
      const bounds = graph.getGraphBounds();
      const w = dest.width;
      const h = dest.height;
      const ctx = dest.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, w, h);
      const bw = Math.max(1, bounds.width);
      const bh = Math.max(1, bounds.height);
      const scale = Math.min(w / bw, h / bh) * 0.9;
      const ox = (w - bw * scale) / 2 - bounds.x * scale;
      const oy = (h - bh * scale) / 2 - bounds.y * scale;

      const parent = graph.getDefaultParent();
      const cells = graph.getChildVertices(parent);
      ctx.strokeStyle = "#94a3b8";
      ctx.fillStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (const cell of cells) {
        if (!cell.isVisible()) continue;
        const geo = cell.getGeometry();
        if (!geo) continue;
        const x = geo.x * scale + ox;
        const y = geo.y * scale + oy;
        const cw = geo.width * scale;
        const ch = geo.height * scale;
        ctx.fillRect(x, y, cw, ch);
        ctx.strokeRect(x, y, cw, ch);
      }

      // Viewport rectangle
      const container = graph.container;
      if (container) {
        const view = graph.getView();
        const scaleG = view.getScale();
        const tx = view.getTranslate().x;
        const ty = view.getTranslate().y;
        const vx = (-tx / scaleG) * scale + ox;
        const vy = (-ty / scaleG) * scale + oy;
        const vw = (container.clientWidth / scaleG) * scale;
        const vh = (container.clientHeight / scaleG) * scale;
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(vx, vy, vw, vh);
      }

      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [open, canvasRef]);

  if (!open) return null;

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const graph = canvasRef.current?.getGraph();
    const dest = canvasEl.current;
    if (!graph || !dest) return;
    const bounds = graph.getGraphBounds();
    const w = dest.width;
    const h = dest.height;
    const bw = Math.max(1, bounds.width);
    const bh = Math.max(1, bounds.height);
    const scale = Math.min(w / bw, h / bh) * 0.9;
    const ox = (w - bw * scale) / 2 - bounds.x * scale;
    const oy = (h - bh * scale) / 2 - bounds.y * scale;
    const rect = dest.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const gx = (mx - ox) / scale;
    const gy = (my - oy) / scale;
    const view = graph.getView();
    const s = view.getScale();
    const container = graph.container;
    if (!container) return;
    const tx = container.clientWidth / (2 * s) - gx;
    const ty = container.clientHeight / (2 * s) - gy;
    view.setTranslate(tx, ty);
  };

  return (
    <div
      className={cn(
        "absolute bottom-3 left-3 z-20 overflow-hidden rounded-md border border-[#cfd8e3] bg-white shadow-md",
        className
      )}
    >
      <div className="border-b border-[#e2e8f0] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
        Outline
      </div>
      <canvas
        ref={canvasEl}
        width={180}
        height={120}
        className="block cursor-crosshair"
        onClick={onClick}
      />
    </div>
  );
}
