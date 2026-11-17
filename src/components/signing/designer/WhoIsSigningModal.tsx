import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Info, Plus, Trash2, User, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { signingApi } from "@/services/signingApi";
import {
  SIGNING_LIMITS,
  type SignFlowType,
  type SignRecipient,
  type SignRecipientRole,
} from "@/lib/signing/types";

export type WhoSigningMode = "only_you" | "only_others" | "you_and_others";

type DraftPerson = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SignRecipientRole;
};

interface WhoIsSigningModalProps {
  isOpen: boolean;
  documentId: string;
  defaultSelf?: { name?: string; email?: string };
  /** When adding more people after the first setup, start on others form. */
  initialMode?: WhoSigningMode | null;
  onClose: () => void;
  onComplete: (result: {
    recipients: SignRecipient[];
    flowType: SignFlowType;
    selfSign: boolean;
  }) => void;
}

const MODE_CHIPS: {
  id: WhoSigningMode;
  label: string;
  hint: string;
  icon: "user" | "users" | "both";
}[] = [
  {
    id: "only_you",
    label: "Only me",
    hint: "Place fields, then Sign now",
    icon: "user",
  },
  {
    id: "only_others",
    label: "Someone else",
    hint: "Send for others to sign",
    icon: "users",
  },
  {
    id: "you_and_others",
    label: "Several people",
    hint: "You and others sign",
    icon: "both",
  },
];

const ROLE_OPTIONS: { value: SignRecipientRole; label: string }[] = [
  { value: "SIGNER", label: "Signer" },
  { value: "APPROVER", label: "Approver" },
  { value: "VIEWER", label: "Viewer" },
  { value: "CC", label: "CC" },
];

