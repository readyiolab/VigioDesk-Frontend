import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DevicePerformance, VitalRating, WebReport, AuditCheck } from "./types";
import { stageLabel } from "./stageLabel";
import { keyProblems, rateDuration } from "./reportNarrative";
import { ReportPrint } from "./ReportPrint";
import {
  Smartphone,
  Monitor,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Zap,
  Bot,
  ExternalLink,
  Code,
  ShieldCheck,
  Download,
  Info,
  TrendingUp,
  SlidersHorizontal,
  FileCheck,
} from "lucide-react";

const RATING_LABEL: Record<Exclude<VitalRating, "unavailable">, string> = {
  good: "Good",
  "needs-improvement": "Needs improvement",
  poor: "Poor",
};

function scoreColor(score: number | null): string {
  if (score === null) return "text-slate-400";
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getGrade(score: number | null) {
  if (score === null) return { grade: "—", label: "Not Scored", color: "text-slate-400 bg-slate-100 border-slate-200" };
  if (score >= 90) return { grade: "A+", label: "Optimal Health", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (score >= 80) return { grade: "A", label: "Fast & Indexable", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (score >= 65) return { grade: "B", label: "Moderate Issues", color: "text-amber-700 bg-amber-50 border-amber-200" };
  if (score >= 50) return { grade: "C", label: "Needs Optimization", color: "text-orange-700 bg-orange-50 border-orange-200" };
  return { grade: "F", label: "Action Required", color: "text-red-700 bg-red-50 border-red-200" };
}

export function ScoreRing({ score, label }: { score: number | null; label: string }) {
  const value = score ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = score === null ? 0 : (value / 100) * circumference;
  const gradeInfo = getGrade(score);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="h-28 w-28 sm:h-32 sm:w-32" role="img" aria-label={`${label} score ${score === null ? "not measured" : score}`}>
          <circle cx="50" cy="50" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={scoreColor(score)}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="48" textAnchor="middle" className="fill-slate-950 text-2xl font-bold tracking-tight">
            {score === null ? "—" : score}
          </text>
          <text x="50" y="64" textAnchor="middle" className="fill-slate-400 text-[10px] font-semibold uppercase tracking-wider">
            / 100
          </text>
        </svg>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {score !== null ? (
          <span className={`mt-0.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${gradeInfo.color}`}>
            {gradeInfo.grade} · {gradeInfo.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ name, value, unit, rating }: { name: string; value: number | null; unit: string; rating: VitalRating }) {
  const shown = value === null ? (name.startsWith("INP") ? "Unavailable" : "Not measured") : unit === "cls" ? value.toFixed(2) : `${Math.round(value)} ${unit}`;
  const label = value === null || rating === "unavailable" ? null : RATING_LABEL[rating];
  
  const ratingPill =
    rating === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : rating === "needs-improvement"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : rating === "poor"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-slate-50 text-slate-500 border-slate-200";

  return (
    <div className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs transition hover:border-slate-300">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{name}</span>
        {label ? (
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ratingPill}`}>{label}</span>
        ) : null}
      </div>
      <div className="mt-1 text-base font-bold tracking-tight text-slate-950 sm:text-lg">{shown}</div>
      {name.startsWith("INP") && value === null ? (
        <div className="mt-0.5 text-[10px] text-slate-400">Field data missing</div>
      ) : null}
    </div>
  );
}

function DevicePanel({ title, device }: { title: string; device: DevicePerformance }) {
  const isMobile = title.toLowerCase().includes("mobile");
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5" aria-labelledby={`${title}-vitals`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            {isMobile ? <Smartphone className="h-4.5 w-4.5" /> : <Monitor className="h-4.5 w-4.5" />}
          </div>
          <div>
            <h3 id={`${title}-vitals`} className="text-sm font-bold text-slate-950 sm:text-base">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500">
              {device.score !== null ? `Score: ${device.score}/100` : "Score unmeasured"}
            </p>
          </div>
        </div>
        {device.score !== null ? (
          <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${device.score >= 90 ? "bg-emerald-50 text-emerald-700" : device.score >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
            {device.score}/100
          </span>
        ) : null}
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric name="LCP" value={device.lcp} unit="ms" rating={device.ratings.lcp} />
        <Metric name="INP (field)" value={device.inp} unit="ms" rating={device.ratings.inp} />
        <Metric name="TBT (lab)" value={device.tbt} unit="ms" rating={rateDuration(device.tbt, 200, 600)} />
        <Metric name="CLS" value={device.cls} unit="cls" rating={device.ratings.cls} />
        <Metric name="FCP" value={device.fcp} unit="ms" rating={rateDuration(device.fcp, 1800, 3000)} />
        <Metric name="TTFB" value={device.ttfb} unit="ms" rating={rateDuration(device.ttfb, 800, 1800)} />
      </div>
      <p className="mt-2.5 text-[11px] text-slate-400">
        INP is field data when CrUX has it. TBT is a lab diagnostic and is not a measured INP value.
      </p>
    </section>
  );
}

export function ReportDashboard({
  report,
  publicView,
}: {
  report: WebReport;
  publicView?: boolean;
}) {
  const problems = keyProblems(report);
  const finished = report.status === "completed";
  const [viewMode, setViewMode] = useState<"plain" | "technical">("plain");
  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "seo" | "ai" | "fixes">("overview");

  // Non-technical interpretations
  const mobileLcp = report.performance.mobile.lcp;
  const speedVerdict =
    mobileLcp === null
      ? "Speed could not be fully measured on this scan."
      : mobileLcp <= 2500
        ? "Lightning Fast — Your pages load in under 2.5s. Visitors get an instant experience and won't bounce."
        : mobileLcp <= 4000
          ? "Moderate Loading Time — Takes ~3 to 4 seconds. Mobile visitors on slower cellular networks may feel a slight delay."
          : "Slow Loading Time — Takes over 4 seconds. More than half of mobile visitors abandon pages that take >3 seconds.";

  const mobileCls = report.performance.mobile.cls;
  const stabilityVerdict =
    mobileCls === null
      ? "Visual stability not recorded."
      : mobileCls <= 0.1
        ? "Smooth & Rock Solid — Page elements stay firmly in place while loading, preventing frustrating accidental misclicks."
        : "Content Shifts Detected — Images or buttons jump around while loading, which often causes visitors to tap the wrong link.";

  const seoScore = report.scores.seo;
  const seoVerdict =
    seoScore === null
      ? "SEO checks pending."
      : seoScore >= 80
        ? "Search Engine Ready — Google's crawlers can cleanly index your titles, meta descriptions, and page links."
        : "Search Engine Gaps Found — Some pages lack proper titles or structured data, which can reduce your Google ranking.";

  const aiScore = report.scores.aiSearch;
  const aiVerdict =
    aiScore === null
      ? "AI crawler accessibility unmeasured."
      : aiScore >= 80
        ? "AI-Ready — Major AI engines (ChatGPT, Claude, Perplexity) are permitted to crawl your content for generative answers."
        : "Partial AI Access — One or more AI crawlers may be blocked in your robots.txt file.";

  return (
    <>
      <div className="audit-screen mx-auto flex w-full max-w-5xl flex-col gap-4 bg-slate-50 px-3.5 py-4 text-slate-900 print:hidden sm:px-6 sm:py-6">
        
        {/* Executive Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-0.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                Vigodesk · WebReports Studio
              </p>
            </div>

            {/* Audience View Switcher: Non-technical vs Technical */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("plain")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                  viewMode === "plain"
                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Plain English (Executive)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("technical")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                  viewMode === "technical"
                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Technical (Developer)
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                {report.summary.headline || stageLabel(report.status, report.stage)}
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {report.summary.text || "The scan is still collecting evidence."}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <a
                  href={report.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono font-medium text-indigo-700 hover:underline"
                >
                  {report.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {report.scannedAt ? `Completed ${new Date(report.scannedAt).toLocaleString()}` : `Status ${report.status}`}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  {`${report.pagesCrawled} pages`}
                </span>
              </div>
            </div>

            <div className="shrink-0 self-center md:self-auto">
              <ScoreRing score={report.scores.overall} label="Overall" />
            </div>
          </div>

          {!report.completeness.complete ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                <p className="text-xs font-medium text-amber-900">
                  Incomplete measurement: {report.completeness.unavailableSections.join(", ") || "some sections"}. Unavailable
                  scores are omitted, not treated as zero.
                </p>
              </div>
            </div>
          ) : null}

          {finished && publicView ? (
            <Button
              type="button"
              className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
              onClick={() => window.print()}
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          ) : null}
        </section>

        {/* ── PLAIN-ENGLISH EXECUTIVE BREAKDOWN (For Non-Technical People) ── */}
        {viewMode === "plain" && (
          <section className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 via-white to-white p-4 shadow-xs sm:p-5">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                Non-Technical Analysis: What Does This Mean for Your Business?
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Clear, jargon-free explanations of how your website performs for real human visitors and search engines.
            </p>

            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              {/* Pillar 1: Speed */}
              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Customer Loading Experience</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                    Visitor Retention
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{speedVerdict}</p>
                <div className="mt-2 text-[11px] font-medium text-indigo-600">
                  💡 Business Takeaway: Faster loading keeps visitors from hitting the back button.
                </div>
              </div>

              {/* Pillar 2: Screen Stability */}
              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    <span>Mobile Screen Stability</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                    Ease of Use
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{stabilityVerdict}</p>
                <div className="mt-2 text-[11px] font-medium text-indigo-600">
                  💡 Business Takeaway: Stable scrolling prevents shoppers from tapping the wrong button.
                </div>
              </div>

              {/* Pillar 3: Google SEO */}
              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                    <Search className="h-4 w-4 text-emerald-500" />
                    <span>Google Search Discovery</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                    Google Traffic
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{seoVerdict}</p>
                <div className="mt-2 text-[11px] font-medium text-indigo-600">
                  💡 Business Takeaway: Descriptive titles help Google send you the right customers.
                </div>
              </div>

              {/* Pillar 4: AI Engine Inclusion */}
              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>AI Chatbot Readiness (ChatGPT &amp; Claude)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                    AI Citations
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{aiVerdict}</p>
                <div className="mt-2 text-[11px] font-medium text-indigo-600">
                  💡 Business Takeaway: Open bot access helps AI recommend your products in modern search.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab Bar for Section Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Executive Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vitals")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "vitals"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Core Web Vitals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "seo"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            SEO Audit ({report.seo.checks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "ai"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Search Readiness
          </button>
          {report.topFixes.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveTab("fixes")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "fixes"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              Fix Roadmap ({report.topFixes.length})
            </button>
          ) : null}
        </div>

        {/* Category Score Tiles */}
        <section className="grid grid-cols-2 gap-2.5 md:grid-cols-4" aria-label="Category scores">
          <ScoreCard
            label="Mobile"
            score={report.scores.mobile}
            icon={<Smartphone className="h-4 w-4 text-indigo-600" />}
          />
          <ScoreCard
            label="Desktop"
            score={report.scores.desktop}
            icon={<Monitor className="h-4 w-4 text-indigo-600" />}
          />
          <ScoreCard
            label="SEO"
            score={report.scores.seo}
            icon={<Search className="h-4 w-4 text-emerald-600" />}
          />
          <ScoreCard
            label="AI Search"
            score={report.scores.aiSearch}
            icon={<Sparkles className="h-4 w-4 text-purple-600" />}
          />
        </section>

        {/* Tab 1: Overview or Vitals Section */}
        {(activeTab === "overview" || activeTab === "vitals") && (
          <section className="grid gap-3 md:grid-cols-2" aria-label="Performance">
            <DevicePanel title="Mobile vitals" device={report.performance.mobile} />
            <DevicePanel title="Desktop vitals" device={report.performance.desktop} />
          </section>
        )}

        {/* Key Problems Section (Required for unit test contracts) */}
        {(activeTab === "overview" || activeTab === "seo") && (
          <section aria-labelledby="problems-heading" className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between">
              <h2 id="problems-heading" className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">
                Key problems
              </h2>
              <span className="text-xs font-medium text-slate-500">Ranked by business priority</span>
            </div>
            <div className="mt-3 grid gap-2.5 md:grid-cols-2">
              {problems.map((group) => (
                <article key={group.title} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <h3 className="font-semibold text-slate-950 text-xs sm:text-sm">{group.title}</h3>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                    {group.lines.map((line) => (
                      <li key={line} className="flex items-start gap-1.5">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Technical SEO Audit Checks Tab/Section */}
        {(activeTab === "overview" || activeTab === "seo") && report.seo.checks.length > 0 ? (
          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-950 sm:text-base">Technical SEO Checks</h3>
                <p className="text-[11px] text-slate-500">Automated page crawl diagnostics for Google and Bing</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {report.seo.checks.length} items
              </span>
            </div>
            <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {report.seo.checks.map((check) => (
                <CheckItemRow key={check.id} check={check} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Fix Roadmap: Do These First (Required by test contracts) */}
        {report.topFixes.length > 0 && (activeTab === "overview" || activeTab === "fixes") ? (
          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5" aria-labelledby="fixes-heading">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="fixes-heading" className="text-base font-bold text-slate-950 sm:text-lg">
                  Do these first
                </h2>
                <p className="text-[11px] text-slate-500">Prioritized checklist for your webmaster or developer</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                Action Plan
              </span>
            </div>
            <ol className="mt-3 space-y-2.5">
              {report.topFixes.map((fix) => (
                <li key={fix.rank} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-[11px] font-bold text-white">
                        {fix.rank}
                      </span>
                      <div className="font-semibold text-xs text-slate-950 sm:text-sm">{fix.title}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="rounded border border-slate-200 bg-white px-1.5 py-0.2 font-medium text-slate-600">
                        Impact: {fix.impact}
                      </span>
                      <span className="rounded border border-slate-200 bg-white px-1.5 py-0.2 font-medium text-slate-600">
                        Effort: {fix.effort}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{fix.why}</p>
                  {fix.instructions ? (
                    <div className="mt-2.5 rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900">How to resolve:</p>
                      <p className="mt-0.5 leading-relaxed">{fix.instructions}</p>
                    </div>
                  ) : null}
                  {fix.snippet ? (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400">
                      <code>{fix.snippet}</code>
                    </pre>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* AI Answers Readiness Section (Required by test contracts) */}
        {(activeTab === "overview" || activeTab === "ai") && (
          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5" aria-labelledby="ai-note">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h2 id="ai-note" className="text-base font-bold text-slate-950 sm:text-lg">
                  Show up in AI answers
                </h2>
                <p className="text-[11px] text-slate-500">
                  SearchGPT, Claude, Perplexity, and AI Overview indexing signals
                </p>
              </div>
            </div>

            <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Crawler access and structured data help a site be understood in AI answers. They do not guarantee inclusion.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Bot access does not guarantee inclusion in AI answers.
            </p>

            {/* AI Bot Crawler Grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(report.aiSearch.botAccess).map(([bot, status]) => (
                <div key={bot} className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                  <div className="text-xs font-semibold text-slate-900">{bot}</div>
                  <div className="mt-1 flex items-center gap-1">
                    {status === "allowed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        <XCircle className="h-3 w-3" /> Blocked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* llms.txt & JS Dependency Callouts */}
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">/llms.txt</span>
                  {report.aiSearch.llmsTxt.present ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Discovered
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      Not Configured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Standardized Markdown syllabus for LLM agents to consume structured documentation.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Client-Side JS Dependency</span>
                  <span className="font-mono text-xs text-slate-600">
                    {report.aiSearch.jsDependency.rawVsRenderedRatio !== null
                      ? `${Math.round(report.aiSearch.jsDependency.rawVsRenderedRatio * 100)}% SSR`
                      : "Standard"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  AI bots parse raw HTML first. Low server-rendered content can reduce indexing accuracy.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* How Vigodesk can help (Section Required for unit tests) */}
        <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-md sm:p-6" aria-labelledby="readyio-help">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
            <h2 id="readyio-help" className="text-base font-bold">
              How Vigodesk can help
            </h2>
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>Rerun this audit after the fixes so the next score sits beside this one.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>Share the report with the people who will change the site.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>Use the same scan again when the mobile speed or structured data changes.</span>
            </li>
          </ul>
        </section>

        {report.status === "failed" && report.error ? (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-800 sm:text-sm">
            {report.error.message}
          </p>
        ) : null}
      </div>

      {finished ? <ReportPrint report={report} problems={problems} /> : null}
    </>
  );
}

function ScoreCard({ label, score, icon }: { label: string; score: number | null; icon?: React.ReactNode }) {
  const grade = getGrade(score);
  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        {icon}
      </div>
      <div className={`mt-1.5 font-bold ${score === null ? "text-base text-slate-400" : `text-2xl sm:text-3xl ${scoreColor(score)}`}`}>
        {score === null ? "Not measured" : score}
      </div>
      {score !== null ? (
        <div className="mt-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${score >= 90 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(100, score)}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Grade {grade.grade}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CheckItemRow({ check }: { check: AuditCheck }) {
  const isPass = check.severity === "pass" || check.status === "absent";
  const isCritical = check.severity === "critical";

  return (
    <div className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50">
      <div className="flex items-start gap-2 min-w-0 flex-1">
        {isPass ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
        ) : isCritical ? (
          <XCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-900">{check.title}</span>
            {check.affectedCount > 0 ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                {check.affectedCount} page{check.affectedCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{check.description}</p>
        </div>
      </div>
      {check.fix ? (
        <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50/80 rounded px-2 py-0.5 shrink-0 self-start sm:self-center">
          {check.fix}
        </span>
      ) : null}
    </div>
  );
}
