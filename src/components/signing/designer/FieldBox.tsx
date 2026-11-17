import { memo, useCallback, useRef } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIELD_META } from "@/lib/signing/fieldMeta";
import type { SignRecipient } from "@/lib/signing/types";
import type { DesignerField } from "./useFieldDesigner";

/** The eight resize handles, and which edges each one drives. */
const HANDLES = [
  { id: "nw", className: "-left-1 -top-1 cursor-nwse-resize", dx: -1, dy: -1 },
  { id: "n", className: "left-1/2 -top-1 -translate-x-1/2 cursor-ns-resize", dx: 0, dy: -1 },
  { id: "ne", className: "-right-1 -top-1 cursor-nesw-resize", dx: 1, dy: -1 },
  { id: "e", className: "-right-1 top-1/2 -translate-y-1/2 cursor-ew-resize", dx: 1, dy: 0 },
  { id: "se", className: "-right-1 -bottom-1 cursor-nwse-resize", dx: 1, dy: 1 },
  { id: "s", className: "left-1/2 -bottom-1 -translate-x-1/2 cursor-ns-resize", dx: 0, dy: 1 },
  { id: "sw", className: "-left-1 -bottom-1 cursor-nesw-resize", dx: -1, dy: 1 },
  { id: "w", className: "-left-1 top-1/2 -translate-y-1/2 cursor-ew-resize", dx: -1, dy: 0 },
] as const;

/** Below this, a field is too small to click or to render text into. */
const MIN_SIZE = 0.012;

