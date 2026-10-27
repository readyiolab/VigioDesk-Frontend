import { useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Globe,
  Gauge,
  Search,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Bot,
  Layers,
  RefreshCw,
  Share2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Smartphone,
  Monitor,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/services/api";
import { useCreateWebReport, useWebReportList, useWebReportActions } from "@/features/webreports/queries";
import { scanStepTitle } from "@/features/webreports/stageLabel";
import type { WebReport } from "@/features/webreports/types";

const QUICK_SAMPLES = [
  { label: "Stripe", url: "https://stripe.com" },
  { label: "Linear", url: "https://linear.app" },
  { label: "GitHub", url: "https://github.com" },
  { label: "Apple", url: "https://apple.com" },
];

function scoreColor(score: number | null): string {
  if (score === null) return "text-slate-400";
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBg(score: number | null): string {
  if (score === null) return "bg-slate-100 dark:bg-slate-800 text-slate-500";
  if (score >= 90) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (score >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
}

function MiniScoreRing({ score }: { score: number | null }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const dash = score === null ? 0 : (value / 100) * circumference;

  return (
    <div className="relative flex size-12 shrink-0 items-center justify-center">
      <svg className="size-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="3.5" fill="none" className="text-slate-200 dark:text-slate-800" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="currentColor"
          strokeWidth="3.5"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className={scoreColor(score)}
        />
      </svg>
      <span className={`absolute text-xs font-bold tabular-nums ${scoreColor(score)}`}>
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
      toast.success("Share link copied to clipboard.");
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
    if (!window.confirm(`Delete audit report for "${hostname}"?`)) return;
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
      onClick={() => report.id && window.open(`/webreports/${report.id}`, "_blank", "noopener,noreferrer")}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4.5 transition-all duration-200 hover:border-blue-500/40 hover:shadow-md cursor-pointer sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Left: Favicon & Domain info */}
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 shadow-xs">
          <img
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
            alt=""
            className="size-6 rounded-xs object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <Globe className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={`/webreports/${report.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="truncate font-semibold tracking-tight text-foreground hover:text-blue-600 hover:underline dark:hover:text-blue-400"
            >
              {report.url}
            </Link>
            <a
              href={report.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
              title="Open website in new tab"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {isRunning ? (
              <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-blue-600" />
                </span>
                {scanStepTitle(report.stage)} ({report.progress}%)
              </span>
            ) : isCompleted ? (
              <span>
                {report.scannedAt
                  ? `Audited ${new Date(report.scannedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                  : "Completed"}
              </span>
            ) : isFailed ? (
              <span className="font-medium text-destructive">Scan failed</span>
            ) : (
              <span>Queued</span>
            )}
            <span>·</span>
            <span>{report.pagesCrawled || 1} {report.pagesCrawled === 1 ? "page" : "pages"}</span>
          </div>
        </div>
      </div>

      {/* Right: Scores & Actions */}
      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
        {isCompleted && (
          <div className="flex items-center gap-2.5">
            <div className="hidden grid-cols-3 gap-1.5 md:grid text-center">
              <div className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Perf</div>
                <div className="text-xs font-bold tabular-nums text-foreground">{report.scores.mobile ?? "—"}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">SEO</div>
                <div className="text-xs font-bold tabular-nums text-foreground">{report.scores.seo ?? "—"}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">AI</div>
                <div className="text-xs font-bold tabular-nums text-foreground">{report.scores.aiSearch ?? "—"}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MiniScoreRing score={report.scores.overall} />
            </div>
          </div>
        )}

        {isRunning && (
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Spinner className="size-4" />
            <span className="hidden sm:inline">Processing…</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleShare}
            title="Copy share link"
          >
            <Share2 className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleRescan}
            title="Rerun audit"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete report"
          >
            <Trash2 className="size-4" />
          </Button>
          <a
            href={`/webreports/${report.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 ml-1 transition shadow-xs"
          >
            <span>View</span>
            <ExternalLink className="size-3.5" />
          </a>
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

  // Metrics
  const stats = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter((r) => r.status === "completed");
    const active = reports.filter((r) => r.status === "queued" || r.status === "running").length;
    const scores = completed.map((r) => r.scores.overall).filter((s): s is number => s !== null);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const highScores = completed.filter((r) => (r.scores.overall ?? 0) >= 90).length;

    return { total, active, avgScore, highScores };
  }, [reports]);

  // Filtered reports
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

    // Auto-normalize domain if scheme is missing
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

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-5 sm:px-6">
      {/* ── Studio Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Gauge className="size-3.5" />
          <span>Zuvigo.com WebReports · Executive Performance &amp; AI SEO Studio</span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Website audit
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Scan a public site for performance, SEO, and AI-search readiness. The audit runs in the background.
        </p>
      </div>

      {/* ── Metric Stat Tiles ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Audits</p>
          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Average Health</p>
          <p className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${scoreColor(stats.avgScore)}`}>
            {stats.avgScore !== null ? `${stats.avgScore}/100` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Grade A Sites (90+)</p>
          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.highScores}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Active Scans</p>
          <div className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight tabular-nums text-blue-600 dark:text-blue-400">
            {stats.active > 0 && <span className="size-2.5 rounded-full bg-blue-600 animate-pulse" />}
            {stats.active}
          </div>
        </div>
      </div>

      {/* ── Hero Scanner Bar & Generator ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-50/50 via-card to-card p-6 shadow-xl shadow-blue-500/5 sm:p-8 dark:from-blue-950/20 dark:via-card dark:to-card">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="audit-url">
              Website URL
            </label>

            <div className="relative flex items-center rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition-all focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/15 dark:border-slate-800 dark:bg-slate-900">
              <Globe className="pointer-events-none absolute left-4 size-5 text-muted-foreground" />
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
                className="h-13 w-full border-0 bg-transparent pl-12 pr-4 text-base font-medium placeholder:text-muted-foreground/60 focus-visible:ring-0 shadow-none"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="mr-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick-test Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs font-medium text-muted-foreground">Quick test:</span>
            {QUICK_SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSelectSample(sample.url)}
                className="cursor-pointer rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-blue-500/50 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Advanced Options Bar */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="audit-pages">
                Page limit (optional)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="audit-pages"
                  inputMode="numeric"
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                  placeholder="5"
                  disabled={create.isPending}
                  className="h-9 w-24 rounded-xl text-sm"
                />
                <span className="text-xs text-muted-foreground">Pages deep to crawl</span>
              </div>
            </div>

            <div className="flex items-center justify-start sm:justify-end">
              <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={force}
                  onChange={(e) => setForce(e.target.checked)}
                  className="size-4 rounded-sm border-border text-blue-600 focus:ring-blue-500"
                />
                <span>Force a new scan even if one finished in the last 30 minutes</span>
              </label>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="lg"
              disabled={create.isPending}
              className="h-12 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {create.isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  <span>Starting…</span>
                </>
              ) : (
                <>
                  <span>Start scan</span>
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Recent Scans Registry ────────────────────────────────── */}
      <section className="space-y-4 pt-2" aria-labelledby="history-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="history-heading" className="text-lg font-bold tracking-tight text-foreground">
              Recent scans
            </h2>
            <p className="text-xs text-muted-foreground">Audit reports saved across your organization.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by domain…"
                className="h-8 w-44 pl-8 text-xs rounded-xl"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                <TabsTrigger value="running" className="text-xs">Scanning</TabsTrigger>
                <TabsTrigger value="failed" className="text-xs">Failed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {list.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Globe className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No scans yet. Submit a URL to start.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter any public website address above to initiate your first comprehensive performance audit.
              </p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No audits match your filter "{searchQuery}".
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredReports.map((report) => (
              <ScanRow
                key={report.id}
                report={report}
                onOpen={(id) => navigate(`/webreports/${id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
