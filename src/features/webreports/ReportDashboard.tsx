import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AuditCheck, DevicePerformance, VitalRating, WebReport } from "./types";
import { stageLabel } from "./stageLabel";
import {
  categoryHealth,
  issueDistribution,
  isFinding,
  isUnavailableCheck,
  letterGrade,
  sectionLabel,
  sectionUnavailableMessage,
  seoProblems,
} from "./reportNarrative";
import { ReportPrint } from "./ReportPrint";
import { downloadWebReportPdf } from "./buildWebReportPdf";
import { buildDashboardMetrics, type HistoryPoint } from "./dashboardMetrics";
import { SeoMetricStrip } from "./components/SeoMetricStrip";
import { DataSourcePanel } from "./components/DataSourcePanel";
import { SitePerformanceCard } from "./components/SitePerformanceCard";
import { SiteAuditCard } from "./components/SiteAuditCard";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Layers,
  Loader2,
  Minus,
  Monitor,
  RefreshCw,
  Save,
  Smartphone,
  XCircle,
} from "lucide-react";

type TabId = "overview" | "vitals" | "seo" | "ai" | "fixes";
type SeverityFilter = "all" | "critical" | "warning" | "info" | "pass";

const RATING_LABEL: Record<Exclude<VitalRating, "unavailable">, string> = {
  good: "Good",
  "needs-improvement": "Needs work",
  poor: "Poor",
};

function scoreTone(score: number | null): string {
  if (score === null) return "text-slate-400";
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreBar(score: number | null): string {
  if (score === null) return "bg-slate-200";
  if (score >= 90) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function severityMeta(severity: AuditCheck["severity"]) {
  if (severity === "critical")
    return { label: "Error", className: "bg-red-50 text-red-700 border-red-200", Icon: XCircle };
  if (severity === "warning")
    return { label: "Warning", className: "bg-amber-50 text-amber-800 border-amber-200", Icon: AlertTriangle };
  if (severity === "info")
    return { label: "Notice", className: "bg-sky-50 text-sky-800 border-sky-200", Icon: AlertTriangle };
  return { label: "Passed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 };
}

function HealthRing({ score }: { score: number | null }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const dash = score === null ? 0 : (value / 100) * circumference;
  const grade = letterGrade(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex size-[108px] items-center justify-center">
        <svg viewBox="0 0 108 108" className="size-full -rotate-90" aria-hidden>
          <circle cx="54" cy="54" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="none" />
          <circle
            cx="54"
            cy="54"
            r={radius}
            className={scoreTone(score)}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn("text-3xl font-black tabular-nums leading-none", scoreTone(score))}>
            {score === null ? "—" : score}
          </span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            / 100
          </span>
        </div>
      </div>
      <span
        className={cn(
          "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
          score === null
            ? "border-slate-200 bg-slate-50 text-slate-500"
            : score >= 80
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : score >= 50
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-700"
        )}
      >
        Grade {grade.grade} · {grade.label}
      </span>
    </div>
  );
}

function ScoreTile({
  label,
  score,
  hint,
}: {
  label: string;
  score: number | null;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cn("mt-0.5 text-xl font-bold tabular-nums", scoreTone(score))}>
        {score === null ? "—" : score}
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", scoreBar(score))}
          style={{ width: `${score === null ? 0 : Math.min(100, score)}%` }}
        />
      </div>
      {hint ? <p className="mt-1 text-[10px] text-slate-500">{hint}</p> : null}
      {score === null ? <p className="mt-1 text-[10px] text-slate-400">Not measured</p> : null}
    </div>
  );
}

function VitalCell({
  name,
  value,
  unit,
  rating,
}: {
  name: string;
  value: number | null;
  unit: string;
  rating?: VitalRating | null;
}) {
  const shown =
    value === null
      ? "—"
      : unit === "cls"
        ? value.toFixed(2)
        : unit === "kb"
          ? `${Math.round(value / 1024)} KB`
          : `${Math.round(value)}${unit ? ` ${unit}` : ""}`;
  const pill =
    !rating || rating === "unavailable"
      ? "text-slate-400"
      : rating === "good"
        ? "text-emerald-700"
        : rating === "needs-improvement"
          ? "text-amber-700"
          : "text-red-700";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{name}</div>
      <div className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{shown}</div>
      {rating && rating !== "unavailable" && value !== null ? (
        <div className={cn("mt-0.5 text-[10px] font-medium", pill)}>{RATING_LABEL[rating]}</div>
      ) : null}
    </div>
  );
}

