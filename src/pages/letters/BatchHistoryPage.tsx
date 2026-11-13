import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { lettersApi } from "@/services/lettersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, Download, Search } from "lucide-react";
import {
  StudioPageHeader,
  StudioPageBody,
  StudioSection,
  StudioEmptyState,
  StudioStatusChip,
} from "@/components/letters/StudioPageHeader";
import { useAuth } from "@/features/auth/useAuth";
import { useBatches } from "@/features/letters";
import { ensureLetterOrgId, readLetterOrgId } from "@/features/letters/orgHelpers";

function orgId() {
  return readLetterOrgId();
}

function humanBatchStatus(status: string): string {
  switch (status) {
    case "GENERATED":
      return "Ready";
    case "GENERATING":
      return "Making PDFs";
    case "SENDING":
      return "Sending";
    case "SENT":
      return "Sent";
    case "FAILED":
    case "CANCELLED":
      return "Needs fix";
    case "VALIDATED":
    case "MAPPED":
    case "IMPORTED":
    case "DRAFT":
      return "In progress";
    default:
      return status?.replace(/_/g, " ") || "In progress";
  }
}

function statusTone(
  status: string
): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "GENERATED":
    case "SENT":
      return "success";
    case "GENERATING":
    case "SENDING":
      return "info";
    case "FAILED":
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

function humanSendStatus(status: string): string {
  switch (status) {
    case "SENT":
    case "DELIVERED":
      return "Sent";
    case "DRAFT":
    case "DRAFT_CREATED":
      return "Draft ready";
    case "FAILED":
    case "BOUNCED":
      return "Needs fix";
    case "PENDING":
    case "QUEUED":
      return "Sending";
    default:
      return status?.replace(/_/g, " ") || "—";
  }
}

export default function BatchHistoryPage() {
  const { user } = useAuth();
  const batchesQuery = useBatches(user?.id);
  const batches = batchesQuery.data?.batches ?? [];
  const [question, setQuestion] = useState("Show me employees whose letter failed to send");
  const [results, setResults] = useState<any[] | null>(null);
  const [asking, setAsking] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (batchesQuery.error) {
      toast.error(
        batchesQuery.error instanceof Error ? batchesQuery.error.message : "Failed to load batches"
      );
    }
  }, [batchesQuery.error]);

  const runQuery = async () => {
    setAsking(true);
    try {
      await ensureLetterOrgId(user?.id);
      const res = await lettersApi.aiQuery(orgId(), question);
      setResults(res.results);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <StudioPageHeader
        title="Recent sends"
        description="Reopen a past send, download PDFs, or search by name."
      />
      <StudioPageBody>
        <div className="flex gap-2 rounded-xl border border-border bg-card p-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="border-0 pl-9 shadow-none focus-visible:ring-0"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask in plain language…"
              onKeyDown={(e) => e.key === "Enter" && runQuery()}
            />
          </div>
          <Button className="shrink-0 rounded-xl" onClick={runQuery} disabled={asking}>
            {asking ? "Searching…" : "Ask"}
          </Button>
        </div>

        {results && (
          <StudioSection title={`${results.length} matches`}>
            <div className="max-h-48 space-y-0 overflow-auto px-4 py-2 text-xs text-muted-foreground">
              {results.map((r) => (
                <div key={r.id} className="border-b border-border py-2 last:border-0">
                  {r.employee?.Employee_Name || "Employee"} ·{" "}
                  {humanSendStatus(r.sendStatus)}
                </div>
              ))}
            </div>
          </StudioSection>
        )}

        <StudioSection title="Recent sends">
          {batchesQuery.isLoading ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : batches.length === 0 ? (
            <StudioEmptyState title="No sends yet" description="Send letters from Excel to see them here." />
          ) : (
            <div className="divide-y divide-border">
              {batches.map((b: any) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <Link
                    to={`/letters/batches/${b.id}`}
                    className="min-w-0 flex-1 hover:text-primary"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-foreground">
                        {b.templateName || "Letter send"}
                      </span>
                      <StudioStatusChip tone={statusTone(b.status)}>
                        {humanBatchStatus(b.status)}
                      </StudioStatusChip>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {b.totalRows} people · {new Date(b.createdAt).toLocaleString()}
                    </div>
                  </Link>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg"
                      disabled={downloadingId === b.id}
                      onClick={async () => {
                        setDownloadingId(b.id);
                        try {
                          await ensureLetterOrgId(user?.id);
                          await lettersApi.downloadPdfsZip(orgId(), b.id);
                          toast.success("Download started");
                        } catch (e: any) {
                          toast.error(e.message);
                        } finally {
                          setDownloadingId(null);
                        }
                      }}
                    >
                      <Download className="mr-1 size-3.5" />
                      PDFs
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-lg"
                      onClick={async () => {
                        try {
                          await ensureLetterOrgId(user?.id);
                          await lettersApi.report(orgId(), b.id);
                          toast.message("Report ready");
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      Report
                      <ArrowRight className="ml-1 size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StudioSection>
      </StudioPageBody>
    </div>
  );
}
