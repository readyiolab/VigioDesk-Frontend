import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import {
  History,
  ImagePlus,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { diagramsApi } from "@/services/diagramsApi";
import type { DiagramDocument, DiagramPage } from "@/lib/diagram/model";

type InsertMode = "replace" | "append" | "newPage";
type AiMode = "generate" | "edit";
type BusyPhase = "idle" | "generating" | "validating";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  document?: DiagramDocument;
  page?: DiagramPage;
  previewSvg?: string;
  error?: boolean;
  timedOut?: boolean;
  /** Which action produced this message — used for Retry. */
  action?: AiMode | "image";
  retryText?: string;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  diagramId: string | null;
  currentPage: DiagramPage | null;
  onInsertDocument: (doc: DiagramDocument, mode: InsertMode) => void;
  onInsertPage: (page: DiagramPage) => void;
  onEditedPage: (page: DiagramPage) => void;
  className?: string;
};

const SUGGESTED = [
  {
    label: "ER catalog",
    prompt:
      "ER diagram for an e-commerce catalog: products, variants, categories, inventory.",
  },
  {
    label: "Payment flow",
    prompt:
      "Payment flow: customer → checkout → payment service → bank APIs, with fraud checks and webhooks.",
  },
  {
    label: "AWS layers",
    prompt: "Layered AWS architecture: VPC, ALB, ECS, RDS, Redis cache.",
  },
  {
    label: "Signup sequence",
    prompt: "Sequence diagram for user signup with email verification and OAuth.",
  },
];

function storageKey(diagramId: string | null) {
  return `diagram_ai_sessions:${diagramId || "new"}`;
}

