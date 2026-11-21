import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CloudOff,
  FileStack,
  LayoutGrid,
  Loader2,
  PenLine,
  Redo2,
  Send,
  Settings2,
  Undo2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { signingApi } from "@/services/signingApi";
import { useAuth } from "@/contexts/AuthContext";
import type { SignDocument, SignDocumentStatus, SignFieldType, SignFlowType, SignRecipient } from "@/lib/signing/types";
import { PdfViewer, type PdfViewerHandle } from "@/components/signing/viewer/PdfViewer";
import { FieldPalette } from "@/components/signing/designer/FieldPalette";
import { PageFieldOverlay } from "@/components/signing/designer/PageFieldOverlay";
import { PropertiesPanel } from "@/components/signing/designer/PropertiesPanel";
import { RecipientPanel } from "@/components/signing/designer/RecipientPanel";
import { useFieldDesigner, type DesignerField } from "@/components/signing/designer/useFieldDesigner";
import { SendDialog } from "@/components/signing/send/SendDialog";
import { StatusTracker } from "@/components/signing/send/StatusTracker";

const EMPTY_FIELDS: DesignerField[] = [];

const STATUS_LABEL: Record<SignDocumentStatus, string> = {
  CONVERTING: "Converting Word to PDF",
  CONVERSION_FAILED: "Conversion failed",
  DRAFT: "Draft",
  SENT: "Waiting for signatures",
  FINALIZING: "Sealing signed PDF",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  EXPIRED: "Expired",
  VOIDED: "Cancelled",
};

const WIZARD_STEPS = [
  { n: 1, label: "Who signs" },
  { n: 2, label: "Place fields" },
  { n: 3, label: "Send" },
] as const;

function SaveIndicator({ state }: { state: ReturnType<typeof useFieldDesigner>["saveState"] }) {
  const map = {
    idle: null,
    dirty: { icon: Loader2, text: "Unsaved changes", className: "text-muted-foreground", spin: false },
    saving: { icon: Loader2, text: "Saving…", className: "text-muted-foreground", spin: true },
    saved: { icon: Check, text: "Saved", className: "text-emerald-600 dark:text-emerald-500", spin: false },
    error: { icon: CloudOff, text: "Not saved", className: "text-destructive", spin: false },
  } as const;

  const entry = map[state];
  if (!entry) return null;
  const Icon = entry.icon;

  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-medium", entry.className)} role="status" aria-live="polite">
      <Icon className={cn("size-3", entry.spin && "animate-spin")} aria-hidden="true" />
      {entry.text}
    </span>
  );
}

function SentTrackingLayout({
  documentId,
  fileUrl,
  viewerRef,
  renderPageOverlay,
  pagesWithFields,
  onPageChange,
}: {
  documentId: string;
  fileUrl: string | null;
  viewerRef: RefObject<PdfViewerHandle | null>;
  renderPageOverlay: (
    pageNumber: number,
    size: { width: number; height: number },
    scale: number
  ) => ReactNode;
  pagesWithFields: Set<number>;
  onPageChange: (page: number) => void;
}) {
  const [mobileTab, setMobileTab] = useState("document");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <div className="shrink-0 border-b border-border bg-card px-3 pt-2 lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        className={cn(
          "min-h-0 min-w-0 flex-1 bg-muted/40",
          mobileTab === "status" && "hidden lg:block"
        )}
      >
        <PdfViewer
          ref={viewerRef}
          source={fileUrl}
          className="h-full"
          renderPageOverlay={renderPageOverlay}
          pagesWithFields={pagesWithFields}
          onPageChange={onPageChange}
        />
      </div>

      <div
        className={cn(
          "min-h-0 w-full shrink-0 overflow-y-auto bg-card lg:w-[26rem] lg:border-l lg:border-border",
          mobileTab === "document" && "hidden lg:block"
        )}
      >
        <StatusTracker documentId={documentId} />
      </div>
    </div>
  );
}

