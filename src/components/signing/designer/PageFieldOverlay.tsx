import { memo, useState } from "react";
import { cn } from "@/lib/utils";
import type { SignFieldType, SignRecipient } from "@/lib/signing/types";
import { FieldBox } from "./FieldBox";
import { FIELD_DRAG_TYPE } from "./FieldPalette";
import type { DesignerField } from "./useFieldDesigner";

interface PageFieldOverlayProps {
  pageNumber: number;
  fields: DesignerField[];
  recipients: SignRecipient[];
  selectedIds: string[];
  /** Rendered page size in CSS pixels. */
  pageWidth: number;
  pageHeight: number;
  readOnly: boolean;
  activeRecipientId: string | null;
  onSelect: (id: string, additive: boolean) => void;
  onClearSelection: () => void;
  onBeginTransaction: () => void;
  onMove: (dx: number, dy: number, transient: boolean) => void;
  onResize: (id: string, patch: Partial<DesignerField>, transient: boolean) => void;
  onDropField: (type: SignFieldType, page: number, x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

/**
 * The interactive layer sitting exactly over one rendered page.
 *
 * Coordinates: the drop point is converted from client pixels to a 0..1
 * fraction of THIS page's box. That's what makes placement zoom- and
 * DPI-independent — the same drop lands identically whether the user is at 50%
 * or 400%, and matches what pdf-lib will do at finalization.
 */
function PageFieldOverlayImpl({
  pageNumber,
  fields,
  recipients,
  selectedIds,
  pageWidth,
  pageHeight,
  readOnly,
  activeRecipientId: _activeRecipientId,
  onSelect,
  onClearSelection,
  onBeginTransaction,
  onMove,
  onResize,
  onDropField,
  onContextMenu,
}: PageFieldOverlayProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (readOnly) return;

    const type = e.dataTransfer.getData(FIELD_DRAG_TYPE) as SignFieldType;
    if (!type) return;

    const rect = e.currentTarget.getBoundingClientRect();
    onDropField(type, pageNumber, (e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
  };

  return (
    <div
      className={cn(
        "absolute inset-0",
        // Quiet inset edge only — no pill badge over the page.
        isDragOver && "bg-sky-500/[0.04] ring-1 ring-inset ring-sky-500/50"
      )}
      onDragOver={(e) => {
        if (readOnly) return;
        // Required: without preventDefault the browser refuses the drop.
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        // Fires when moving onto a CHILD too; ignore those or the highlight flickers.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
      }}
      onDrop={handleDrop}
      onPointerDown={(e) => {
        // A click on bare page (not a field) clears the selection.
        if (e.target === e.currentTarget) onClearSelection();
      }}
    >
      {fields.map((field) => (
        <FieldBox
          key={field.id}
          field={field}
          recipient={recipients.find((r) => r.id === field.recipientId)}
          isSelected={selectedIds.includes(field.id)}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          readOnly={readOnly}
          onSelect={onSelect}
          onBeginTransaction={onBeginTransaction}
          onMove={onMove}
          onResize={onResize}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}

function pageOverlayPropsEqual(prev: PageFieldOverlayProps, next: PageFieldOverlayProps) {
  if (
    prev.pageNumber !== next.pageNumber ||
    prev.pageWidth !== next.pageWidth ||
    prev.pageHeight !== next.pageHeight ||
    prev.readOnly !== next.readOnly ||
    prev.activeRecipientId !== next.activeRecipientId ||
    prev.fields !== next.fields ||
    prev.recipients !== next.recipients ||
    prev.onSelect !== next.onSelect ||
    prev.onClearSelection !== next.onClearSelection ||
    prev.onBeginTransaction !== next.onBeginTransaction ||
    prev.onMove !== next.onMove ||
    prev.onResize !== next.onResize ||
    prev.onDropField !== next.onDropField ||
    prev.onContextMenu !== next.onContextMenu
  ) {
    return false;
  }

  const idsOnPage = new Set(next.fields.map((f) => f.id));
  const prevRelevant = prev.selectedIds.filter((id) => idsOnPage.has(id));
  const nextRelevant = next.selectedIds.filter((id) => idsOnPage.has(id));
  if (prevRelevant.length !== nextRelevant.length) return false;
  for (let i = 0; i < nextRelevant.length; i++) {
    if (prevRelevant[i] !== nextRelevant[i]) return false;
  }
  return true;
}

export const PageFieldOverlay = memo(PageFieldOverlayImpl, pageOverlayPropsEqual);
