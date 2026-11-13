import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lettersApi } from "@/services/lettersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudioSkeleton } from "@/components/letters/StudioPageHeader";
import { LetterAiDialog } from "@/components/letters/LetterAiDialog";
import { letterTypeLabel } from "@/components/letters/letterFields";

const LetterEditor = lazy(() =>
  import("@/components/letters/LetterEditor").then((m) => ({ default: m.LetterEditor }))
);
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Eye,
  FilePlus2,
  Loader2,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  tipTapDocToPlainText,
  plainTextToTipTapDoc,
  fillPreviewTokens,
  SAMPLE_EMPLOYEE,
} from "@/lib/tipTapLetter";
import { useAuth } from "@/features/auth/useAuth";
import { useBrands, useTemplates } from "@/features/letters";
import { ensureOrg } from "@/features/org";
import { readLetterOrgId } from "@/features/letters/orgHelpers";

function orgId() {
  return readLetterOrgId();
}

const TYPES = [
  "INCREMENT",
  "PROMOTION",
  "SALARY_REVISION",
  "OFFER",
  "CONFIRMATION",
  "WARNING",
  "SEPARATION",
] as const;

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

const FONT_STACK: Record<string, string> = {
  Inter: "Inter, system-ui, sans-serif",
  Georgia: "Georgia, 'Times New Roman', serif",
  "Times New Roman": "'Times New Roman', Times, serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', Inter, sans-serif",
};

type SaveStatus = "saved" | "saving" | "unsaved" | "idle";

