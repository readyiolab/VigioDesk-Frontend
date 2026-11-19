import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck,
  FileText,
  History,
  Mail,
  RotateCw,
  ShieldCheck,
  XCircle,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { signingApi, type DocumentStatus } from "@/services/signingApi";
import type { SignRecipientStatus } from "@/lib/signing/types";
import { AuditTrail } from "./AuditTrail";

/** Presentation per recipient status. */
const STATUS: Record<SignRecipientStatus, { label: string; icon: typeof Clock; className: string }> = {
  PENDING: { label: "Not emailed yet", icon: Clock, className: "text-amber-700 dark:text-amber-500" },
  SENT: { label: "Emailed — not opened", icon: Mail, className: "text-blue-600 dark:text-blue-400" },
  VIEWED: { label: "Opened", icon: Eye, className: "text-amber-600 dark:text-amber-500" },
  COMPLETED: { label: "Signed", icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-500" },
  DECLINED: { label: "Declined", icon: XCircle, className: "text-destructive" },
};

function fmtIST(value: string | null): string | null {
  if (!value) return null;
  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value)) + " IST"
  );
}

function truncateHash(hash: string): string {
  if (hash.length <= 20) return hash;
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

interface StatusTrackerProps {
  documentId: string;
}

/**
 * The owner's post-send view: who has signed, who hasn't, and the finished
 * artifacts once everyone is done.
 *
 * Polls while the document is still in flight so the owner sees a signature land
 * without refreshing — but stops once the document reaches a terminal state, so
 * a completed document isn't hammering the API forever.
 */
export function StatusTracker({ documentId }: StatusTrackerProps) {
  const [status, setStatus] = useState<DocumentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"doc" | "cert" | "source" | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [confirmVoid, setConfirmVoid] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const data = await signingApi.getStatus(documentId);
        if (!active) return;
        setStatus(data);
        setIsLoading(false);
        if (data.status === "SENT" || data.status === "FINALIZING") timer = setTimeout(poll, 8000);
      } catch {
        if (active) setIsLoading(false);
      }
    };
    poll();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [documentId]);

  const handleResend = async (recipientId: string, name: string) => {
    setResending(recipientId);
    try {
      const result = await signingApi.resend(documentId, recipientId);
      const failed = result.notified?.filter((n) => !n.delivered) ?? [];
      if (failed.length) {
        toast.error(
          failed[0]?.error
            ? `Couldn't email ${name}: ${failed[0].error}`
            : `Couldn't email ${name}. Check SMTP settings.`
        );
      } else {
        toast.success(`Invitation emailed to ${name}.`);
        const data = await signingApi.getStatus(documentId);
        setStatus(data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the reminder.");
    } finally {
      setResending(null);
    }
  };

  const handleDownload = async (kind: "doc" | "cert" | "source") => {
    setDownloading(kind);
    try {
      const { url } =
        kind === "doc"
          ? await signingApi.getDownloadUrl(documentId)
          : kind === "cert"
            ? await signingApi.getCertificateUrl(documentId)
            : await signingApi.getSourceDownloadUrl(documentId);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't get the download link.");
    } finally {
      setDownloading(null);
    }
  };

  const handleVoid = async () => {
    setIsVoiding(true);
    try {
      await signingApi.voidDocument(documentId);
      const data = await signingApi.getStatus(documentId);
      setStatus(data);
      setConfirmVoid(false);
      toast.success("Signing request cancelled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel the document.");
    } finally {
      setIsVoiding(false);
    }
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success("Fingerprint copied.");
    } catch {
      toast.error("Couldn't copy the fingerprint.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Loading status…
      </div>
    );
  }
  if (!status) return null;

  const signedVersion = status.versions.find((v) => v.digitallySigned) ?? status.versions[0];
  const seal = status.seal;
  const isDone = status.status === "COMPLETED";
  const isSealing = status.status === "FINALIZING" || seal?.state === "sealing";
  const isUnsignedComplete = seal?.state === "completed_unsigned";
  const isDeclined = status.status === "DECLINED";
  const isVoided = status.status === "VOIDED";
  const isExpired = status.status === "EXPIRED";
  const canVoid = status.status === "SENT" || status.status === "FINALIZING";

  const statusChip = isDone
    ? { label: "Done", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" }
    : isDeclined
      ? { label: "Declined", className: "bg-destructive/10 text-destructive" }
      : isVoided
        ? { label: "Cancelled", className: "bg-muted text-muted-foreground" }
        : isExpired
          ? { label: "Expired", className: "bg-amber-500/10 text-amber-800 dark:text-amber-400" }
          : isSealing
            ? { label: "Preparing", className: "bg-sky-500/10 text-sky-700 dark:text-sky-400" }
            : { label: "In progress", className: "bg-muted text-muted-foreground" };

  const headline = isDone
    ? "Everyone has signed"
    : isDeclined
      ? "Someone declined"
      : isVoided
        ? "Cancelled"
        : isExpired
          ? "Expired"
          : isSealing
            ? "Preparing your signed PDF"
            : "Waiting for signatures";

  const subtitle = isDone
    ? "Your signed PDF is ready to download."
    : isSealing
      ? seal?.message || "This usually takes a few seconds."
      : isVoided
        ? "This signing request was cancelled."
        : isExpired
          ? "The signing deadline has passed."
          : `${status.progress.signed} of ${status.progress.total} signed${
              status.flowType === "SEQUENTIAL" ? " · in order" : " · any order"
            }`;

  return (
    <div className="mx-auto h-full max-w-2xl space-y-4 overflow-y-auto p-4">
      <div className="space-y-3 border-b border-border pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold tracking-tight">{headline}</p>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", statusChip.className)}>
                {statusChip.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          {isDone ? (
            <FileCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
          ) : isDeclined || isVoided ? (
            <XCircle className="size-4 shrink-0 text-destructive" />
          ) : (
            <Clock
              className={cn("size-4 shrink-0", isSealing ? "animate-pulse text-sky-600" : "text-muted-foreground")}
            />
          )}
        </div>

        {isDone && isUnsignedComplete && (
          <p className="border border-amber-500/25 bg-amber-500/5 px-2.5 py-2 text-xs text-amber-800 dark:text-amber-400">
            Extra protection did not finish. You can still download the signed PDF and certificate.
          </p>
        )}

        <Progress
          value={status.progress.total ? (status.progress.signed / status.progress.total) * 100 : 0}
          className="h-1"
        />

        {canVoid && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmVoid(true)}
            disabled={isVoiding}
          >
            {isVoiding ? <Spinner className="size-3.5" /> : <Ban className="size-3.5" />}
            Cancel request
          </Button>
        )}
      </div>

      {isDone && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleDownload("doc")}
              disabled={downloading !== null}
              className="w-full justify-center"
              size="lg"
            >
              {downloading === "doc" ? <Spinner className="size-4" /> : <Download />}
              Download signed PDF
            </Button>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Your signed document pages only. Use Certificate only for the completion record.
            </p>
            <Button
              variant="outline"
              onClick={() => handleDownload("cert")}
              disabled={downloading !== null}
              className="w-full justify-center"
            >
              {downloading === "cert" ? <Spinner className="size-4" /> : <ShieldCheck />}
              Certificate only
            </Button>
            {status.sourceFileName && (
              <Button
                variant="outline"
                onClick={() => handleDownload("source")}
                disabled={downloading !== null}
                className="w-full justify-center"
              >
                {downloading === "source" ? <Spinner className="size-4" /> : <FileText />}
                Original Word file
              </Button>
            )}
          </div>

          {(signedVersion?.sha256 || signedVersion?.digitallySigned) && (
            <div>
              <button
                type="button"
                onClick={() => setShowSecurity((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                aria-expanded={showSecurity}
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Document security
                </span>
                <ChevronDown className={cn("size-4 transition-transform", showSecurity && "rotate-180")} />
              </button>
              {showSecurity && (
                <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  {signedVersion.digitallySigned && (
                    <p className="font-medium text-foreground">Protected against changes after signing.</p>
                  )}
                  {signedVersion.tsaTimestamp && (
                    <p>Trusted timestamp: {fmtIST(signedVersion.tsaTimestamp)}</p>
                  )}
                  {signedVersion.sha256 && (
                    <div className="flex items-start gap-2">
                      <p className="min-w-0 flex-1 break-all font-mono text-[11px]">
                        Fingerprint: {truncateHash(signedVersion.sha256)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0"
                        aria-label="Copy fingerprint"
                        onClick={() => void copyHash(signedVersion.sha256!)}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                  )}
                  {signedVersion.selfSignedCert && (
                    <p>
                      Some PDF readers may show a trust warning until a company certificate is configured.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Recipients</p>
        <div className="space-y-2">
          {status.recipients.map((r, i) => {
            const meta = STATUS[r.status];
            const Icon = meta.icon;
            const when =
              r.status === "COMPLETED"
                ? fmtIST(r.completedAt)
                : r.status === "VIEWED"
                  ? fmtIST(r.viewedAt)
                  : null;
            const canRemind =
              status.status === "SENT" && r.status !== "COMPLETED" && r.status !== "DECLINED";

            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: r.color }}
                  >
                    {status.flowType === "SEQUENTIAL" ? i + 1 : r.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                      </div>
                      {canRemind && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0"
                          onClick={() => handleResend(r.id, r.name)}
                          disabled={resending === r.id}
                          aria-label={`Send reminder to ${r.name}`}
                          title="Send reminder"
                        >
                          {resending === r.id ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <RotateCw className="size-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium", meta.className)}>
                        <Icon className="size-3.5" />
                        {meta.label}
                      </span>
                      {when && <span className="text-[11px] text-muted-foreground">{when}</span>}
                    </div>
                    {r.status === "DECLINED" && r.declineReason && (
                      <p className="mt-1 text-[11px] text-destructive">Reason: {r.declineReason}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Each person gets a private email link. Use remind to send it again.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowActivity((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          aria-expanded={showActivity}
        >
          <span className="flex items-center gap-1.5">
            <History className="size-3.5" />
            Activity log
          </span>
          <ChevronDown className={cn("size-4 transition-transform", showActivity && "rotate-180")} />
        </button>
        {showActivity && (
          <div className="mt-2 rounded-xl border border-border bg-card p-4">
            <AuditTrail documentId={documentId} />
            <p className="mt-1 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
              IP address and device are recorded for each action when available.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={confirmVoid} onOpenChange={(open) => !open && !isVoiding && setConfirmVoid(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this signing request?</AlertDialogTitle>
            <AlertDialogDescription>
              Recipients will no longer be able to sign, and this can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVoiding}>Keep request</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isVoiding}
              onClick={(e) => {
                e.preventDefault();
                void handleVoid();
              }}
            >
              {isVoiding ? "Cancelling…" : "Cancel request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
