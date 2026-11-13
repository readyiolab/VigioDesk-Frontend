import { Eye, EyeOff, Lock, LockOpen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagramLayer, DiagramPage } from "@/lib/diagram/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  page: DiagramPage;
  selectedIds: string[];
  onSelect: (nodeId: string) => void;
  onToggleLock: (nodeId: string) => void;
  onToggleHidden: (nodeId: string) => void;
  onAddLayer?: () => void;
  onRemoveLayer?: (layerId: string) => void;
  onRenameLayer?: (layerId: string, name: string) => void;
  onToggleLayerVisible?: (layerId: string) => void;
  onToggleLayerLocked?: (layerId: string) => void;
  onSelectLayer?: (layerId: string) => void;
  onMoveNodeToLayer?: (nodeId: string, layerId: string) => void;
  className?: string;
};

/**
 * Named layers (draw.io-style) plus per-element list within the active layer.
 */
export function LayersPanel({
  page,
  selectedIds,
  onSelect,
  onToggleLock,
  onToggleHidden,
  onAddLayer,
  onRemoveLayer,
  onRenameLayer,
  onToggleLayerVisible,
  onToggleLayerLocked,
  onSelectLayer,
  className,
}: Props) {
  const layers: DiagramLayer[] =
    page.layers?.length
      ? page.layers
      : [{ id: "layer-default", name: "Background", visible: true, locked: false }];
  const activeLayerId = page.activeLayerId ?? layers[0]!.id;
  const nodes = [...page.nodes]
    .filter((n) => (n.layerId ?? layers[0]!.id) === activeLayerId)
    .reverse();

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-1 border-b border-[#e2e8f0] px-2 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
          Layers
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          title="Add layer"
          onClick={() => onAddLayer?.()}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <ul className="max-h-[40%] space-y-0.5 overflow-y-auto border-b border-[#e2e8f0] px-1 py-1.5">
        {layers.map((layer) => {
          const active = layer.id === activeLayerId;
          return (
            <li key={layer.id}>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-1 text-xs",
                  active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left font-medium"
                  onClick={() => onSelectLayer?.(layer.id)}
                >
                  {layer.name}
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-background"
                  title={layer.visible ? "Hide layer" : "Show layer"}
                  onClick={() => onToggleLayerVisible?.(layer.id)}
                >
                  {layer.visible !== false ? (
                    <Eye className="size-3 opacity-70" />
                  ) : (
                    <EyeOff className="size-3 opacity-70" />
                  )}
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-background"
                  title={layer.locked ? "Unlock layer" : "Lock layer"}
                  onClick={() => onToggleLayerLocked?.(layer.id)}
                >
                  {layer.locked ? (
                    <Lock className="size-3 opacity-70" />
                  ) : (
                    <LockOpen className="size-3 opacity-70" />
                  )}
                </button>
                {layers.length > 1 ? (
                  <button
                    type="button"
                    className="rounded p-1 hover:bg-background"
                    title="Delete layer"
                    onClick={() => onRemoveLayer?.(layer.id)}
                  >
                    <Trash2 className="size-3 opacity-70" />
                  </button>
                ) : null}
              </div>
              {active ? (
                <Input
                  className="mb-1 mt-0.5 h-7 rounded-md text-[11px]"
                  value={layer.name}
                  onChange={(e) => onRenameLayer?.(layer.id, e.target.value)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        Elements
      </p>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1 pb-2">
        {!nodes.length ? (
          <li className="px-2 py-3 text-xs text-muted-foreground">No shapes on this layer.</li>
        ) : (
          nodes.map((node) => {
            const selected = selectedIds.includes(node.id);
            const hidden = Boolean(node.hidden);
            const label = (node.label || node.shape || "Shape").trim() || "Shape";
            return (
              <li key={node.id}>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-md px-1.5 py-1 text-xs",
                    selected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left font-medium"
                    onClick={() => onSelect(node.id)}
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 hover:bg-background"
                    title={hidden ? "Show" : "Hide"}
                    onClick={() => onToggleHidden(node.id)}
                  >
                    {hidden ? (
                      <EyeOff className="size-3 opacity-70" />
                    ) : (
                      <Eye className="size-3 opacity-70" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 hover:bg-background"
                    title={node.locked ? "Unlock" : "Lock"}
                    onClick={() => onToggleLock(node.id)}
                  >
                    {node.locked ? (
                      <Lock className="size-3 opacity-70" />
                    ) : (
                      <LockOpen className="size-3 opacity-70" />
                    )}
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
