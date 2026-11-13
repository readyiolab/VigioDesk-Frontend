import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { lettersApi } from "@/services/lettersApi";
import { tipTapDocToPlainText } from "@/lib/tipTapLetter";
import { letterTypeLabel } from "./letterFields";
import { toast } from "sonner";

const TYPES = [
  "INCREMENT",
  "PROMOTION",
  "SALARY_REVISION",
  "OFFER",
  "CONFIRMATION",
  "WARNING",
  "SEPARATION",
] as const;

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "formal", label: "Formal" },
  { id: "friendly", label: "Friendly" },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  defaultType: string;
  hasExistingContent: boolean;
  onInsert: (contentJson: any) => void;
};

export function LetterAiDialog({
  open,
  onOpenChange,
  organizationId,
  defaultType,
  hasExistingContent,
  onInsert,
}: Props) {
  const [instruction, setInstruction] = useState("");
  const [letterType, setLetterType] = useState(defaultType || "INCREMENT");
  const [tone, setTone] = useState<(typeof TONES)[number]["id"]>("professional");
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewJson, setPreviewJson] = useState<any | null>(null);
  const [previewText, setPreviewText] = useState("");

  const reset = () => {
    setPreviewJson(null);
    setPreviewText("");
  };

  const buildPrompt = () => {
    const parts = [instruction.trim()];
    if (tone) parts.push(`Tone: ${tone}.`);
    if (extra.trim()) parts.push(extra.trim());
    return parts.filter(Boolean).join("\n");
  };

  const generate = async () => {
    if (!instruction.trim()) {
      toast.error("Describe the letter you need");
      return;
    }
    setBusy(true);
    try {
      const result = await lettersApi.aiDraft(organizationId, {
        instruction: buildPrompt(),
        letterType,
      });
      const draft = result.contentJson;
      setPreviewJson(draft);
      setPreviewText(tipTapDocToPlainText(draft));
    } catch (e: any) {
      toast.error(e.message || "AI draft failed");
    } finally {
      setBusy(false);
    }
  };

  const insert = () => {
    if (!previewJson) return;
    if (hasExistingContent) {
      const ok = window.confirm(
        "Replace the current letter with this AI draft? You can undo after inserting if needed by not saving."
      );
      if (!ok) return;
    }
    onInsert(previewJson);
    onOpenChange(false);
    reset();
    toast.success("Draft inserted — review and Save");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border px-5 py-4 text-left">
          <DialogTitle>Create your letter with AI</DialogTitle>
          <DialogDescription>
            Tell AI what letter you need, then insert the result into the editor.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {!previewJson ? (
            <>
              <div>
                <Label>What kind of letter would you like to write?</Label>
                <Textarea
                  className="mt-1.5 min-h-[88px]"
                  placeholder="e.g. Write a professional offer letter for a new software developer."
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Letter type</Label>
                  <select
                    className="mt-1.5 flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={letterType}
                    onChange={(e) => setLetterType(e.target.value)}
                    disabled={busy}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {letterTypeLabel(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Tone</Label>
                  <select
                    className="mt-1.5 flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={tone}
                    onChange={(e) => setTone(e.target.value as typeof tone)}
                    disabled={busy}
                  >
                    {TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Additional instructions (optional)</Label>
                <Textarea
                  className="mt-1.5 min-h-[64px]"
                  placeholder="Mention probation, joining date, CTC band…"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  disabled={busy}
                />
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Preview
              </p>
              <div className="mt-2 max-h-[40vh] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
                {previewText || "Empty draft"}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border px-5 py-3 sm:justify-between">
          {!previewJson ? (
            <>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={busy || !instruction.trim()} onClick={() => void generate()}>
                {busy ? <Spinner className="mr-2 size-4" /> : null}
                {busy ? "Generating…" : "Generate letter"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  reset();
                  void generate();
                }}
              >
                {busy ? <Spinner className="mr-2 size-4" /> : null}
                Regenerate
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => reset()}>
                  Edit prompt
                </Button>
                <Button type="button" onClick={insert}>
                  Insert into editor
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
