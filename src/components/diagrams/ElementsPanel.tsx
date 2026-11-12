import { Eye, EyeOff, Lock, LockOpen, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagramPage } from "@/lib/diagram/model";

type Props = {
  page: DiagramPage;
  selectedIds: string[];
  onSelect: (nodeId: string) => void;
  onToggleLock: (nodeId: string) => void;
  onToggleHidden: (nodeId: string) => void;
  className?: string;
};

/**
 * Simple elements list (layers substitute): select, lock, show/hide.
 */
export function ElementsPanel({
  page,
  selectedIds,
  onSelect,
  onToggleLock,
  onToggleHidden,
  className,
}: Props) {
  const nodes = [...page.nodes].reverse();

  if (!nodes.length) {
    return (
      <p className={cn("px-3 py-4 text-xs text-muted-foreground", className)}>
        No shapes on this page yet.
      </p>
    );
  }

  return (
    <ul className={cn("max-h-[50vh] space-y-0.5 overflow-y-auto px-1 py-2", className)}>
      {nodes.map((node) => {
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
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                onClick={() => onSelect(node.id)}
              >
                <Square className="size-3 shrink-0 opacity-60" />
                <span className="truncate font-medium">{label}</span>
              </button>
              <button
                type="button"
                className="rounded p-1 hover:bg-background"
                title={hidden ? "Show" : "Hide"}
                onClick={() => onToggleHidden(node.id)}
              >
                {hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              </button>
              <button
                type="button"
                className="rounded p-1 hover:bg-background"
                title={node.locked ? "Unlock" : "Lock"}
                onClick={() => onToggleLock(node.id)}
              >
                {node.locked ? <Lock className="size-3" /> : <LockOpen className="size-3" />}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
