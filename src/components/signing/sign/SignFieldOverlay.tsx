import { memo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIELD_META } from "@/lib/signing/fieldMeta";
import type { SignViewField, SignViewParticipant } from "@/services/publicSigningApi";

interface SignFieldOverlayProps {
  pageNumber: number;
  fields: SignViewField[];
  participants: SignViewParticipant[];
  values: Record<string, string>;
  /** The field the "next" button is currently pointing at. */
  focusedFieldId: string | null;
  pageWidth: number;
  pageHeight: number;
  readOnly: boolean;
  onFieldClick: (field: SignViewField) => void;
}

const IMAGE_FIELDS = new Set(["SIGNATURE", "INITIALS", "STAMP", "IMAGE"]);

/**
 * The interactive layer over one page during signing.
 *
 * Two populations of field live here and must look different at a glance:
 * the signer's own (actionable, tinted in their colour, clickable) and everyone
 * else's (context only, muted, inert). Conflating them is how signers end up
 * confused about what is being asked of them.
 */
function SignFieldOverlayImpl({
  pageNumber,
  fields,
  participants,
  values,
  focusedFieldId,
  pageWidth,
  pageHeight,
  readOnly,
  onFieldClick,
}: SignFieldOverlayProps) {
  const pageFields = fields[0]?.page === pageNumber ? fields : fields.filter((f) => f.page === pageNumber);

  return (
    <div className="absolute inset-0">
      {pageFields.map((field) => {
          const meta = FIELD_META[field.type];
          const Icon = meta.icon;
          const owner = participants.find((p) => p.id === field.recipientId);
          const value = values[field.id] ?? field.value ?? "";
          const isFilled = Boolean(value);
          const isImage = IMAGE_FIELDS.has(field.type);
          const isFocused = focusedFieldId === field.id;
          const ownerColor = owner?.color ?? "#2563eb";

          // Someone else's field: show what they entered, but never invite
          // interaction. Signing is per-person.
          if (!field.isMine) {
            return (
              <div
                key={field.id}
                className="absolute flex items-center justify-center overflow-hidden rounded-[2px]"
                style={{
                  left: `${field.x * 100}%`,
                  top: `${field.y * 100}%`,
                  width: `${field.width * 100}%`,
                  height: `${field.height * 100}%`,
                  backgroundColor: isFilled ? "transparent" : `${ownerColor}0a`,
                  border: isFilled ? "none" : `1px solid ${ownerColor}40`,
                }}
                aria-hidden="true"
              >
                {isFilled &&
                  (isImage ? (
                    <img src={value} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span
                      className="truncate px-0.5 text-slate-900"
                      style={{ fontSize: Math.max(pageHeight * field.height * 0.6, 6) }}
                    >
                      {value}
                    </span>
                  ))}
              </div>
            );
          }

          return (
            <button
              key={field.id}
              type="button"
              disabled={readOnly}
              onClick={() => onFieldClick(field)}
              aria-label={`${meta.label}${field.required ? ", required" : ", optional"}${isFilled ? ", completed" : ", not yet filled"}`}
              className={cn(
                "group absolute flex items-center justify-center overflow-hidden rounded-[2px]",
                !readOnly && "cursor-pointer",
                isFocused && "z-20",
                !isFilled && !readOnly && "hover:brightness-[0.98]"
              )}
              style={{
                left: `${field.x * 100}%`,
                top: `${field.y * 100}%`,
                width: `${field.width * 100}%`,
                height: `${field.height * 100}%`,
                backgroundColor: isFilled
                  ? "transparent"
                  : isFocused
                    ? "rgba(245, 158, 11, 0.18)"
                    : `${ownerColor}14`,
                border: isFilled
                  ? "none"
                  : isFocused
                    ? "2px solid #d97706"
                    : `1px solid ${ownerColor}`,
              }}
            >
              {isFilled ? (
                isImage ? (
                  <img src={value} alt="Your signature" className="h-full w-full object-contain" />
                ) : (
                  <span
                    className="truncate px-0.5 text-slate-900"
                    style={{ fontSize: Math.max(pageHeight * field.height * 0.6, 6) }}
                  >
                    {value}
                  </span>
                )
              ) : (
                <span
                  className="flex items-center gap-1 truncate px-1 text-[10px] font-medium"
                  style={{ color: isFocused ? "#b45309" : ownerColor }}
                >
                  <Icon className="size-3 shrink-0 opacity-80" />
                  {pageWidth * field.width > 70 && (
                    <span className="truncate">{field.label || meta.label}</span>
                  )}
                </span>
              )}

              {isFilled && (
                <span className="absolute right-0.5 top-0.5 text-emerald-600" aria-hidden="true">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              )}
              {!isFilled && field.required && (
                <span className="absolute right-0.5 top-0 text-[9px] font-bold leading-none text-destructive">
                  *
                </span>
              )}
            </button>
          );
      })}
    </div>
  );
}

function signOverlayPropsEqual(prev: SignFieldOverlayProps, next: SignFieldOverlayProps) {
  if (
    prev.pageNumber !== next.pageNumber ||
    prev.pageWidth !== next.pageWidth ||
    prev.pageHeight !== next.pageHeight ||
    prev.readOnly !== next.readOnly ||
    prev.onFieldClick !== next.onFieldClick ||
    prev.participants !== next.participants ||
    prev.fields !== next.fields
  ) {
    return false;
  }

  if (prev.focusedFieldId !== next.focusedFieldId) {
    const prevFocusedHere = prev.fields.some((f) => f.id === prev.focusedFieldId);
    const nextFocusedHere = next.fields.some((f) => f.id === next.focusedFieldId);
    if (prevFocusedHere || nextFocusedHere) return false;
  }

  for (const field of next.fields) {
    if ((prev.values[field.id] ?? field.value ?? "") !== (next.values[field.id] ?? field.value ?? "")) {
      return false;
    }
  }
  return true;
}

export const SignFieldOverlay = memo(SignFieldOverlayImpl, signOverlayPropsEqual);
