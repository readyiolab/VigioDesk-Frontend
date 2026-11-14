import { useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Globe,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/services/api";
import { useCreateWebReport, useWebReportList, useWebReportActions } from "@/features/webreports/queries";
import { projectRowMetrics } from "@/features/webreports/dashboardMetrics";
import { ProgressRing } from "@/features/webreports/components/ProgressRing";
import { wr, wrClass } from "@/features/webreports/semrushTheme";
import { scanStepTitle } from "@/features/webreports/stageLabel";
import type { WebReport } from "@/features/webreports/types";
import { cn } from "@/lib/utils";

const QUICK_SAMPLES = [
  { label: "Stripe", url: "https://stripe.com" },
  { label: "Linear", url: "https://linear.app" },
  { label: "GitHub", url: "https://github.com" },
  { label: "Apple", url: "https://apple.com" },
];

const MODULE_CARDS = [
  {
    title: "Content",
    body: "Create SEO-friendly content with AI and competitive data.",
    accent: "#16a34a",
  },
  {
    title: "Zuvigo One",
    body: "Win every search, from traditional SEO to AI discovery.",
    accent: "#0d9488",
  },
  {
    title: "AI Visibility",
    body: "Get discovered in ChatGPT, Google AI, and other AI search engines.",
    accent: wr.purple,
  },
  {
    title: "Traffic & Market",
    body: "Track competitors, analyze markets, uncover growth opportunities.",
    accent: wr.purple,
  },
];

function fmt(value: number | null | undefined): string {
  if (value === null || value === undefined) return "n/a";
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

function MetricCol({
  label,
  value,
  sub,
  ring,
}: {
  label: string;
  value: string;
  sub?: string;
  ring?: number | null;
}) {
  return (
    <div className="min-w-[4.5rem] text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#8b919c]">{label}</div>
      <div className="mt-1 flex items-center justify-center gap-1.5">
        {ring !== undefined ? (
          <ProgressRing value={ring} size={28} stroke={3}>
            <span className="text-[9px] font-bold text-[#6b46c1]">{ring === null ? "—" : ""}</span>
          </ProgressRing>
        ) : null}
        <span
          className={cn(
            "text-base font-bold tabular-nums",
            value === "n/a" ? "text-[#9ca3af]" : "text-[#6b46c1]"
          )}
        >
          {value}
        </span>
      </div>
      {sub ? <div className="mt-0.5 text-[10px] text-[#16a34a]">{sub}</div> : null}
    </div>
  );
}

function ProjectRow({ report, onOpen }: { report: WebReport; onOpen: (id: string) => void }) {
  const actions = useWebReportActions(report.id || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const metrics = projectRowMetrics(report);

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
    if (!window.confirm(`Delete project for "${hostname}"?`)) return;
    setIsDeleting(true);
    try {
      await actions.remove.mutateAsync();
      toast.success("Project deleted.");
    } catch {
      toast.error("Could not delete project.");
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
      className={cn(
        wrClass.card,
        "group flex cursor-pointer flex-col gap-3 px-4 py-3.5 transition hover:border-[#c4b5fd] hover:shadow-sm lg:flex-row lg:items-center lg:justify-between"
      )}
    >
      <div className="flex min-w-0 items-center gap-3 lg:w-56 lg:shrink-0">
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
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-[#3b5bdb]">{hostname}</span>
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
          <div className="mt-0.5 text-[11px] text-[#8b919c]">
            {isRunning ? (
              <span className="font-medium text-blue-600">
                {scanStepTitle(report.stage)} · {report.progress}%
              </span>
            ) : isFailed ? (
              <span className="font-medium text-red-600">Failed</span>
            ) : (
              <>
                {report.crawl?.htmlPages ?? report.pagesCrawled} pages
                {!report.completeness.complete || report.scores.seo === null ? " · Incomplete" : ""}
              </>
            )}
          </div>
        </div>
      </div>

      {isCompleted ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-4 overflow-x-auto lg:justify-end">
          <MetricCol
            label="AI Visibility"
            value={metrics.aiVisibility === null ? "n/a" : `${metrics.aiVisibility}%`}
            ring={metrics.aiVisibility}
          />
          <MetricCol label="Mentions" value={fmt(metrics.mentions)} />
          <MetricCol
            label="Site Health"
            value={metrics.siteHealth === null ? "n/a" : `${metrics.siteHealth}%`}
          />
          <MetricCol label="Visibility" value={`${metrics.visibility}%`} sub="0, last scan" />
          <MetricCol label="Organic Traffic" value={fmt(metrics.organicTraffic)} />
          <MetricCol label="Organic Keywords" value={fmt(metrics.organicKeywords)} />
          <MetricCol label="Backlinks" value={fmt(metrics.backlinks)} />
        </div>
      ) : isRunning ? (
        <div className="flex flex-1 items-center justify-end">
          <Spinner className="size-4 text-blue-600" />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex shrink-0 items-center gap-0.5 lg:pl-2">
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
        <Button size="sm" variant="ghost" className="size-8 p-0" title="More" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="size-3.5" />
        </Button>
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
  const [showCreate, setShowCreate] = useState(false);

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
    <div className="h-full min-h-0 overflow-y-auto bg-[#f4f5f9]">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MODULE_CARDS.map((card) => (
            <div key={card.title} className={cn(wrClass.card, "p-4 shadow-sm")}>
              <div className="text-sm font-bold text-[#1f232b]" style={{ color: card.accent }}>
                {card.title}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6b7280]">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1f232b]">Projects</h1>
            <p className="mt-0.5 text-sm text-[#6b7280]">
              {stats.total} projects
              {stats.avgScore !== null ? ` · avg health ${stats.avgScore}` : ""}
              {stats.active > 0 ? ` · ${stats.active} scanning` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 border-[#e3e5eb] bg-white"
              onClick={() => toast.message("Share a project from its row actions.")}
            >
              <Share2 className="size-3.5" />
              Share
            </Button>
            <Button
              type="button"
              className="h-9 gap-1.5 bg-[#1f232b] text-white hover:bg-black"
              onClick={() => {
                setShowCreate(true);
                requestAnimationFrame(() => document.getElementById("audit-url")?.focus());
              }}
            >
              <Plus className="size-3.5" />
              Create Project
            </Button>
          </div>
        </div>

        <form
          id="new-scan"
          onSubmit={onSubmit}
          className={cn(
            wrClass.card,
            "space-y-3 p-4 shadow-sm",
            !showCreate && reports.length > 0 ? "hidden sm:block" : ""
          )}
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#8b919c]" htmlFor="audit-url">
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
            <Button type="submit" disabled={create.isPending} className="h-10 shrink-0 bg-[#1f232b] px-5 hover:bg-black">
              {create.isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Starting…
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 size-4" />
                  Create Project
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
                  setShowCreate(true);
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

        <section className="space-y-3" aria-labelledby="projects-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="projects-heading" className="sr-only">
              Project list
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter projects…"
                  className="h-8 w-40 pl-7 text-xs"
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
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white py-12 text-center">
              <p className="text-sm font-medium text-slate-800">No projects yet</p>
              <p className="mt-1 text-xs text-slate-500">Enter a URL above to create your first SEO project.</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No projects match your filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <ProjectRow key={report.id} report={report} onOpen={(id) => navigate(`/webreports/${id}`)} />
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