function DeviceVitals({ label, icon, device }: { label: string; icon: ReactNode; device: DevicePerformance }) {
  const field = device.field;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {icon}
          {label}
        </div>
        <span className={cn("text-lg font-bold tabular-nums", scoreTone(device.score))}>
          {device.score === null ? "—" : device.score}
        </span>
      </div>
      {device.unavailableReason ? (
        <p className="text-xs text-amber-700">{device.unavailableReason}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <VitalCell name="LCP" value={device.lcp} unit="ms" rating={device.ratings.lcp} />
            <VitalCell name="CLS" value={device.cls} unit="cls" rating={device.ratings.cls} />
            <VitalCell name="INP" value={device.inp} unit="ms" rating={device.ratings.inp} />
            <VitalCell name="FCP" value={device.fcp} unit="ms" />
            <VitalCell name="TBT" value={device.tbt} unit="ms" />
            <VitalCell name="TTFB" value={device.ttfb} unit="ms" />
          </div>
          {(field?.lcp || field?.inp || field?.cls) && (
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Field (CrUX): </span>
              {[
                field.lcp?.percentile != null
                  ? `LCP p75 ${Math.round(field.lcp.percentile)}ms${field.lcp.category ? ` · ${field.lcp.category}` : ""}`
                  : null,
                field.inp?.percentile != null
                  ? `INP p75 ${Math.round(field.inp.percentile)}ms${field.inp.category ? ` · ${field.inp.category}` : ""}`
                  : null,
                field.cls?.percentile != null
                  ? `CLS p75 ${field.cls.percentile.toFixed(2)}${field.cls.category ? ` · ${field.cls.category}` : ""}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
            {device.bytes != null ? <span>Transfer ~{Math.round(device.bytes / 1024)} KB</span> : null}
            {device.pageUrl ? (
              <span className="truncate font-mono" title={device.pageUrl}>
                Tested {device.pageUrl}
              </span>
            ) : null}
          </div>
        </>
      )}
      {device.issues?.length ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Opportunities
          </p>
          <ul className="space-y-1">
            {device.issues.slice(0, 8).map((issue) => (
              <li key={issue.id} className="flex items-start justify-between gap-2 text-xs text-slate-600">
                <span>{issue.title}</span>
                {issue.displayValue ? (
                  <span className="shrink-0 font-mono text-slate-500">{issue.displayValue}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function FindingRow({ check, dense }: { check: AuditCheck; dense?: boolean }) {
  const [open, setOpen] = useState(false);
  const meta =
    check.status === "unavailable" || check.status === "inconclusive"
      ? {
          label: "Not measured",
          className: "bg-amber-50 text-amber-800 border-amber-200",
          Icon: Minus,
        }
      : severityMeta(check.severity);
  const Icon = meta.Icon;
  return (
    <div className={cn("border-b border-slate-100 last:border-0", dense && "odd:bg-slate-50/40")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50"
      >
        {open ? (
          <ChevronDown className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
        )}
        <span
          className={cn(
            "mt-0.5 inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            meta.className
          )}
        >
          <Icon className="size-3" />
          {meta.label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-900">{check.title}</span>
            {check.category ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-500">
                {check.category}
              </span>
            ) : null}
            {check.affectedCount > 0 ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {check.affectedCount} page{check.affectedCount === 1 ? "" : "s"}
              </span>
            ) : null}
            {check.impact ? (
              <span className="text-[10px] font-medium uppercase text-slate-400">{check.impact} impact</span>
            ) : null}
          </div>
          {check.fix && !open ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{check.fix}</p>
          ) : null}
        </div>
      </button>
      {open ? (
        <div className="space-y-2 border-t border-slate-50 bg-slate-50/60 px-3 py-2.5 pl-10 text-xs text-slate-600">
          {check.description ? <p>{check.description}</p> : null}
          {check.fix ? (
            <p>
              <span className="font-semibold text-slate-800">Fix: </span>
              {check.fix}
            </p>
          ) : null}
          {check.affectedUrls?.length ? (
            <ul className="space-y-0.5 font-mono text-[11px] text-slate-500">
              {check.affectedUrls.slice(0, 8).map((u) => (
                <li key={u} className="truncate">
                  {u}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FindingsPanel({
  checks,
  filter,
  onFilter,
  showAll,
  onToggleShowAll,
  sectionMeasured,
  unavailableReason,
  onRescan,
  rescanPending,
}: {
  checks: AuditCheck[];
  filter: SeverityFilter;
  onFilter: (f: SeverityFilter) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
  sectionMeasured: boolean;
  unavailableReason?: string;
  onRescan?: () => void;
  rescanPending?: boolean;
}) {
  const findings = checks.filter(isFinding);
  const unavailable = checks.filter(isUnavailableCheck);
  // Always surface unavailable/inconclusive when the section wasn't measured
  const baseList =
    showAll || !sectionMeasured || (findings.length === 0 && unavailable.length > 0)
      ? checks
      : findings;
  const filtered = baseList.filter((c) => {
    if (filter === "all") return true;
    if (filter === "pass") return c.severity === "pass" || c.status === "absent";
    if (c.status === "unavailable" || c.status === "inconclusive") return filter === "info";
    return c.severity === filter && c.status === "present";
  });

  const byCategory = useMemo(() => {
    const map = new Map<string, AuditCheck[]>();
    for (const c of filtered) {
      const key = c.category || "General";
      const list = map.get(key) || [];
      list.push(c);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const chips: { id: SeverityFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "critical", label: "Errors" },
    { id: "warning", label: "Warnings" },
    { id: "info", label: "Notices" },
    { id: "pass", label: "Passed" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {!sectionMeasured && unavailableReason ? (
        <div className="flex flex-col gap-2 border-b border-amber-200 bg-amber-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Not measured</p>
            <p className="mt-0.5 text-sm text-amber-900">{unavailableReason}</p>
          </div>
          {onRescan ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5 border-amber-300 bg-white"
              disabled={rescanPending}
              onClick={onRescan}
            >
              <RefreshCw className={cn("size-3.5", rescanPending && "animate-spin")} />
              Rescan
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onFilter(chip.id)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                filter === chip.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggleShowAll}
          className="text-xs font-medium text-blue-700 hover:underline"
        >
          {showAll ? "Issues only" : "Show all checks"}
        </button>
      </div>
      {byCategory.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-slate-500">
          {!sectionMeasured
            ? unavailableReason || "This section was not measured."
            : "No checks match this filter."}
        </p>
      ) : (
        byCategory.map(([cat, list]) => (
          <div key={cat}>
            <div className="sticky top-0 z-[1] border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {cat} · {list.length}
            </div>
            {list.map((c) => (
              <FindingRow key={c.id} check={c} dense />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function DistributionBar({
  errors,
  warnings,
  notices,
  passed,
}: {
  errors: number;
  warnings: number;
  notices: number;
  passed: number;
}) {
  const total = Math.max(1, errors + warnings + notices + passed);
  const segs = [
    { n: errors, color: "bg-red-500", label: "Errors" },
    { n: warnings, color: "bg-amber-500", label: "Warnings" },
    { n: notices, color: "bg-sky-500", label: "Notices" },
    { n: passed, color: "bg-emerald-500", label: "Passed" },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Issue distribution</h2>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {segs.map((s) =>
          s.n > 0 ? (
            <div
              key={s.label}
              className={cn("h-full", s.color)}
              style={{ width: `${(s.n / total) * 100}%` }}
              title={`${s.label}: ${s.n}`}
            />
          ) : null
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {segs.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span className={cn("size-2 rounded-full", s.color)} />
            {s.label}{" "}
            <span className="tabular-nums text-slate-500">{s.n}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ReportDashboard({
  report,
  publicView,
  onUpdateBranding,
  onRescan,
  rescanPending,
  history = [],
}: {
  report: WebReport;
  publicView?: boolean;
  onUpdateBranding?: (branding: { companyName?: string | null; logoUrl?: string | null }) => Promise<unknown>;
  isUpdatingBranding?: boolean;
  onRescan?: () => void;
  rescanPending?: boolean;
  history?: HistoryPoint[];
}) {
  const finished = report.status === "completed";
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const dashMetrics = useMemo(() => buildDashboardMetrics(report), [report]);
  const [showAllSeo, setShowAllSeo] = useState(
    () => report.scores.seo === null || report.completeness.unavailableSections.includes("seo")
  );
  const [showAllAi, setShowAllAi] = useState(
    () =>
      report.scores.aiSearch === null ||
      report.completeness.unavailableSections.some((s) => /ai/i.test(s))
  );
  const [seoFilter, setSeoFilter] = useState<SeverityFilter>("all");
  const [aiFilter, setAiFilter] = useState<SeverityFilter>("all");
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState(report.customerBranding?.companyName || "");
  const [editLogoUrl, setEditLogoUrl] = useState(report.customerBranding?.logoUrl || "");
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  let domain = "";
  try {
    domain = new URL(report.url).hostname;
  } catch {
    domain = report.url;
  }
  const customerName = report.customerBranding?.companyName || domain;
  const customerLogo = report.customerBranding?.logoUrl;
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

  const allChecks = useMemo(
    () => [...report.seo.checks, ...report.aiSearch.checks],
    [report.seo.checks, report.aiSearch.checks]
  );
  const dist = useMemo(() => issueDistribution(allChecks), [allChecks]);
  const categories = useMemo(() => categoryHealth(allChecks), [allChecks]);
  const allFindings = useMemo(() => {
    return allChecks
      .filter(isFinding)
      .sort((a, b) => {
        const rank = { critical: 0, warning: 1, info: 2, pass: 3 } as const;
        return rank[a.severity] - rank[b.severity] || b.affectedCount - a.affectedCount;
      });
  }, [allChecks]);

  const seoFindings = report.seo.checks.filter(isFinding).length;
  const aiFindings = report.aiSearch.checks.filter(isFinding).length;

  const sectionMeasured = {
    mobile: report.scores.mobile !== null && !report.completeness.unavailableSections.some((s) => /mobile/i.test(s)),
    desktop:
      report.scores.desktop !== null && !report.completeness.unavailableSections.some((s) => /desktop/i.test(s)),
    seo: report.scores.seo !== null && !report.completeness.unavailableSections.some((s) => /^seo$/i.test(s)),
    ai:
      report.scores.aiSearch !== null &&
      !report.completeness.unavailableSections.some((s) => /ai/i.test(s)),
  };

  const htmlPages = report.crawl?.htmlPages ?? report.pagesCrawled;
  const pagesAttempted = report.crawl?.pagesAttempted ?? report.pagesCrawled;
  const limitedCrawl = htmlPages <= 1;
  const incomplete =
    !report.completeness.complete ||
    report.scores.seo === null ||
    report.scores.aiSearch === null ||
    report.completeness.unavailableSections.length > 0;

  async function handleSaveBranding(e: FormEvent) {
    e.preventDefault();
    if (!onUpdateBranding) return;
    try {
      setIsSavingBranding(true);
      await onUpdateBranding({
        companyName: editCompanyName.trim() || null,
        logoUrl: editLogoUrl.trim() || null,
      });
      toast.success("Branding updated.");
      setBrandingModalOpen(false);
    } catch {
      toast.error("Failed to update branding.");
    } finally {
      setIsSavingBranding(false);
    }
  }

  const tabs: { id: TabId; label: string; count?: number | string }[] = [
    { id: "overview", label: "Overview" },
    { id: "vitals", label: "Core Web Vitals" },
    { id: "seo", label: "SEO", count: sectionMeasured.seo ? seoFindings : "—" },
    { id: "ai", label: "AI Search", count: sectionMeasured.ai ? aiFindings : "—" },
    { id: "fixes", label: "Fixes", count: report.topFixes.length },
  ];

  const botEntries = Object.entries(report.aiSearch.botAccess || {});
  const botsAllowed = botEntries.filter(([, v]) => /allow|yes|ok/i.test(String(v))).length;
  const mobileOps = report.performance.mobile.issues || [];

  const jumpToAudit = (tab: TabId = "overview") => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      document.getElementById("detailed-audit")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <div className="audit-screen mx-auto flex w-full max-w-6xl flex-col gap-3 bg-[#f4f5f9] px-3 py-4 text-slate-900 print:hidden sm:px-5 sm:py-5">
        {/* Header */}
        <section className="rounded-xl border border-[#e3e5eb] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#8b919c]">Home · SEO</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <img
                  src={customerLogo || fallbackFavicon}
                  alt=""
                  className="size-8 rounded-md border border-slate-200 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackFavicon;
                  }}
                />
                <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  SEO Dashboard: {domain || customerName}
                </h1>
                {onUpdateBranding ? (
                  <button
                    type="button"
                    onClick={() => setBrandingModalOpen(true)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Edit branding"
                  >
                    <Edit3 className="size-3.5" />
                  </button>
                ) : null}
              </div>
              <a
                href={report.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-blue-700 hover:underline"
              >
                {report.url}
                <ExternalLink className="size-3 shrink-0" />
              </a>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {report.summary.headline || stageLabel(report.status, report.stage)}
              </p>
              {report.summary.text ? (
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                  {report.summary.text}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {report.scannedAt ? new Date(report.scannedAt).toLocaleString() : report.status}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    limitedCrawl && "font-semibold text-amber-700"
                  )}
                >
                  <Layers className="size-3" />
                  {htmlPages} HTML · {pagesAttempted} URLs
                  {limitedCrawl ? " · limited crawl" : ""}
                  {report.crawl?.seoSource === "browser-fallback" ? " · SEO via browser" : ""}
                </span>
              </div>
            </div>
            <HealthRing score={report.scores.overall} />
          </div>

          {report.status === "failed" && report.error?.message ? (
            <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
              {report.error.message}
            </div>
          ) : null}

          {incomplete ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Incomplete measurement
                  </p>
                  <p className="mt-1 text-sm text-amber-950">
                    {report.completeness.unavailableSections.length
                      ? `Unavailable: ${report.completeness.unavailableSections.map(sectionLabel).join(", ")}.`
                      : "Some score sections could not be measured."}
                    {!sectionMeasured.seo ? ` ${sectionUnavailableMessage(report, "seo")}` : ""}
                    {limitedCrawl
                      ? " Only one HTML page was analyzed — results may be incomplete."
                      : ""}
                  </p>
                </div>
                {onRescan && !publicView ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5 border-amber-300 bg-white"
                    disabled={rescanPending}
                    onClick={onRescan}
                  >
                    <RefreshCw className={cn("size-3.5", rescanPending && "animate-spin")} />
                    Rescan
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Completeness checklist */}
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4">
            {(
              [
                ["Mobile", sectionMeasured.mobile, report.scores.mobile],
                ["Desktop", sectionMeasured.desktop, report.scores.desktop],
                ["SEO", sectionMeasured.seo, report.scores.seo],
                ["AI Search", sectionMeasured.ai, report.scores.aiSearch],
              ] as const
            ).map(([label, ok, score]) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs",
                  ok ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/70"
                )}
              >
                {ok ? (
                  <Check className="size-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <Minus className="size-3.5 shrink-0 text-amber-600" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800">{label}</div>
                  <div className="text-[10px] text-slate-500">
                    {ok ? `Measured · ${score}` : "Not measured"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {finished && publicView ? (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                disabled={downloadingPdf}
                onClick={() => {
                  void (async () => {
                    setDownloadingPdf(true);
                    try {
                      await downloadWebReportPdf(report);
                      toast.success("PDF downloaded");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not generate PDF");
                    } finally {
                      setDownloadingPdf(false);
                    }
                  })();
                }}
              >
                {downloadingPdf ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                {downloadingPdf ? "Preparing…" : "Download PDF"}
              </Button>
            </div>
          ) : null}
        </section>

        {finished ? (
          <>
            <SeoMetricStrip metrics={dashMetrics} />
            <DataSourcePanel
              history={history}
              currentSeo={report.scores.seo}
              currentAi={report.scores.aiSearch}
              pagesCrawled={htmlPages}
              errors={dashMetrics.errors}
              warnings={dashMetrics.warnings}
              scannedAt={report.scannedAt}
            />
            <SitePerformanceCard metrics={dashMetrics} onViewFull={() => jumpToAudit("seo")} />
            <SiteAuditCard metrics={dashMetrics} onViewFull={() => jumpToAudit("overview")} />
          </>
        ) : null}

        {/* Detailed audit */}
        <div id="detailed-audit" className="scroll-mt-4 space-y-3">
          <h2 className="text-base font-bold text-[#1f232b]">Detailed audit</h2>
        {/* Score strip */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <ScoreTile label="Overall" score={report.scores.overall} />
          <ScoreTile label="Mobile" score={report.scores.mobile} />
          <ScoreTile label="Desktop" score={report.scores.desktop} />
          <ScoreTile
            label="SEO"
            score={report.scores.seo}
            hint={report.seo.checks.length ? `${seoFindings} issues` : undefined}
          />
          <ScoreTile
            label="AI Search"
            score={report.scores.aiSearch}
            hint={report.aiSearch.checks.length ? `${aiFindings} issues` : undefined}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count !== 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-3">
            <DistributionBar {...dist} />

            {categories.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category health
                </h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.category}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold capitalize text-slate-900">
                          {cat.category}
                        </span>
                        <span className="text-xs font-bold tabular-nums text-slate-600">
                          {cat.passRate}% pass
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            cat.passRate >= 90
                              ? "bg-emerald-500"
                              : cat.passRate >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                          )}
                          style={{ width: `${cat.passRate}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex gap-2 text-[10px] font-medium text-slate-500">
                        <span className="text-red-600">{cat.errors} err</span>
                        <span className="text-amber-700">{cat.warnings} warn</span>
                        <span className="text-sky-700">{cat.notices} notice</span>
                        <span className="text-emerald-700">{cat.passed} ok</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Core Web Vitals
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                      <Smartphone className="size-3.5" /> Mobile
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <VitalCell
                        name="LCP"
                        value={report.performance.mobile.lcp}
                        unit="ms"
                        rating={report.performance.mobile.ratings.lcp}
                      />
                      <VitalCell
                        name="CLS"
                        value={report.performance.mobile.cls}
                        unit="cls"
                        rating={report.performance.mobile.ratings.cls}
                      />
                      <VitalCell
                        name="INP"
                        value={report.performance.mobile.inp}
                        unit="ms"
                        rating={report.performance.mobile.ratings.inp}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                      <Monitor className="size-3.5" /> Desktop
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <VitalCell
                        name="LCP"
                        value={report.performance.desktop.lcp}
                        unit="ms"
                        rating={report.performance.desktop.ratings.lcp}
                      />
                      <VitalCell
                        name="CLS"
                        value={report.performance.desktop.cls}
                        unit="cls"
                        rating={report.performance.desktop.ratings.cls}
                      />
                      <VitalCell
                        name="INP"
                        value={report.performance.desktop.inp}
                        unit="ms"
                        rating={report.performance.desktop.ratings.inp}
                      />
                    </div>
                  </div>
                </div>
                {mobileOps.length > 0 ? (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Mobile opportunities
                    </p>
                    <ul className="space-y-1">
                      {mobileOps.slice(0, 4).map((issue) => (
                        <li
                          key={issue.id}
                          className="flex justify-between gap-2 text-xs text-slate-600"
                        >
                          <span className="truncate">{issue.title}</span>
                          {issue.displayValue ? (
                            <span className="shrink-0 font-mono text-slate-500">{issue.displayValue}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Top issues
                  </h2>
                  {allFindings.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-500">
                      {!sectionMeasured.seo || !sectionMeasured.ai
                        ? seoProblems(report)[0] ||
                          "Some sections were not measured — open SEO or AI Search for details."
                        : "No issues found."}
                    </p>
                  ) : (
                    <div className="-mx-1">
                      {allFindings.slice(0, 6).map((c) => (
                        <FindingRow key={c.id} check={c} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Priority fixes
                    </h2>
                    {report.topFixes.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab("fixes")}
                        className="text-[11px] font-semibold text-blue-700 hover:underline"
                      >
                        See all
                      </button>
                    ) : null}
                  </div>
                  {report.topFixes.length === 0 ? (
                    <p className="py-3 text-center text-sm text-slate-500">No ranked fixes.</p>
                  ) : (
                    <ol className="space-y-2.5">
                      {report.topFixes.slice(0, 5).map((fix) => (
                        <li key={fix.rank} className="flex gap-2 text-sm">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">
                            {fix.rank}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900">{fix.title}</div>
                            <div className="text-[11px] text-slate-500">
                              {fix.impact} impact · {fix.effort} effort
                            </div>
                            {fix.why ? (
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-600">{fix.why}</p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "vitals" ? (
          <div className="grid gap-3 lg:grid-cols-2">
            <DeviceVitals
              label="Mobile"
              icon={<Smartphone className="size-4 text-slate-500" />}
              device={report.performance.mobile}
            />
            <DeviceVitals
              label="Desktop"
              icon={<Monitor className="size-4 text-slate-500" />}
              device={report.performance.desktop}
            />
          </div>
        ) : null}

        {activeTab === "seo" ? (
          <FindingsPanel
            checks={report.seo.checks}
            filter={seoFilter}
            onFilter={setSeoFilter}
            showAll={showAllSeo}
            onToggleShowAll={() => setShowAllSeo((v) => !v)}
            sectionMeasured={sectionMeasured.seo}
            unavailableReason={sectionUnavailableMessage(report, "seo")}
            onRescan={!publicView ? onRescan : undefined}
            rescanPending={rescanPending}
          />
        ) : null}

        {activeTab === "ai" ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Bot className="size-3.5" />
                  Bot access
                </div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {botsAllowed}/{botEntries.length || 0}{" "}
                  <span className="text-sm font-medium text-slate-500">allowed</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-500">llms.txt</div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {report.aiSearch.llmsTxt.present ? "Present" : "Missing"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">{report.aiSearch.llmsTxt.status}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-500">Web Manifest</div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {report.aiSearch.manifest?.present ? "Present" : "Missing"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {report.aiSearch.manifest?.status ?? "unavailable"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-500">humans.txt</div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {report.aiSearch.humansTxt?.present ? "Present" : "Missing"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {report.aiSearch.humansTxt?.status ?? "unavailable"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-500">JS dependency</div>
                <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                  {report.aiSearch.jsDependency.rawVsRenderedRatio == null
                    ? "—"
                    : report.aiSearch.jsDependency.rawVsRenderedRatio.toFixed(2)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {report.aiSearch.jsDependency.status}
                </p>
              </div>
            </div>

            {botEntries.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Bot</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {botEntries.map(([bot, status]) => {
                      const ok = /allow|yes|ok/i.test(String(status));
                      return (
                        <tr key={bot} className="border-b border-slate-100 odd:bg-slate-50/40">
                          <td className="px-3 py-2 font-medium text-slate-900">{bot}</td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                "rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                                ok
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              )}
                            >
                              {String(status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            <FindingsPanel
              checks={report.aiSearch.checks}
              filter={aiFilter}
              onFilter={setAiFilter}
              showAll={showAllAi}
              onToggleShowAll={() => setShowAllAi((v) => !v)}
              sectionMeasured={sectionMeasured.ai}
              unavailableReason={sectionUnavailableMessage(report, "ai")}
              onRescan={!publicView ? onRescan : undefined}
              rescanPending={rescanPending}
            />
          </div>
        ) : null}

        {activeTab === "fixes" ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {report.topFixes.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-slate-500">No prioritized fixes.</p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {report.topFixes.map((fix) => (
                  <li key={fix.rank} className="px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                        {fix.rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900">{fix.title}</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          Impact {fix.impact} · Effort {fix.effort} · {fix.scope}
                        </div>
                        {fix.why ? <p className="mt-1.5 text-xs text-slate-600">{fix.why}</p> : null}
                        {fix.instructions ? (
                          <p className="mt-1 text-xs text-slate-700">
                            <span className="font-semibold">How: </span>
                            {fix.instructions}
                          </p>
                        ) : null}
                        {fix.snippet ? (
                          <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-100">
                            {fix.snippet}
                          </pre>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}
        </div>

        <p className="pb-2 text-center text-[11px] text-slate-400">
          Audited with Zuvigo Web Reports · Scores omit unavailable sections
        </p>
      </div>

      <Dialog open={brandingModalOpen} onOpenChange={setBrandingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer branding</DialogTitle>
            <DialogDescription>Shown on shared and printed reports.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveBranding} className="space-y-3">
            <div>
              <Label htmlFor="brand-name">Company name</Label>
              <Input
                id="brand-name"
                className="mt-1"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="brand-logo">Logo URL</Label>
              <Input
                id="brand-logo"
                className="mt-1"
                value={editLogoUrl}
                onChange={(e) => setEditLogoUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBrandingModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingBranding} className="gap-1.5">
                <Save className="size-3.5" />
                {isSavingBranding ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {finished ? <ReportPrint report={report} /> : null}
    </>
  );
}