function loadSessions(diagramId: string | null): ChatSession[] {
  try {
    const raw = localStorage.getItem(storageKey(diagramId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(diagramId: string | null, sessions: ChatSession[]) {
  try {
    localStorage.setItem(storageKey(diagramId), JSON.stringify(sessions));
  } catch {
    /* quota */
  }
}

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isTimeoutError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  return /timeout|timed out|AbortError|aborted/i.test(msg);
}

function friendlyAiError(e: unknown, kind: AiMode | "image"): string {
  if (isTimeoutError(e)) {
    return kind === "edit"
      ? "Edit timed out. Tap Retry — usually faster on the second try."
      : kind === "image"
        ? "Image conversion timed out. Please retry with a smaller image."
        : "That took too long. Tap Retry to try again.";
  }
  const msg = e instanceof Error ? e.message : String(e ?? "");
  if (/could not update the diagram page|valid diagram (document|patch)|invalid patch|invalid diagram/i.test(msg)) {
    return kind === "edit"
      ? "Couldn’t apply that edit. Try: “add an Inventory entity connected to Product”."
      : "AI returned an incomplete diagram. Tap Retry, or simplify your prompt (e.g. fewer entities).";
  }
  if (/credit|monthly|upgrade|FREE/i.test(msg)) {
    return msg;
  }
  if (/rate limit|too many/i.test(msg)) {
    return "Too many AI requests. Wait a minute and try again.";
  }
  if (/not configured|OPENAI/i.test(msg)) {
    return "Diagram AI is not configured on the server.";
  }
  return msg || (kind === "edit" ? "AI edit failed" : "AI generate failed");
}

export function AiChatPanel({
  open,
  onClose,
  organizationId,
  diagramId,
  currentPage,
  onInsertDocument,
  onInsertPage,
  onEditedPage,
  className,
}: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions(diagramId));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<AiMode>("generate");
  const [busyPhase, setBusyPhase] = useState<BusyPhase>("idle");
  const [historyOpen, setHistoryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const busy = busyPhase !== "idle";

  useEffect(() => {
    const loaded = loadSessions(diagramId);
    setSessions(loaded);
    setActiveId(loaded[0]?.id ?? null);
  }, [diagramId]);

  useEffect(() => {
    saveSessions(diagramId, sessions);
  }, [diagramId, sessions]);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId]
  );

  const persist = useCallback((next: ChatSession[]) => {
    setSessions(next);
  }, []);

  const newChat = () => {
    const s: ChatSession = {
      id: uid(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    persist([s, ...sessions]);
    setActiveId(s.id);
    setPrompt("");
    setMode("generate");
  };

  const deleteSession = (id: string) => {
    const next = sessions.filter((s) => s.id !== id);
    persist(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const ensureSession = (): string => {
    if (activeId) return activeId;
    const s: ChatSession = {
      id: uid(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    persist([s, ...sessions]);
    setActiveId(s.id);
    return s.id;
  };

  const appendMessages = (sessionId: string, msgs: ChatMessage[], title?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const nextMsgs = [...s.messages, ...msgs];
        return {
          ...s,
          title: title ?? s.title,
          updatedAt: Date.now(),
          messages: nextMsgs,
        };
      })
    );
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, busyPhase]);

  const runGenerate = async (text: string) => {
    const sessionId = ensureSession();
    const userMsg: ChatMessage = { id: uid(), role: "user", text };
    appendMessages(
      sessionId,
      [userMsg],
      text.length > 48 ? `${text.slice(0, 48)}…` : text
    );
    setPrompt("");
    setBusyPhase("generating");
    try {
      const { document } = await diagramsApi.aiGenerate(organizationId, text);
      setBusyPhase("validating");
      appendMessages(sessionId, [
        {
          id: uid(),
          role: "assistant",
          text: "Diagram ready — applied to your canvas.",
          document,
          action: "generate",
          retryText: text,
        },
      ]);
      onInsertDocument(document, "replace");
    } catch (e) {
      appendMessages(sessionId, [
        {
          id: uid(),
          role: "assistant",
          text: friendlyAiError(e, "generate"),
          error: true,
          timedOut: isTimeoutError(e),
          action: "generate",
          retryText: text,
        },
      ]);
    } finally {
      setBusyPhase("idle");
    }
  };

  const runEdit = async (text: string) => {
    if (!diagramId || !currentPage) {
      const sessionId = ensureSession();
      appendMessages(sessionId, [
        { id: uid(), role: "user", text },
        {
          id: uid(),
          role: "assistant",
          text: "Save the diagram first, then use Edit page.",
          error: true,
        },
      ]);
      setPrompt("");
      return;
    }
    const sessionId = ensureSession();
    appendMessages(sessionId, [{ id: uid(), role: "user", text }]);
    setPrompt("");
    setBusyPhase("generating");
    try {
      const { page } = await diagramsApi.aiEdit(organizationId, diagramId, text, currentPage);
      setBusyPhase("validating");
      appendMessages(sessionId, [
        {
          id: uid(),
          role: "assistant",
          text: "Edit applied to the current page.",
          page,
          action: "edit",
          retryText: text,
        },
      ]);
      onEditedPage(page);
    } catch (e) {
      appendMessages(sessionId, [
        {
          id: uid(),
          role: "assistant",
          text: friendlyAiError(e, "edit"),
          error: true,
          timedOut: isTimeoutError(e),
          action: "edit",
          retryText: text,
        },
      ]);
    } finally {
      setBusyPhase("idle");
    }
  };

  const runFromImage = async (file: File, hint?: string) => {
    if (file.size > 5 * 1024 * 1024) {
      const sessionId = ensureSession();
      appendMessages(sessionId, [
        {
          id: uid(),
          role: "assistant",
          text: "Image must be 5MB or smaller.",
          error: true,
        },
      ]);
      return;
    }
    const sessionId = ensureSession();
    const label = hint?.trim() || `Image: ${file.name}`;
    appendMessages(sessionId, [{ id: uid(), role: "user", text: label }]);
    setBusyPhase("generating");
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
      const imageBase64 = btoa(binary);
      const { document } = await diagramsApi.aiFromImage(organizationId, {
        imageBase64,
        mimeType: (file.type as "image/png" | "image/jpeg") || "image/png",
        prompt: hint || undefined,
      });
      setBusyPhase("validating");
      appendMessages(sessionId, [
        {
          id: uid(),
          role: "assistant",
          text: "Diagram from your image — applied to canvas.",
          document,
          action: "image",
          retryText: hint,
        },
      ]);
      onInsertDocument(document, "replace");
    } catch (e) {
      appendMessages(sessionId, [
        {
          id: uid(),
          role: "assistant",
          text: friendlyAiError(e, "image"),
          error: true,
          timedOut: isTimeoutError(e),
          action: "image",
        },
      ]);
    } finally {
      setBusyPhase("idle");
    }
  };

  const retryMessage = (m: ChatMessage) => {
    const text = m.retryText?.trim();
    if (!text) return;
    if (m.action === "edit") void runEdit(text);
    else void runGenerate(text);
  };

  const send = () => {
    const text = prompt.trim();
    if (text.length < 2 || busy) return;
    if (mode === "edit") void runEdit(text);
    else void runGenerate(text);
  };

  if (!open) return null;

  const empty = !active || active.messages.length === 0;
  const editDisabled = !diagramId;

  return (
    <aside
      className={cn(
        "flex h-full w-full max-w-[400px] flex-col border-l border-[#cfd8e3] bg-white",
        className
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-[#e2e8f0] px-3">
        <h2 className="text-sm font-semibold text-[#0f172a]">Diagram AI</h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-label="Chat history"
            title="Chat history"
          >
            <History className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-xs" onClick={newChat} aria-label="New chat">
            <Plus className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {historyOpen ? (
          <div className="flex w-[112px] shrink-0 flex-col border-r border-[#e2e8f0] bg-[#f8fafc]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="m-2 justify-start gap-1.5 rounded-md text-xs"
              onClick={newChat}
            >
              <Plus className="size-3.5" />
              New Chat
            </Button>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1.5 pb-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-md px-2 py-1.5 text-xs",
                    s.id === activeId
                      ? "bg-white text-[#0f172a] shadow-sm ring-1 ring-[#e2e8f0]"
                      : "text-[#64748b] hover:bg-[#eef2f7]"
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left"
                    onClick={() => setActiveId(s.id)}
                  >
                    {s.title}
                  </button>
                  <button
                    type="button"
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label="Delete session"
                    onClick={() => deleteSession(s.id)}
                  >
                    <Trash2 className="size-3 text-[#94a3b8]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-1 border-b border-[#e2e8f0] px-3 py-2">
            <button
              type="button"
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium",
                mode === "generate"
                  ? "bg-[#eff6ff] text-[#1d4ed8] ring-1 ring-[#bfdbfe]"
                  : "text-[#64748b] hover:bg-[#f1f5f9]"
              )}
              onClick={() => setMode("generate")}
            >
              Generate
            </button>
            <button
              type="button"
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium",
                mode === "edit"
                  ? "bg-[#eff6ff] text-[#1d4ed8] ring-1 ring-[#bfdbfe]"
                  : "text-[#64748b] hover:bg-[#f1f5f9]",
                editDisabled && "opacity-50"
              )}
              disabled={editDisabled}
              title={editDisabled ? "Save the diagram first" : "Edit the current page"}
              onClick={() => setMode("edit")}
            >
              Edit page
            </button>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {empty ? (
              <div className="space-y-2">
                <p className="text-xs text-[#64748b]">
                  {mode === "edit"
                    ? "Describe a change to the current page"
                    : "Pick a starter or describe your diagram"}
                </p>
                {mode === "generate" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        disabled={busy}
                        className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-left text-[11px] font-medium leading-snug text-[#334155] transition hover:border-[#93c5fd] hover:bg-white disabled:opacity-50"
                        onClick={() => void runGenerate(chip.prompt)}
                        title={chip.prompt}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              active?.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[95%] rounded-lg px-3 py-2 text-xs",
                    m.role === "user"
                      ? "ml-auto bg-[#2563eb] text-white"
                      : m.error
                        ? "bg-[#fef2f2] text-[#991b1b] ring-1 ring-[#fecaca]"
                        : "bg-[#f1f5f9] text-[#0f172a]"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {m.document || m.page ? (
                    <div className="mt-2 space-y-2">
                      <button
                        type="button"
                        className="flex h-24 w-full items-center justify-center overflow-hidden rounded-md border border-[#cbd5e1] bg-white"
                        onClick={() => {
                          if (m.document) onInsertDocument(m.document, "replace");
                          else if (m.page) onInsertPage(m.page);
                        }}
                        title="Apply again"
                      >
                        {m.previewSvg ? (
                          <div
                            className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(m.previewSvg, {
                                USE_PROFILES: { svg: true, svgFilters: true },
                              }),
                            }}
                          />
                        ) : (
                          <span className="text-[11px] text-[#64748b]">
                            Applied to canvas — click to re-apply
                          </span>
                        )}
                      </button>
                      {m.document ? (
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            className="rounded-md"
                            onClick={() => onInsertDocument(m.document!, "append")}
                          >
                            Insert again
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            className="rounded-md"
                            onClick={() => onInsertDocument(m.document!, "newPage")}
                          >
                            New page
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {m.error && m.retryText ? (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="mt-2 rounded-md"
                      disabled={busy}
                      onClick={() => retryMessage(m)}
                    >
                      Retry
                    </Button>
                  ) : null}
                </div>
              ))
            )}

            {busy ? (
              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                <Spinner className="size-4" />
                {busyPhase === "validating"
                  ? "Validating…"
                  : mode === "edit"
                    ? "Editing page…"
                    : "Generating diagram…"}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[#e2e8f0] p-2.5">
            <div className="relative rounded-lg border border-[#e2e8f0] bg-[#f8fafc] focus-within:border-[#93c5fd] focus-within:ring-2 focus-within:ring-[#93c5fd]/30">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "edit"
                    ? "e.g. Add an Inventory entity linked to Product"
                    : "Describe your diagram"
                }
                className="min-h-[72px] resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void runFromImage(f, prompt);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    aria-label="Attach image"
                    title="Generate from image"
                  >
                    <ImagePlus className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 gap-1.5 rounded-md px-3 text-xs"
                  disabled={busy || prompt.trim().length < 2 || (mode === "edit" && editDisabled)}
                  onClick={send}
                >
                  {busy ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
                  {mode === "edit" ? "Apply edit" : "Generate"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