function snapshot(name: string, type: string, content: unknown) {
  return JSON.stringify({ name, type, content });
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const templatesQuery = useTemplates(user?.id);
  const brandsQuery = useBrands(user?.id);
  const templates = templatesQuery.data?.templates ?? [];
  const brands = brandsQuery.data?.brands ?? [];

  const [previewBrandId, setPreviewBrandId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled letter");
  const [type, setType] = useState<(typeof TYPES)[number]>("INCREMENT");
  const [content, setContent] = useState<any>(EMPTY_DOC);
  const [editorKey, setEditorKey] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [improveOpen, setImproveOpen] = useState(false);
  const [polishPreview, setPolishPreview] = useState<string | null>(null);
  const [polishContentJson, setPolishContentJson] = useState<any | null>(null);
  const [showSampleFill, setShowSampleFill] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [blankMode, setBlankMode] = useState(true);

  const savedSnapRef = useRef<string>(snapshot("Untitled letter", "INCREMENT", EMPTY_DOC));
  const deepLinkHandled = useRef(false);
  const aiParamHandled = useRef(false);

  const previewBrand = useMemo(
    () => brands.find((b: { id: string }) => b.id === previewBrandId) || null,
    [brands, previewBrandId]
  );

  const samplePreviewText = useMemo(() => {
    const plain = tipTapDocToPlainText(content);
    return fillPreviewTokens(plain, SAMPLE_EMPLOYEE);
  }, [content]);

  const hasExistingContent = useMemo(
    () => tipTapDocToPlainText(content).trim().length > 0,
    [content]
  );

  const markDirty = useCallback(() => {
    const next = snapshot(name, type, content);
    if (next !== savedSnapRef.current) setSaveStatus("unsaved");
    else setSaveStatus((s) => (s === "saving" ? s : "saved"));
  }, [name, type, content]);

  useEffect(() => {
    markDirty();
  }, [markDirty]);

  const openTemplate = (t: any) => {
    setBlankMode(false);
    setSelectedId(t.id);
    setName(t.name);
    setType(t.type);
    setContent(t.contentJson || EMPTY_DOC);
    setEditorKey((k) => k + 1);
    setShowSampleFill(false);
    setPolishPreview(null);
    setPolishContentJson(null);
    savedSnapRef.current = snapshot(t.name, t.type, t.contentJson || EMPTY_DOC);
    setSaveStatus("saved");
  };

  const startBlank = () => {
    setBlankMode(true);
    setSelectedId(null);
    setName("Untitled letter");
    setType("INCREMENT");
    setContent(EMPTY_DOC);
    setEditorKey((k) => k + 1);
    setShowSampleFill(false);
    setPolishPreview(null);
    setPolishContentJson(null);
    savedSnapRef.current = snapshot("Untitled letter", "INCREMENT", EMPTY_DOC);
    setSaveStatus("idle");
  };

  useEffect(() => {
    if (!previewBrandId && brands[0]) setPreviewBrandId(brands[0].id);
  }, [brands, previewBrandId]);

  useEffect(() => {
    const err = templatesQuery.error || brandsQuery.error;
    if (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load templates");
    }
  }, [templatesQuery.error, brandsQuery.error]);

  const reload = async () => {
    await ensureOrg(user?.id);
    await Promise.all([templatesQuery.refetch(), brandsQuery.refetch()]);
  };

  useEffect(() => {
    const tid = params.get("templateId");
    if (!tid || !templates.length || deepLinkHandled.current) return;
    const found = templates.find((t: { id: string }) => t.id === tid);
    if (found) {
      deepLinkHandled.current = true;
      openTemplate(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, templates]);

  useEffect(() => {
    if (params.get("ai") === "1" && !aiParamHandled.current) {
      aiParamHandled.current = true;
      setAiOpen(true);
    }
  }, [params]);

  const filteredTemplates = useMemo(() => {
    const q = sidebarQuery.trim().toLowerCase();
    const list = [...templates].sort((a: any, b: any) => {
      const ta = String(a.type || "");
      const tb = String(b.type || "");
      if (ta !== tb) return ta.localeCompare(tb);
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    if (!q) return list;
    return list.filter((t: any) => {
      const label = letterTypeLabel(t.type || "");
      return (
        String(t.name || "")
          .toLowerCase()
          .includes(q) ||
        String(t.type || "")
          .toLowerCase()
          .includes(q) ||
        label.toLowerCase().includes(q)
      );
    });
  }, [templates, sidebarQuery]);

  const save = async () => {
    setSaving(true);
    setSaveStatus("saving");
    try {
      if (selectedId) {
        const { template } = await lettersApi.updateTemplate(orgId(), selectedId, {
          name,
          contentJson: content,
          bumpVersion: true,
        });
        savedSnapRef.current = snapshot(name, type, content);
        setSaveStatus("saved");
        toast.success(`Saved v${template.version}`);
      } else {
        const { template } = await lettersApi.createTemplate(orgId(), {
          name,
          type,
          contentJson: content,
        });
        setSelectedId(template.id);
        setBlankMode(false);
        savedSnapRef.current = snapshot(name, type, content);
        setSaveStatus("saved");
        toast.success("Letter saved");
      }
      await reload();
    } catch (e: any) {
      setSaveStatus("unsaved");
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const polish = async (mode: "formal" | "concise" | "add-disclaimer") => {
    if (polishing) return;
    setPolishing(true);
    setImproveOpen(false);
    setPolishPreview(null);
    setPolishContentJson(null);
    try {
      const text = tipTapDocToPlainText(content).slice(0, 6000);
      if (!text.trim()) {
        toast.error("Add letter content before improving");
        return;
      }
      const res = await lettersApi.aiPolish(orgId(), { text, mode });
      const preview =
        res.suggestionPreview ||
        res.suggestion ||
        (res.contentJson ? tipTapDocToPlainText(res.contentJson) : "");
      const safePreview =
        preview.trim().startsWith("{") && preview.includes('"type"')
          ? tipTapDocToPlainText(res.contentJson || plainTextToTipTapDoc(text))
          : preview;
      setPolishPreview(safePreview);
      setPolishContentJson(
        res.contentJson && res.contentJson.type === "doc"
          ? res.contentJson
          : plainTextToTipTapDoc(safePreview || text)
      );
      toast.message("Suggestion ready — click Apply to use it");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPolishing(false);
    }
  };

  const applyPolish = () => {
    const next =
      polishContentJson && polishContentJson.type === "doc"
        ? polishContentJson
        : plainTextToTipTapDoc(polishPreview || "");
    setContent(next);
    setEditorKey((k) => k + 1);
    setPolishPreview(null);
    setPolishContentJson(null);
    toast.success("Applied — remember to Save");
  };

  const insertAiDraft = (draft: any) => {
    setContent(draft);
    setEditorKey((k) => k + 1);
    void lettersApi
      .aiApplyDraft(orgId(), {
        templateId: selectedId,
        contentJson: draft,
        name,
        type,
      })
      .catch(() => undefined);
  };

  const refreshStarters = async (overwrite: boolean) => {
    if (overwrite) {
      const ok = window.confirm(
        "Replace the built-in starter templates with the latest professional versions? Your custom templates are kept."
      );
      if (!ok) return;
    }
    setRefreshing(true);
    try {
      const res = await lettersApi.refreshStarterTemplates(orgId(), overwrite);
      await templatesQuery.refetch();
      toast.success(
        overwrite
          ? `Updated ${res.refreshed} starter(s)`
          : res.seeded
            ? `Added ${res.seeded} starter(s)`
            : "Starters already up to date"
      );
      if (res.templates[0] && overwrite) openTemplate(res.templates[0]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const fontFamily =
    FONT_STACK[previewBrand?.defaultFont] ||
    previewBrand?.defaultFont ||
    FONT_STACK.Georgia;

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "unsaved"
        ? "Unsaved changes"
        : saveStatus === "saved"
          ? "Saved"
          : blankMode
            ? "Blank letter"
            : "Ready";

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* Template library */}
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-studio-paper lg:w-64 lg:border-b-0 lg:border-r">
        <div className="space-y-2 border-b border-border px-3 py-3">
          <Button
            type="button"
            className="h-9 w-full justify-start gap-2 rounded-lg text-sm font-semibold"
            disabled={polishing}
            onClick={startBlank}
          >
            <FilePlus2 className="size-4" />
            New letter
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={sidebarQuery}
              onChange={(e) => setSidebarQuery(e.target.value)}
              placeholder="Search templates…"
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {blankMode && !selectedId ? (
            <div className="mb-1 rounded-lg border border-primary/25 bg-card px-2.5 py-2 text-left shadow-sm">
              <p className="text-sm font-semibold text-foreground">Blank letter</p>
              <p className="text-[11px] text-muted-foreground">Start typing or paste content</p>
            </div>
          ) : null}

          {filteredTemplates.map((t: any) => (
            <button
              key={t.id}
              type="button"
              disabled={polishing}
              onClick={() => openTemplate(t)}
              className={cn(
                "mb-0.5 block w-full rounded-lg px-2.5 py-2 text-left transition",
                selectedId === t.id
                  ? "bg-card font-semibold text-foreground shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
              )}
            >
              <div className="truncate text-sm">{t.name}</div>
              <div className="truncate text-[11px] opacity-70">{letterTypeLabel(t.type)}</div>
            </button>
          ))}

          {filteredTemplates.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              {sidebarQuery.trim() ? "No templates match" : "No letters yet — click New letter"}
            </p>
          )}
        </div>

        <div className="border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-1.5 rounded-lg text-xs text-muted-foreground"
            disabled={refreshing}
            onClick={() => refreshStarters(true)}
          >
            {refreshing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Refresh starters
          </Button>
        </div>
      </aside>

      {/* Document workspace */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-studio-canvas">
        {/* Document header */}
        <div className="shrink-0 border-b border-border/80 bg-card/95 px-3 py-2.5 backdrop-blur sm:px-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={polishing}
                className="h-9 border-transparent bg-transparent px-1 text-base font-semibold shadow-none focus-visible:border-border focus-visible:bg-background"
                placeholder="Letter title"
                aria-label="Letter title"
              />
              <div className="mt-0.5 flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
                {saveStatus === "saved" ? (
                  <Check className="size-3 text-emerald-600" />
                ) : saveStatus === "saving" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : null}
                <span>{statusLabel}</span>
                {!selectedId ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{letterTypeLabel(type)}</span>
                  </>
                ) : null}
              </div>
            </div>

            <Button
              type="button"
              variant={showSampleFill ? "secondary" : "outline"}
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setShowSampleFill((v) => !v)}
            >
              <Eye className="size-3.5" />
              {showSampleFill ? "Edit" : "Preview"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => void save()}
              disabled={saving || polishing}
            >
              {saving ? "Saving…" : "Save"}
            </Button>

            {selectedId ? (
              <Button
                type="button"
                size="sm"
                className="h-9 gap-1.5"
                disabled={polishing}
                onClick={() => {
                  if (saveStatus === "unsaved") {
                    toast.message("You have unsaved changes — save first for the latest letter");
                  }
                  navigate(`/letters/batches/new?templateId=${selectedId}`);
                }}
              >
                <Send className="size-3.5" />
                Use in send
              </Button>
            ) : null}

            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 px-2"
                onClick={() => {
                  setMoreOpen((v) => !v);
                  setImproveOpen(false);
                }}
              >
                More
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
              {moreOpen && (
                <div className="absolute right-0 z-30 mt-1 w-64 space-y-3 rounded-xl border border-border bg-popover p-3 shadow-lg">
                  <div>
                    <Label className="text-xs">Letter type</Label>
                    <select
                      className="mt-1 flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                      value={type}
                      onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
                      disabled={!!selectedId || polishing}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {letterTypeLabel(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Preview brand</Label>
                    <select
                      className="mt-1 flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                      value={previewBrandId}
                      onChange={(e) => setPreviewBrandId(e.target.value)}
                    >
                      <option value="">None</option>
                      {brands.map((b: { id: string; name: string }) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-full justify-between"
                      disabled={polishing}
                      onClick={() => setImproveOpen((v) => !v)}
                    >
                      {polishing ? "Improving…" : "Help me write"}
                      <ChevronDown className="size-3.5" />
                    </Button>
                    {improveOpen && !polishing && (
                      <div className="absolute left-0 right-0 z-40 mt-1 rounded-lg border border-border bg-popover p-1 shadow-md">
                        {(
                          [
                            ["formal", "Make more formal"],
                            ["concise", "Make shorter"],
                            ["add-disclaimer", "Add disclaimer"],
                          ] as const
                        ).map(([mode, label]) => (
                          <button
                            key={mode}
                            type="button"
                            className="block w-full rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted"
                            onClick={() => polish(mode)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {polishPreview && (
            <div className="mt-2 rounded-xl border border-primary/20 bg-background p-3 text-sm shadow-sm">
              <div className="mb-1 font-semibold text-foreground">AI suggestion</div>
              <p className="mb-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                {polishPreview}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="h-8" onClick={applyPolish}>
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={() => {
                    setPolishPreview(null);
                    setPolishContentJson(null);
                  }}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* A4 canvas */}
        <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-8">
          {polishing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-studio-canvas/80 backdrop-blur-[1px]">
              <StudioSkeleton className="h-10 w-10 rounded-full" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Improving letter…</p>
                <p className="mt-0.5 text-xs text-muted-foreground">It will appear when ready</p>
              </div>
            </div>
          )}

          <div
            className="mx-auto w-full max-w-[794px] overflow-hidden rounded-sm bg-[#FFFEFA] shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_40px_rgba(15,23,42,0.12)] ring-1 ring-black/5"
            style={{ fontFamily, minHeight: "1123px" }}
          >
            {(previewBrand?.letterheadKey || previewBrand?.name) && (
              <div className="border-b border-border/60 px-10 pt-8 pb-4 sm:px-14">
                {previewBrand?.name && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {previewBrand.name}
                  </p>
                )}
                {(previewBrand?.signatoryName || previewBrand?.footerText) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[previewBrand.signatoryName, previewBrand.signatoryDesignation]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            )}

            {showSampleFill ? (
              <div className="min-h-[640px] whitespace-pre-wrap px-10 py-12 text-[15px] leading-[1.65] text-foreground sm:px-14">
                {samplePreviewText || "Empty letter — switch to Edit to add content."}
                {previewBrand?.signatoryName && (
                  <div className="mt-12 text-sm">
                    <p className="font-semibold">{previewBrand.signatoryName}</p>
                    {previewBrand.signatoryDesignation && (
                      <p className="text-muted-foreground">{previewBrand.signatoryDesignation}</p>
                    )}
                  </div>
                )}
                {previewBrand?.footerText && (
                  <p className="mt-10 border-t border-border pt-3 text-[11px] text-muted-foreground">
                    {previewBrand.footerText}
                  </p>
                )}
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex min-h-[640px] items-center justify-center">
                    <StudioSkeleton className="h-8 w-8 rounded-full" />
                  </div>
                }
              >
                <LetterEditor
                  key={`${selectedId || "blank"}-${editorKey}`}
                  contentJson={content}
                  onChange={setContent}
                  onWriteWithAi={() => setAiOpen(true)}
                />
              </Suspense>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border bg-card px-4 py-3 sm:hidden">
          <Button onClick={() => void save()} disabled={saving || polishing} className="h-9">
            {saving ? "Saving…" : "Save"}
          </Button>
          {selectedId && (
            <Button
              variant="outline"
              className="h-9"
              disabled={polishing}
              onClick={() => navigate(`/letters/batches/new?templateId=${selectedId}`)}
            >
              Use in send
            </Button>
          )}
        </div>
      </div>

      <LetterAiDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        organizationId={orgId()}
        defaultType={type}
        hasExistingContent={hasExistingContent}
        onInsert={insertAiDraft}
      />
    </div>
  );
}
