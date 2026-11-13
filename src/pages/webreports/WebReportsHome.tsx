import { useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Globe,
  Search,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Share2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/services/api";
import { useCreateWebReport, useWebReportList, useWebReportActions } from "@/features/webreports/queries";
import { scanStepTitle } from "@/features/webreports/stageLabel";
import type { WebReport } from "@/features/webreports/types";
import { cn } from "@/lib/utils";

const QUICK_SAMPLES = [
  { label: "Stripe", url: "https://stripe.com" },
  { label: "Linear", url: "https://linear.app" },
  { label: "GitHub", url: "https://github.com" },
  { label: "Apple", url: "https://apple.com" },
];

function scoreColor(score: number | null): string {
  if (score === null) return "text-slate-400";
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function MiniScoreRing({ score }: { score: number | null }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const dash = score === null ? 0 : (value / 100) * circumference;

  return (
    <div className="relative flex size-10 shrink-0 items-center justify-center">
      <svg className="size-10 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-200" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className={scoreColor(score)}
        />
      </svg>
      <span className={cn("absolute text-[11px] font-bold tabular-nums", scoreColor(score))}>
        {score === null ? "—" : score}
      </span>
    </div>
  );
}

function ScanRow({ report, onOpen }: { report: WebReport; onOpen: (id: string) => void }) {
  const actions = useWebReportActions(report.id || "");
  const [isDeleting, setIsDeleting] = useState(false);

  let hostname = report.url;
  try {
    hostname = new URL(report.url).hostname;
  } catch {
    // keep raw url
  }

  const isRunning = report.status === "queued" || report.status === "running";
  const isCompleted = report.status === "completed";
  const isFailed = report.status === "failed";

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await actions.share.mutateAsync();
      const link = `${window.location.origin}${res.sharePath}`;
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied.");
    } catch {
      toast.error("Could not generate share link.");
    }
  };

  const handleRescan = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await actions.rescan.mutateAsync();
      if (res.report?.id) {
        toast.success("Rescan queued.");
        onOpen(res.report.id);
      }
    } catch {
      toast.error("Could not restart scan.");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete audit for "${hostname}"?`)) return;
    setIsDeleting(true);
    try {
      await actions.remove.mutateAsync();
      toast.success("Audit deleted.");
    } catch {
      toast.error("Could not delete audit.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => report.id && onOpen(report.id)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && report.id) {
          e.preventDefault();
          onOpen(report.id);
        }
      }}
      className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition hover:border-blue-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
          <img
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
            alt=""
            className="size-5 rounded-sm object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <Globe className="size-4 text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-mono text-sm font-medium text-slate-900">{hostname}</span>
            <a
              href={report.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-slate-700"
              title="Open site"
            >
              <ExternalLink className="size-3" />
            </a>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            {isRunning ? (
              <span className="font-medium text-blue-600">
                {scanStepTitle(report.stage)} · {report.progress}%
              </span>
            ) : isCompleted ? (
              <span>
                {report.scannedAt
                  ? new Date(report.scannedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Completed"}
              </span>
            ) : isFailed ? (
              <span className="font-medium text-red-600">Failed</span>
            ) : (
              <span>Queued</span>
            )}
            <span>·</span>
            <span>
              {report.pagesCrawled || 1} page{(report.pagesCrawled || 1) === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        {isCompleted ? (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 text-[10px] sm:flex">
              <span className="rounded border border-slate-200 px-1.5 py-0.5 tabular-nums text-slate-600">
                M {report.scores.mobile ?? "—"}
              </span>
              <span className="rounded border border-slate-200 px-1.5 py-0.5 tabular-nums text-slate-600">
                SEO {report.scores.seo ?? "—"}
              </span>
              <span className="rounded border border-slate-200 px-1.5 py-0.5 tabular-nums text-slate-600">
                AI {report.scores.aiSearch ?? "—"}
              </span>
            </div>
            <MiniScoreRing score={report.scores.overall} />
          </div>
        ) : null}
        {isRunning ? <Spinner className="size-4 text-blue-600" /> : null}
        <div className="flex items-center gap-0.5">
          <Button size="sm" variant="ghost" className="size-8 p-0" onClick={handleShare} title="Share">
            <Share2 className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="size-8 p-0" onClick={handleRescan} title="Rescan">
            <RefreshCw className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="size-8 p-0 text-slate-500 hover:text-red-600"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
          <Button
            size="sm"
            className="ml-1 h-8 px-2.5 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (report.id) onOpen(report.id);
            }}
          >
            Open
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WebReportsHome() {
  const navigate = useNavigate();
  const list = useWebReportList();
  const create = useCreateWebReport();

  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState<string>("");
  const [force, setForce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "running" | "failed">("all");

  const reports = list.data?.reports || [];

  const stats = useMemo(() => {
    const completed = reports.filter((r) => r.status === "completed");
    const active = reports.filter((r) => r.status === "queued" || r.status === "running").length;
    const scores = completed.map((r) => r.scores.overall).filter((s): s is number => s !== null);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return { total: reports.length, active, avgScore };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch = !searchQuery || r.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "running"
            ? r.status === "queued" || r.status === "running"
            : r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    let trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a website URL.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      if (trimmed.includes("://") && !trimmed.startsWith("http")) {
        setError("Use an http or https URL.");
        return;
      }
      trimmed = `https://${trimmed}`;
      setUrl(trimmed);
    }
    try {
      const pages = maxPages ? Number(maxPages) : undefined;
      const result = await create.mutateAsync({
        url: trimmed,
        maxPages: Number.isFinite(pages) ? pages : undefined,
        force,
      });
      if (result.cached) toast.message("Showing a recent scan of this URL.");
      if (result.report.id) navigate(`/webreports/${result.report.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The scan could not be started.");
    }
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Site audits</h1>
            <p className="mt-0.5 text-sm text-slate-500">Performance, SEO, and AI-search readiness.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              <span className="font-semibold tabular-nums text-slate-800">{stats.total}</span> audits
            </span>
            <span>
              Avg{" "}
              <span className={cn("font-semibold tabular-nums", scoreColor(stats.avgScore))}>
                {stats.avgScore ?? "—"}
              </span>
            </span>
            {stats.active > 0 ? (
              <span className="font-medium text-blue-600">
                {stats.active} scanning
              </span>
            ) : null}
          </div>
        </div>

        <form
          id="new-scan"
          onSubmit={onSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="audit-url">
            Website URL
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="audit-url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://example.com"
                autoComplete="url"
                disabled={create.isPending}
                className="h-10 pl-9 font-mono text-sm"
              />
            </div>
            <Button type="submit" disabled={create.isPending} className="h-10 shrink-0 px-5">
              {create.isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Starting…
                </>
              ) : (
                <>
                  Start audit
                  <ArrowRight className="ml-1.5 size-4" />
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400">Try:</span>
            {QUICK_SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                  setError(null);
                }}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <label className="flex items-center gap-1.5" htmlFor="audit-pages">
              Pages
              <Input
                id="audit-pages"
                inputMode="numeric"
                value={maxPages}
                onChange={(e) => setMaxPages(e.target.value)}
                placeholder="5"
                disabled={create.isPending}
                className="h-7 w-16 text-xs"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 select-none">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="size-3.5 rounded border-slate-300"
              />
              Force new scan
            </label>
          </div>

          {error ? (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </div>
          ) : null}
        </form>

        <section className="space-y-3" aria-labelledby="history-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="history-heading" className="text-sm font-semibold text-slate-900">
              Recent audits
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter…"
                  className="h-8 w-36 pl-7 text-xs"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">
                    Done
                  </TabsTrigger>
                  <TabsTrigger value="running" className="text-xs">
                    Scanning
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="text-xs">
                    Failed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {list.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-sm font-medium text-slate-800">No audits yet</p>
              <p className="mt-1 text-xs text-slate-500">Enter a URL above to run your first site audit.</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No audits match your filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <ScanRow key={report.id} report={report} onOpen={(id) => navigate(`/webreports/${id}`)} />
              ))}
            </div>
          )}
        </section>

        <p className="pb-4 text-center text-[11px] text-slate-400">
          <Link to="/webreports" className="hover:text-slate-600">
            About Web Reports
          </Link>
        </p>
      </div>
    </div>
  );
}