function splitName(name?: string): { firstName: string; lastName: string } {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function joinName(firstName: string, lastName: string, email: string): string {
  const full = `${firstName.trim()} ${lastName.trim()}`.trim();
  if (full) return full;
  return email.trim().split("@")[0] || "Signer";
}

function newDraft(partial?: Partial<DraftPerson>): DraftPerson {
  return {
    id: crypto.randomUUID(),
    email: "",
    firstName: "",
    lastName: "",
    role: "SIGNER",
    ...partial,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function ChipIcon({ icon }: { icon: "user" | "users" | "both" }) {
  if (icon === "user") return <User className="size-4" aria-hidden />;
  if (icon === "users") return <Users className="size-4" aria-hidden />;
  return (
    <span className="inline-flex items-center gap-0.5">
      <User className="size-3.5" aria-hidden />
      <Users className="size-3.5" aria-hidden />
    </span>
  );
}

function PersonRow({
  person,
  emailRequired,
  emailLabel,
  onChange,
  onRemove,
  canRemove,
}: {
  person: DraftPerson;
  emailRequired?: boolean;
  emailLabel: string;
  onChange: (next: DraftPerson) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  const set =
    (key: keyof DraftPerson) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      onChange({ ...person, [key]: e.target.value });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr_1fr_7.5rem_auto] sm:items-end">
      <div className="space-y-1.5">
        <Label className="text-xs">
          {emailLabel}
          {emailRequired ? <span className="text-destructive"> *</span> : null}
        </Label>
        <Input
          type="email"
          value={person.email}
          onChange={set("email")}
          placeholder="name@company.com"
          className="h-9"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">First name</Label>
        <Input value={person.firstName} onChange={set("firstName")} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Last name</Label>
        <Input value={person.lastName} onChange={set("lastName")} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Role</Label>
        <Select
          value={person.role}
          onValueChange={(v) => onChange({ ...person, role: v as SignRecipientRole })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove signer"
        >
          <Trash2 className="size-4" />
        </Button>
      ) : (
        <span className="hidden sm:block" />
      )}
    </div>
  );
}

export function WhoIsSigningModal({
  isOpen,
  documentId,
  defaultSelf,
  initialMode = null,
  onClose,
  onComplete,
}: WhoIsSigningModalProps) {
  const selfParts = useMemo(() => splitName(defaultSelf?.name), [defaultSelf?.name]);

  const [selectedMode, setSelectedMode] = useState<WhoSigningMode | null>(null);
  const [setSigningOrder, setSetSigningOrder] = useState(false);
  const [selfDraft, setSelfDraft] = useState<DraftPerson>(() =>
    newDraft({
      email: defaultSelf?.email ?? "",
      firstName: selfParts.firstName,
      lastName: selfParts.lastName,
      role: "SIGNER",
    })
  );
  const [others, setOthers] = useState<DraftPerson[]>([newDraft()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedMode(initialMode);
    setSetSigningOrder(false);
    setSelfDraft(
      newDraft({
        email: defaultSelf?.email ?? "",
        firstName: selfParts.firstName,
        lastName: selfParts.lastName,
        role: "SIGNER",
      })
    );
    setOthers([newDraft()]);
    setSubmitting(false);
  }, [isOpen, initialMode, defaultSelf?.email, selfParts.firstName, selfParts.lastName]);

  const updateOther = (id: string, next: DraftPerson) => {
    setOthers((rows) => rows.map((r) => (r.id === id ? next : r)));
  };

  const addOther = () => {
    if (others.length >= SIGNING_LIMITS.maxRecipientsPerDocument) {
      toast.error(`You can add up to ${SIGNING_LIMITS.maxRecipientsPerDocument} people.`);
      return;
    }
    setOthers((rows) => [...rows, newDraft()]);
  };

  const removeOther = (id: string) => {
    setOthers((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  };

  const handleContinue = async () => {
    if (!selectedMode) {
      toast.error("Choose who will sign.");
      return;
    }

    if (selectedMode === "only_you" || selectedMode === "you_and_others") {
      if (!isValidEmail(selfDraft.email)) {
        toast.error("Enter a valid email for yourself.");
        return;
      }
    }

    if (selectedMode === "only_others" || selectedMode === "you_and_others") {
      const filled = others.filter((o) => o.email.trim());
      if (filled.length === 0) {
        toast.error("Add at least one other signer with an email.");
        return;
      }
      const bad = filled.find((o) => !isValidEmail(o.email));
      if (bad) {
        toast.error(`Invalid email: ${bad.email}`);
        return;
      }
    }

    const flowType: SignFlowType = setSigningOrder ? "SEQUENTIAL" : "PARALLEL";
    const selfSign = selectedMode === "only_you";

    setSubmitting(true);
    try {
      await signingApi.updateDocument(documentId, { flowType });

      const created: SignRecipient[] = [];
      let order = 1;

      if (selectedMode === "only_you" || selectedMode === "you_and_others") {
        const me = await signingApi.addRecipient(documentId, {
          name: joinName(selfDraft.firstName, selfDraft.lastName, selfDraft.email),
          email: selfDraft.email.trim(),
          role: selfDraft.role,
          authMethod: "NONE",
          signingOrder: order++,
        });
        created.push(me);
      }

      if (selectedMode === "only_others" || selectedMode === "you_and_others") {
        for (const row of others.filter((o) => o.email.trim())) {
          const recipient = await signingApi.addRecipient(documentId, {
            name: joinName(row.firstName, row.lastName, row.email),
            email: row.email.trim(),
            role: row.role,
            authMethod: "NONE",
            signingOrder: order++,
          });
          created.push(recipient);
        }
      }

      onComplete({ recipients: created, flowType, selfSign });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save signers.");
    } finally {
      setSubmitting(false);
    }
  };

  const modeMeta = MODE_CHIPS.find((m) => m.id === selectedMode);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,720px)] w-[min(96vw,640px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-5 py-4 pr-12 text-left">
          <DialogTitle>Who&apos;s signing?</DialogTitle>
          <DialogDescription>
            Pick a quick option, add emails, then place signature fields on the PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MODE_CHIPS.map((mode) => {
              const selected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-foreground/20 hover:bg-muted/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      selected ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
                    )}
                  >
                    <ChipIcon icon={mode.icon} />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{mode.label}</span>
                  <span className="text-[11px] leading-snug text-muted-foreground">{mode.hint}</span>
                </button>
              );
            })}
          </div>

          {selectedMode ? (
            <div className="space-y-5">
              <p className="text-xs font-medium text-muted-foreground">
                {modeMeta?.label} — {modeMeta?.hint}
              </p>

              {selectedMode !== "only_you" && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span>Sign one after another</span>
                    <Info className="size-3.5 text-muted-foreground" aria-hidden />
                  </div>
                  <Switch
                    checked={setSigningOrder}
                    onCheckedChange={setSetSigningOrder}
                    aria-label="Sign one after another"
                  />
                </div>
              )}

              {(selectedMode === "only_you" || selectedMode === "you_and_others") && (
                <section className="space-y-3">
                  <div className="text-sm font-semibold text-foreground">Your details</div>
                  <PersonRow
                    person={selfDraft}
                    emailRequired
                    emailLabel="Your email"
                    onChange={setSelfDraft}
                  />
                </section>
              )}

              {(selectedMode === "only_others" || selectedMode === "you_and_others") && (
                <section className="space-y-3">
                  <div className="text-sm font-semibold text-foreground">Other signers</div>
                  <div className="space-y-4">
                    {others.map((row) => (
                      <PersonRow
                        key={row.id}
                        person={row}
                        emailRequired
                        emailLabel="Email"
                        onChange={(next) => updateOther(row.id, next)}
                        canRemove={others.length > 1}
                        onRemove={() => removeOther(row.id)}
                      />
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addOther}>
                    <Plus className="mr-1 size-3.5" />
                    Add signer
                  </Button>
                </section>
              )}

              {selectedMode === "only_you" && (
                <p className="rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm leading-relaxed text-sky-900">
                  Place your signature fields on the PDF, then click{" "}
                  <span className="font-semibold">Sign now</span> when you&apos;re ready.
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Choose who will sign to continue.
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-4 sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleContinue} disabled={submitting || !selectedMode}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