interface FieldBoxProps {
  field: DesignerField;
  recipient: SignRecipient | undefined;
  isSelected: boolean;
  /** Rendered page size in CSS pixels — converts fractions to pixels. */
  pageWidth: number;
  pageHeight: number;
  readOnly: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onBeginTransaction: () => void;
  onMove: (dx: number, dy: number, transient: boolean) => void;
  onResize: (id: string, patch: Partial<DesignerField>, transient: boolean) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

function FieldBoxImpl({
  field,
  recipient,
  isSelected,
  pageWidth,
  pageHeight,
  readOnly,
  onSelect,
  onBeginTransaction,
  onMove,
  onResize,
  onContextMenu,
}: FieldBoxProps) {
  const dragState = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const meta = FIELD_META[field.type];
  const Icon = meta.icon;

  // Unassigned fields render grey: a field nobody has to fill is a mistake the
  // owner needs to see, not a neutral state.
  const color = recipient?.color ?? "#94a3b8";

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (readOnly || field.locked) return;
      // Left button only — right-click opens the context menu.
      if (e.button !== 0) return;
      e.stopPropagation(); // don't let the page's click-to-deselect fire

      onSelect(field.id, e.shiftKey || e.metaKey || e.ctrlKey);

      // History is NOT opened here. A pointerdown that never moves is just a
      // click, and snapshotting it would leave a no-op step on the undo stack —
      // the user would press Ctrl+Z and see nothing happen. The snapshot is
      // taken below, once the pointer has actually travelled far enough to
      // count as a drag.
      dragState.current = { startX: e.clientX, startY: e.clientY, moved: false };
      // Pointer capture keeps events coming even when the cursor outruns the
      // box (fast drags) or leaves the window entirely.
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [readOnly, field.locked, field.id, onSelect]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = dragState.current;
      if (!state) return;

      const dxPx = e.clientX - state.startX;
      const dyPx = e.clientY - state.startY;
      // A few pixels of slack so a click with a shaky hand isn't a drag.
      if (!state.moved && Math.abs(dxPx) < 3 && Math.abs(dyPx) < 3) return;

      // Open the history entry exactly once, on the first real movement. Every
      // subsequent move is transient, so the whole drag collapses into a single
      // undo step rather than one per pointermove.
      if (!state.moved) onBeginTransaction();
      state.moved = true;

      // Deltas are converted to page fractions using the CURRENT rendered size,
      // so a drag tracks the cursor identically at 50% and 400% zoom.
      onMove(dxPx / pageWidth, dyPx / pageHeight, true);
      state.startX = e.clientX;
      state.startY = e.clientY;
    },
    [onMove, onBeginTransaction, pageWidth, pageHeight]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragState.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    // Nothing to commit: the pre-drag snapshot was taken on first movement and
    // the transient moves already left `present` at the final position. Applying
    // a no-op "commit" here would push a second, identical history entry and
    // make Ctrl+Z require two presses.
  }, []);

  const startResize = useCallback(
    (e: React.PointerEvent, handle: (typeof HANDLES)[number]) => {
      if (readOnly || field.locked) return;
      e.stopPropagation();
      e.preventDefault();

      // The pointer origin (client PIXELS) and the field origin (page
      // FRACTIONS) are deliberately separate objects. Spreading the field over
      // {x, y} would silently clobber the pixel coordinates with fractions and
      // make every delta below nonsense.
      const pointerOrigin = { x: e.clientX, y: e.clientY };
      const origin = { x: field.x, y: field.y, width: field.width, height: field.height };
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      let opened = false;

      const onMoveResize = (ev: PointerEvent) => {
        const dx = (ev.clientX - pointerOrigin.x) / pageWidth;
        const dy = (ev.clientY - pointerOrigin.y) / pageHeight;

        // As with dragging: snapshot once, on the first actual movement.
        if (!opened) {
          onBeginTransaction();
          opened = true;
        }

        let { x, y, width, height } = origin;

        // A west/north handle moves the origin AND shrinks the box; an
        // east/south handle only changes the size.
        if (handle.dx === 1) width = Math.max(MIN_SIZE, origin.width + dx);
        if (handle.dx === -1) {
          width = Math.max(MIN_SIZE, origin.width - dx);
          x = origin.x + (origin.width - width);
        }
        if (handle.dy === 1) height = Math.max(MIN_SIZE, origin.height + dy);
        if (handle.dy === -1) {
          height = Math.max(MIN_SIZE, origin.height - dy);
          y = origin.y + (origin.height - height);
        }

        onResize(field.id, { x, y, width, height }, true);
      };

      const onUpResize = () => {
        window.removeEventListener("pointermove", onMoveResize);
        window.removeEventListener("pointerup", onUpResize);
        // No commit — see handlePointerUp. An empty patch would still produce a
        // new object, registering as a change and duplicating the history entry.
      };

      window.addEventListener("pointermove", onMoveResize);
      window.addEventListener("pointerup", onUpResize);
    },
    [readOnly, field, pageWidth, pageHeight, onResize, onBeginTransaction]
  );

  const widthPx = field.width * pageWidth;
  const heightPx = field.height * pageHeight;
  // Below ~28px the icon+label collide; show the icon alone.
  const compact = widthPx < 64 || heightPx < 24;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${meta.label} field${recipient ? ` for ${recipient.name}` : ", unassigned"}${field.required ? ", required" : ""}${field.locked ? ", locked" : ""}`}
      aria-pressed={isSelected}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => onContextMenu(e, field.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(field.id, false);
        }
      }}
      className={cn(
        "group absolute flex items-center justify-center gap-1 rounded-[2px] text-[11px] font-medium select-none",
        readOnly || field.locked ? "cursor-default" : "cursor-move",
        isSelected ? "z-20" : "z-10",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      )}
      style={{
        left: `${field.x * 100}%`,
        top: `${field.y * 100}%`,
        width: `${field.width * 100}%`,
        height: `${field.height * 100}%`,
        backgroundColor: field.recipientId ? `${color}14` : `${color}0a`,
        border: `1px solid ${color}`,
        boxShadow: isSelected ? `0 0 0 1px ${color}` : undefined,
        borderLeftWidth: field.recipientId ? 1 : 3,
        color,
      }}
    >
      {!compact && <Icon className="size-3 shrink-0 opacity-80" aria-hidden="true" />}
      {compact ? (
        <Icon className="size-3 shrink-0 opacity-80" aria-hidden="true" />
      ) : (
        <span className="truncate px-0.5 opacity-90">{field.label || meta.label}</span>
      )}

      {field.required && (
        <span className="absolute right-0.5 top-0 text-[9px] font-bold leading-none text-destructive" aria-hidden="true">
          *
        </span>
      )}
      {field.locked && (
        <Lock className="absolute left-0.5 top-0.5 size-2.5 text-current opacity-70" aria-hidden="true" />
      )}

      {isSelected && !readOnly && !field.locked &&
        HANDLES.map((handle) => (
          <span
            key={handle.id}
            onPointerDown={(e) => startResize(e, handle)}
            className={cn("absolute size-1.5 border border-white", handle.className)}
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        ))}
    </div>
  );
}

export const FieldBox = memo(FieldBoxImpl);
