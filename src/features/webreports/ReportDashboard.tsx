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
import { ReportPrint } from "./ReportPrint";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Layers,
  Monitor,
  Save,
  Smartphone,
  XCircle,
} from "lucide-react";

type TabId = "overview" | "vitals" | "seo" | "ai" | "fixes";

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

function isFinding(check: AuditCheck) {
  return check.status === "present" && check.severity !== "pass";
}

function CompactRing({ score }: { score: number | null }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const dash = score === null ? 0 : (value / 100) * circumference;
  return (
    <div className="relative flex size-[88px] items-center justify-center">
      <svg viewBox="0 0 88 88" className="size-full -rotate-90" aria-hidden>
        <circle cx="44" cy="44" r={radius} stroke="#E2E8F0" strokeWidth="7" fill="none" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          className={scoreTone(score)}
          stroke="currentColor"
          strokeWidth="7"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("absolute text-2xl font-bold tabular-nums", scoreTone(score))}>
        {score === null ? "—" : score}
      </span>
    </div>
  );
}

function ScoreTile({ label, score }: { label: string; score: number | null }) {
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
  rating: VitalRating;
}) {
  const shown =
    value === null
      ? "—"
      : unit === "cls"
        ? value.toFixed(2)
        : `${Math.round(value)}${unit ? ` ${unit}` : ""}`;
  const pill =
    rating === "good"
      ? "text-emerald-700"
      : rating === "needs-improvement"
        ? "text-amber-700"
        : rating === "poor"
          ? "text-red-700"
          : "text-slate-400";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{name}</div>
      <div className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{shown}</div>
      {rating !== "unavailable" && value !== null ? (
        <div className={cn("mt-0.5 text-[10px] font-medium", pill)}>{RATING_LABEL[rating]}</div>
      ) : null}
    </div>
  );
}