function WizardSteps({
  activeStep,
  className,
}: {
  activeStep: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <nav
      aria-label="Signing setup steps"
      className={cn("flex items-center gap-3 sm:gap-4", className)}
    >
      {WIZARD_STEPS.map((step) => {
        const done = step.n < activeStep;
        const current = step.n === activeStep;
        return (
          <span
            key={step.n}
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] font-medium sm:text-xs",
              current && "text-foreground",
              done && "text-muted-foreground",
              !done && !current && "text-muted-foreground/50"
            )}
            aria-current={current ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center text-[10px] font-semibold tabular-nums",
                current && "border-b-2 border-foreground text-foreground",
                done && "text-muted-foreground",
                !done && !current && "text-muted-foreground/50"
              )}
            >
              {done ? <Check className="size-3" aria-hidden="true" /> : step.n}
            </span>
            <span className={cn("hidden sm:inline", current && "border-b-2 border-foreground pb-px")}>
              {step.label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export default function DocumentEditor() {
  const { id = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSelfSign = searchParams.get("self") === "1";
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewerRef = useRef<PdfViewerHandle>(null);

  const [document, setDocument] = useState<SignDocument | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<SignRecipient[]>([]);
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(null);
  const [flowType, setFlowType] = useState<SignFlowType>("SEQUENTIAL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSend, setShowSend] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSelfSending, setIsSelfSending] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Once sent, placement is frozen — see assertDraft on the API side. The UI
  // mirrors that rule rather than letting the user edit into a 409.
  const readOnly = document?.status !== "DRAFT";
  const isDraft = document?.status === "DRAFT";

  const initialFields = useMemo(() => document?.fields ?? [], [document]);
  const designer = useFieldDesigner(id, initialFields, !readOnly);
  const {
    fields,
    fieldsByPage,
    pagesWithFields,
    selectedIds,
    selectedFields,
    setSelectedIds,
    saveState,
    canUndo,
    canRedo,
    addField,
    updateField,
    moveSelection,
    deleteSelection,
    duplicateSelection,
    toggleLock,
    clearRecipient,
    beginTransaction,
    undo,
    redo,
    save,
  } = designer;

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;

    const loadFileUrl = async (docId: string) => {
      const { url } = await signingApi.getFileUrl(docId);
      if (!cancelled) setFileUrl(url);
    };

    const loadDocument = async () => {
      let stillConverting = false;
      try {
        let doc = await signingApi.getDocument(id);
        if (cancelled) return;

        if (doc.status === "CONVERTING") {
          setDocument(doc);
          setLoadError(null);
          stillConverting = true;
          pollTimer = setTimeout(loadDocument, 2000);
          return;
        }

        if (doc.status === "CONVERSION_FAILED") {
          setDocument(doc);
          setLoadError("Word conversion failed. Delete this document and try uploading again.");
          return;
        }

        setDocument(doc);
        setRecipients(doc.recipients ?? []);
        setFlowType(doc.flowType);
        setActiveRecipientId(doc.recipients?.[0]?.id ?? null);

        await loadFileUrl(id);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Couldn't load this document.");
      } finally {
        if (!cancelled && !stillConverting) setIsLoading(false);
      }
    };

    void loadDocument();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [id]);

  const handleFlowTypeChange = async (flow: SignFlowType) => {
    const previous = flowType;
    setFlowType(flow); // optimistic — a select that lags feels broken
    try {
      await signingApi.updateDocument(id, { flowType: flow });
    } catch (err) {
      setFlowType(previous);
      toast.error(err instanceof Error ? err.message : "Couldn't change the signing order.");
    }
  };

  const handleQuickAdd = useCallback(
    (type: SignFieldType) => {
      // Place near the top of the visible page and stagger so rapid taps don't
      // stack every field on the exact same spot (common on mobile click-to-place).
      const onPage = fields.filter((f) => f.page === currentPage).length;
      const x = 0.5 + ((onPage % 5) - 2) * 0.04;
      const y = 0.28 + Math.floor(onPage / 5) * 0.08;
      addField(type, currentPage, x, Math.min(y, 0.75), activeRecipientId);
      setFieldsOpen(false);
      if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
        toast.message("Field added — drag it into place on the page.");
      }
    },
    [fields, addField, currentPage, activeRecipientId]
  );

  const handleSelect = useCallback(
    (fieldId: string, additive: boolean) => {
      setSelectedIds((current) =>
        additive
          ? current.includes(fieldId)
            ? current.filter((i) => i !== fieldId)
            : [...current, fieldId]
          : current.length === 1 && current[0] === fieldId
            ? current
            : [fieldId]
      );
    },
    [setSelectedIds]
  );

  const handleClearSelection = useCallback(() => setSelectedIds([]), [setSelectedIds]);

  const handleDropField = useCallback(
    (type: SignFieldType, page: number, x: number, y: number) => {
      addField(type, page, x, y, activeRecipientId);
    },
    [addField, activeRecipientId]
  );

  const handleFieldContextMenu = useCallback(
    (e: React.MouseEvent, fieldId: string) => {
      e.preventDefault();
      setSelectedIds((current) => (current.includes(fieldId) ? current : [fieldId]));
    },
    [setSelectedIds]
  );

  // Designer keyboard shortcuts. The viewer registers its own set; these are
  // scoped to editing and skipped while typing in a panel input.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (readOnly) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((mod && e.key.toLowerCase() === "y") || (mod && e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelection();
      } else if (mod && e.key.toLowerCase() === "s") {
        // Autosave already handles this, but muscle memory says Ctrl+S — and
        // letting the browser open a Save-Page dialog here would be jarring.
        e.preventDefault();
        void save();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length) {
          e.preventDefault();
          deleteSelection();
        }
      } else if (e.key === "Escape") {
        setSelectedIds([]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [readOnly, undo, redo, duplicateSelection, save, selectedIds, deleteSelection, setSelectedIds]);

  const fieldCountByRecipient = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of fields) {
      if (f.recipientId) map.set(f.recipientId, (map.get(f.recipientId) ?? 0) + 1);
    }
    return map;
  }, [fields]);

  const unassignedCount = fields.filter((f) => !f.recipientId).length;

  /**
   * Why the document can't be sent yet, in plain language — or null when it can.
   * Mirrors the backend's /send preconditions so the user is told up front
   * rather than hitting a 400 after clicking. The order matters: report the
   * first thing they need to fix, not all of them at once.
   */
  const sendBlockedReason = useMemo(() => {
    const signers = recipients.filter((r) => r.role === "SIGNER" || r.role === "APPROVER");
    // SIGNER needs fields; APPROVER may approve with none.
    const withoutFields = signers.filter(
      (r) => r.role === "SIGNER" && (fieldCountByRecipient.get(r.id) ?? 0) === 0
    );
    const smsMissingPhone = recipients.filter(
      (r) => r.authMethod === "SMS_OTP" && !String(r.phone || "").trim()
    );

    if (recipients.length === 0) return "Add at least one person who needs to sign.";
    if (signers.length === 0) return "Add at least one signer or approver.";
    if (withoutFields.length > 0)
      return `Place at least one field for ${withoutFields.map((r) => r.name).join(", ")}.`;
    if (unassignedCount > 0)
      return `${unassignedCount} field${unassignedCount === 1 ? " is" : "s are"} unassigned — assign or delete ${unassignedCount === 1 ? "it" : "them"}.`;
    if (smsMissingPhone.length > 0)
      return `Add a phone number for ${smsMissingPhone.map((r) => r.name).join(", ")} to use SMS verification.`;
    if (isSelfSign) {
      const actionable = signers.filter((r) => r.role === "SIGNER" || r.role === "APPROVER");
      if (actionable.length !== 1 || !user?.email || actionable[0].email.toLowerCase() !== user.email.toLowerCase()) {
        return "Self-sign requires you as the only signer (with your account email).";
      }
    }
    return null;
  }, [recipients, fieldCountByRecipient, unassignedCount, isSelfSign, user?.email]);

  // Step 1 until people exist; step 2 while placing; step 3 when ready to send.
  const activeStep: 1 | 2 | 3 = useMemo(() => {
    if (!isDraft) return 3;
    if (recipients.length === 0) return 1;
    if (sendBlockedReason) return 2;
    return 3;
  }, [isDraft, recipients.length, sendBlockedReason]);

  const openSend = useCallback(async () => {
    // Flush any pending field edits so the server sends the current design, not
    // the last autosaved state.
    if (saveState === "dirty" || saveState === "saving") {
      await save();
    }
    setShowSend(true);
  }, [saveState, save]);

  const handleSelfSign = useCallback(async () => {
    if (saveState === "dirty" || saveState === "saving") {
      await save();
    }
    setIsSelfSending(true);
    try {
      const result = await signingApi.sendSelf(id);
      toast.success("Opening your signing view…");
      navigate(`/s/${result.token}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't start self-sign.");
    } finally {
      setIsSelfSending(false);
    }
  }, [saveState, save, id, navigate]);

  const openSaveTemplate = useCallback(async () => {
    if (saveState === "dirty" || saveState === "saving") {
      await save();
    }
    setTemplateName(document?.title || "Untitled template");
    setTemplateDialogOpen(true);
  }, [saveState, save, document?.title]);

  const confirmSaveTemplate = useCallback(async () => {
    setIsSavingTemplate(true);
    try {
      await signingApi.createTemplate({
        documentId: id,
        name: templateName.trim() || undefined,
      });
      setTemplateDialogOpen(false);
      toast.success("Template saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the template.");
    } finally {
      setIsSavingTemplate(false);
    }
  }, [id, templateName]);

  const renderPageOverlay = useCallback(
    (pageNumber: number, size: { width: number; height: number }, scale: number) => (
      <PageFieldOverlay
        pageNumber={pageNumber}
        fields={fieldsByPage.get(pageNumber) ?? EMPTY_FIELDS}
        recipients={recipients}
        selectedIds={selectedIds}
        pageWidth={size.width * scale}
        pageHeight={size.height * scale}
        readOnly={readOnly}
        activeRecipientId={activeRecipientId}
        onSelect={handleSelect}
        onClearSelection={handleClearSelection}
        onBeginTransaction={beginTransaction}
        onMove={moveSelection}
        onResize={updateField}
        onDropField={handleDropField}
        onContextMenu={handleFieldContextMenu}
      />
    ),
    [
      fieldsByPage,
      recipients,
      selectedIds,
      readOnly,
      activeRecipientId,
      handleSelect,
      handleClearSelection,
      beginTransaction,
      moveSelection,
      updateField,
      handleDropField,
      handleFieldContextMenu,
    ]
  );

  const recipientPanelProps = {
    documentId: id,
    recipients,
    flowType,
    activeRecipientId,
    readOnly,
    fieldCountByRecipient,
    defaultSelf: user ? { name: user.name, email: user.email } : undefined,
    onRecipientsChange: setRecipients,
    onFlowTypeChange: handleFlowTypeChange,
    onActiveChange: setActiveRecipientId,
    onRecipientRemoved: clearRecipient,
    onSelfSignModeChange: (enabled: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (enabled) next.set("self", "1");
          else next.delete("self");
          return next;
        },
        { replace: true }
      );
    },
  } as const;

  const propertiesPanelProps = {
    selected: selectedFields,
    recipients,
    readOnly,
    onUpdate: updateField,
    onDuplicate: duplicateSelection,
    onDelete: deleteSelection,
    onToggleLock: toggleLock,
  } as const;

  if (isLoading) {
    const converting = document?.status === "CONVERTING";
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        {converting ? "Converting Word to PDF…" : "Loading document…"}
      </div>
    );
  }

  if (loadError || !document) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="size-7 text-destructive" />
        </div>
        <div>
          <p className="font-semibold">Couldn't open this document</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{loadError}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/sign")}>
          <ArrowLeft />
          Back to documents
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* --- Header --- */}
      <header className="flex shrink-0 flex-col gap-2 border-b border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/sign")} aria-label="Back to documents">
            <ArrowLeft />
          </Button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{document.title}</h1>
            <p className="truncate text-[11px] text-muted-foreground">{document.fileName}</p>
          </div>

          <Badge variant={document.status === "DRAFT" ? "secondary" : "default"}>
            {STATUS_LABEL[document.status]}
          </Badge>

          {unassignedCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="hidden gap-1 border-amber-500/40 text-amber-600 sm:inline-flex dark:text-amber-500">
                  <AlertTriangle className="size-3" />
                  {unassignedCount} unassigned
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                These fields aren't assigned to anyone and will be skipped.
              </TooltipContent>
            </Tooltip>
          )}

          <SaveIndicator state={saveState} />

          {!readOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => {
                    void (async () => {
                      try {
                        const { fields: suggested } = await signingApi.detectFields(id);
                        if (!suggested.length) {
                          toast.message("No fields detected — place them from the palette.");
                          return;
                        }
                        const active = activeRecipientId || recipients[0]?.id || null;
                        for (const s of suggested) {
                          addField(
                            s.type as SignFieldType,
                            s.page,
                            s.x + s.width / 2,
                            s.y + s.height / 2,
                            active
                          );
                        }
                        toast.success(`Added ${suggested.length} suggested field${suggested.length === 1 ? "" : "s"}.`);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Couldn't detect fields.");
                      }
                    })();
                  }}
                  aria-label="Detect fields"
                >
                  Auto-detect
                </Button>
              </TooltipTrigger>
              <TooltipContent>Suggest signature and form fields from the PDF</TooltipContent>
            </Tooltip>
          )}

          {isDraft && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void openSaveTemplate()}
                  disabled={isSavingTemplate || recipients.length === 0}
                  aria-label="Save as template"
                >
                  {isSavingTemplate ? <Spinner className="size-3.5" /> : <FileStack className="size-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save as template</TooltipContent>
            </Tooltip>
          )}

          {!readOnly && (
            <div className="hidden items-center gap-0.5 sm:flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" onClick={undo} disabled={!canUndo} aria-label="Undo">
                    <Undo2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" onClick={redo} disabled={!canRedo} aria-label="Redo">
                    <Redo2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </div>
          )}

          {isDraft &&
            (sendBlockedReason ? (
              // Disabled buttons don't fire hover events, so the tooltip wraps a
              // span — otherwise the user can't discover WHY they can't send.
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button disabled className="pointer-events-none">
                      {isSelfSign ? <PenLine /> : <Send />}
                      <span className="hidden sm:inline">{isSelfSign ? "Sign now" : "Send"}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{sendBlockedReason}</TooltipContent>
              </Tooltip>
            ) : isSelfSign ? (
              <Button onClick={handleSelfSign} disabled={isSelfSending}>
                {isSelfSending ? <Spinner className="size-4" /> : <PenLine />}
                <span className="hidden sm:inline">Sign now</span>
                <span className="sm:hidden">Sign</span>
              </Button>
            ) : (
              <Button onClick={openSend}>
                <Send />
                <span className="hidden sm:inline">Send for signature</span>
                <span className="sm:hidden">Send</span>
              </Button>
            ))}
        </div>

        {isDraft && (
          <WizardSteps
            activeStep={isSelfSign && recipients.length > 0 ? (sendBlockedReason ? 2 : 3) : activeStep}
            className="justify-center border-t border-border/60 pt-2 sm:justify-start"
          />
        )}
      </header>

      {/* --- Body --- */}
      {isDraft ? (
        // DRAFT: fields left · PDF center · people (+ field settings) right.
        <div className="relative flex min-h-0 flex-1">
          <div className="hidden w-56 shrink-0 flex-col overflow-hidden border-r border-border bg-card lg:flex">
            <FieldPalette
              activeRecipient={recipients.find((r) => r.id === activeRecipientId)}
              readOnly={readOnly}
              onQuickAdd={handleQuickAdd}
              className="h-full w-full border-0"
            />
          </div>

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-muted/40">
            <PdfViewer
              ref={viewerRef}
              source={fileUrl}
              className="min-h-0 flex-1 pb-16 lg:pb-0"
              renderPageOverlay={renderPageOverlay}
              pagesWithFields={pagesWithFields}
              onPageChange={setCurrentPage}
              onPageCountChange={(count) => {
                if (document.pageCount !== count) {
                  setDocument((d) => (d ? { ...d, pageCount: count } : d));
                }
              }}
            />

            <div
              className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-around gap-1 border-t border-border bg-card px-2 py-2 lg:hidden"
              style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => setPeopleOpen(true)}
              >
                <Users className="size-3.5" />
                People
                {recipients.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">
                    {recipients.length}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => setFieldsOpen(true)}
              >
                <LayoutGrid className="size-3.5" />
                Fields
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 className="size-3.5" />
                Settings
                {selectedIds.length > 0 && (
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          {/* Right rail fills the empty third — who signs always visible */}
          <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-l border-border bg-card lg:flex xl:w-80">
            <div
              className={cn(
                "min-h-0 overflow-y-auto",
                selectedIds.length > 0 ? "max-h-[45%]" : "flex-1"
              )}
            >
              <RecipientPanel {...recipientPanelProps} className="border-b-0" />
            </div>
            {selectedIds.length > 0 ? (
              <div className="min-h-0 flex-1 overflow-hidden border-t border-border">
                <PropertiesPanel {...propertiesPanelProps} className="h-full w-full border-0" />
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-end gap-2 border-t border-border/70 px-4 py-5">
                <p className="text-xs font-semibold text-foreground">Next: place fields</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Add a person here, then drag Signature or Date from the left onto the PDF. Select a
                  field to edit it in this panel.
                </p>
              </div>
            )}
          </aside>

          <Sheet open={peopleOpen} onOpenChange={setPeopleOpen}>
            <SheetContent side="right" className="w-[min(100%,20rem)] p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border px-4 py-3 text-left">
                <SheetTitle>Who signs</SheetTitle>
                <SheetDescription>Add the people who need to sign or approve.</SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto">
                <RecipientPanel {...recipientPanelProps} />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={fieldsOpen} onOpenChange={setFieldsOpen}>
            <SheetContent side="bottom" className="flex h-[min(70vh,28rem)] flex-col p-0">
              <SheetHeader className="border-b border-border px-4 py-3 text-left">
                <SheetTitle>Place fields</SheetTitle>
                <SheetDescription>
                  Tap a field type to place it on the page you&apos;re viewing, then drag it into position.
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <FieldPalette
                  activeRecipient={recipients.find((r) => r.id === activeRecipientId)}
                  readOnly={readOnly}
                  onQuickAdd={(type) => {
                    handleQuickAdd(type);
                    setFieldsOpen(false);
                  }}
                  className="h-full w-full border-0"
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetContent side="right" className="flex w-[min(100%,20rem)] flex-col p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border px-4 py-3 text-left">
                <SheetTitle>Field settings</SheetTitle>
                <SheetDescription>Who fills this in, and whether it is required.</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <PropertiesPanel {...propertiesPanelProps} className="h-full w-full border-0" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        // SENT / COMPLETED: Document | Status tabs under lg; side panel from lg up.
        <SentTrackingLayout
          documentId={id}
          fileUrl={fileUrl}
          viewerRef={viewerRef}
          renderPageOverlay={renderPageOverlay}
          pagesWithFields={pagesWithFields}
          onPageChange={setCurrentPage}
        />
      )}

      {showSend && document && (
        <SendDialog
          documentId={id}
          recipients={recipients}
          flowType={flowType}
          fieldCountByRecipient={fieldCountByRecipient}
          onClose={() => setShowSend(false)}
          onFlowTypeChange={handleFlowTypeChange}
          onSent={() => {
            setShowSend(false);
            // Flip to SENT so the body switches to the tracker without a reload.
            setDocument((d) => (d ? { ...d, status: "SENT" } : d));
          }}
        />
      )}

      <Dialog open={templateDialogOpen} onOpenChange={(open) => !isSavingTemplate && setTemplateDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as template</DialogTitle>
            <DialogDescription>
              Reuse this layout and recipient roles for the next document.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="h-9"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void confirmSaveTemplate();
              }
            }}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSavingTemplate}
              onClick={() => setTemplateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={isSavingTemplate} onClick={() => void confirmSaveTemplate()}>
              {isSavingTemplate ? <Spinner className="size-4" /> : null}
              Save template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