function DeviceVitals({ label, icon, device }: { label: string; icon: ReactNode; device: DevicePerformance }) {
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <VitalCell name="LCP" value={device.lcp} unit="ms" rating={device.ratings.lcp} />
          <VitalCell name="CLS" value={device.cls} unit="cls" rating={device.ratings.cls} />
          <VitalCell name="INP" value={device.inp} unit="ms" rating={device.ratings.inp} />
          <VitalCell name="FCP" value={device.fcp} unit="ms" rating={device.fcp === null ? "unavailable" : "good"} />
          <VitalCell name="TBT" value={device.tbt} unit="ms" rating={device.tbt === null ? "unavailable" : "good"} />
          <VitalCell name="TTFB" value={device.ttfb} unit="ms" rating={device.ttfb === null ? "unavailable" : "good"} />
        </div>
      )}
      {device.issues?.length ? (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {device.issues.slice(0, 6).map((issue) => (
            <li key={issue.id} className="flex items-start justify-between gap-2 text-xs text-slate-600">
              <span>{issue.title}</span>
              {issue.displayValue ? (
                <span className="shrink-0 font-mono text-slate-500">{issue.displayValue}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FindingRow({ check }: { check: AuditCheck }) {
  const [open, setOpen] = useState(false);
  const meta = severityMeta(check.severity);
  const Icon = meta.Icon;
  return (
    <div className="border-b border-slate-100 last:border-0">
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
            {check.affectedCount > 0 ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {check.affectedCount} page{check.affectedCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          {check.fix ? <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{check.fix}</p> : null}
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

function FindingsList({
  checks,
  showAll,
  onToggleShowAll,
}: {
  checks: AuditCheck[];
  showAll: boolean;
  onToggleShowAll: () => void;
}) {
  const findings = checks.filter(isFinding);
  const passes = checks.filter((c) => !isFinding(c));
  const visible = showAll ? checks : findings;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{findings.length} issues</span>
          <span>·</span>
          <span>{passes.length} passed</span>
        </div>
        <button
          type="button"
          onClick={onToggleShowAll}
          className="text-xs font-medium text-blue-700 hover:underline"
        >
          {showAll ? "Show issues only" : "Show all checks"}
        </button>
      </div>
      {visible.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-slate-500">No issues in this category.</p>
      ) : (
        visible.map((c) => <FindingRow key={c.id} check={c} />)
      )}
    </div>
  );
}

export function ReportDashboard({
  report,
  publicView,
  onUpdateBranding,
}: {
  report: WebReport;
  publicView?: boolean;
  onUpdateBranding?: (branding: { companyName?: string | null; logoUrl?: string | null }) => Promise<unknown>;
  isUpdatingBranding?: boolean;
}) {
  const finished = report.status === "completed";
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showAllSeo, setShowAllSeo] = useState(false);
  const [showAllAi, setShowAllAi] = useState(false);
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState(report.customerBranding?.companyName || "");
  const [editLogoUrl, setEditLogoUrl] = useState(report.customerBranding?.logoUrl || "");
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  let domain = "";
  try {
    domain = new URL(report.url).hostname;
  } catch {
    domain = report.url;
  }
  const customerName = report.customerBranding?.companyName || domain;
  const customerLogo = report.customerBranding?.logoUrl;
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

  const allFindings = useMemo(() => {
    const seo = report.seo.checks.filter(isFinding);
    const ai = report.aiSearch.checks.filter(isFinding);
    return [...seo, ...ai].sort((a, b) => {
      const rank = { critical: 0, warning: 1, info: 2, pass: 3 } as const;
      return rank[a.severity] - rank[b.severity] || b.affectedCount - a.affectedCount;
    });
  }, [report.seo.checks, report.aiSearch.checks]);

  const issueCounts = useMemo(() => {
    const errors = allFindings.filter((c) => c.severity === "critical").length;
    const warnings = allFindings.filter((c) => c.severity === "warning").length;
    const notices = allFindings.filter((c) => c.severity === "info").length;
    return { errors, warnings, notices, total: allFindings.length };
  }, [allFindings]);

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

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "vitals", label: "Core Web Vitals" },
    { id: "seo", label: "SEO", count: report.seo.checks.filter(isFinding).length },
    { id: "ai", label: "AI Search", count: report.aiSearch.checks.filter(isFinding).length },
    { id: "fixes", label: "Fixes", count: report.topFixes.length },
  ];

  const botEntries = Object.entries(report.aiSearch.botAccess || {});
  const botsAllowed = botEntries.filter(([, v]) => /allow|yes|ok/i.test(String(v))).length;

  return (
    <>
      <div className="audit-screen mx-auto flex w-full max-w-5xl flex-col gap-3 bg-[#f4f6f9] px-3 py-4 text-slate-900 print:hidden sm:px-5 sm:py-5">
        {/* Compact header */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <img
                  src={customerLogo || fallbackFavicon}
                  alt=""
                  className="size-7 rounded-md border border-slate-200 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackFavicon;
                  }}
                />
                <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                  {customerName}
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
              <p className="mt-2 text-sm font-medium text-slate-800">
                {report.summary.headline || stageLabel(report.status, report.stage)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {report.scannedAt
                    ? new Date(report.scannedAt).toLocaleString()
                    : report.status}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="size-3" />
                  {report.pagesCrawled} pages
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1 self-center sm:self-start">
              <CompactRing score={report.scores.overall} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Site score
              </span>
            </div>
          </div>

          {!report.completeness.complete ? (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              Incomplete: {report.completeness.unavailableSections.join(", ") || "some sections"} not
              measured.
            </div>
          ) : null}

          {finished && publicView ? (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <Button type="button" size="sm" className="gap-1.5" onClick={() => window.print()}>
                <Download className="size-3.5" />
                Download PDF
              </Button>
            </div>
          ) : null}
        </section>

        {/* Score strip */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <ScoreTile label="Overall" score={report.scores.overall} />
          <ScoreTile label="Mobile" score={report.scores.mobile} />
          <ScoreTile label="Desktop" score={report.scores.desktop} />
          <ScoreTile label="SEO" score={report.scores.seo} />
          <ScoreTile label="AI Search" score={report.scores.aiSearch} />
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
              {typeof tab.count === "number" && tab.count > 0 ? (
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

        {/* Tab panels */}
        {activeTab === "overview" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                {issueCounts.errors} errors
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                {issueCounts.warnings} warnings
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                {issueCounts.notices} notices
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Top issues
                </h2>
                {allFindings.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">No critical findings.</p>
                ) : (
                  <div className="-mx-1">
                    {allFindings.slice(0, 5).map((c) => (
                      <FindingRow key={c.id} check={c} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mobile CWV
                  </h2>
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

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Priority fixes
                  </h2>
                  {report.topFixes.length === 0 ? (
                    <p className="py-3 text-center text-sm text-slate-500">No ranked fixes.</p>
                  ) : (
                    <ol className="space-y-2">
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
          <FindingsList
            checks={report.seo.checks}
            showAll={showAllSeo}
            onToggleShowAll={() => setShowAllSeo((v) => !v)}
          />
        ) : null}

        {activeTab === "ai" ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Bot className="size-3.5" />
                  Bot access
                </div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {botsAllowed}/{botEntries.length || 0}{" "}
                  <span className="text-sm font-medium text-slate-500">allowed</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {botEntries.slice(0, 8).map(([bot, status]) => (
                    <span
                      key={bot}
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[10px] font-medium",
                        /allow|yes|ok/i.test(String(status))
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      )}
                      title={String(status)}
                    >
                      {bot}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-500">llms.txt</div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {report.aiSearch.llmsTxt.present ? "Present" : "Missing"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">{report.aiSearch.llmsTxt.status}</p>
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
            <FindingsList
              checks={report.aiSearch.checks}
              showAll={showAllAi}
              onToggleShowAll={() => setShowAllAi((v) => !v)}
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
                  <li key={fix.rank} className="px-4 py-3">
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
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}

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
