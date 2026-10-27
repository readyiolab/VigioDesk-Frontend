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
  HelpCircle,
  Clock,
  Layers,
  Zap,
  Bot,
  ExternalLink,
  Code,
  ShieldCheck,
  Download,
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
  if (score === null) return { grade: "—", label: "Not Scored", color: "text-slate-400 bg-slate-100" };
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
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="h-32 w-32" role="img" aria-label={`${label} score ${score === null ? "not measured" : score}`}>
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
          <span className={`mt-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${gradeInfo.color}`}>
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
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition hover:border-slate-300">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{name}</span>
        {label ? (
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ratingPill}`}>{label}</span>
        ) : null}
      </div>
      <div className="mt-1.5 text-lg font-bold tracking-tight text-slate-950">{shown}</div>
      {name.startsWith("INP") && value === null ? (
        <div className="mt-1 text-[11px] text-slate-400">Field data missing</div>
      ) : null}
    </div>
  );
}

function DevicePanel({ title, device }: { title: string; device: DevicePerformance }) {
  const isMobile = title.toLowerCase().includes("mobile");
  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs" aria-labelledby={`${title}-vitals`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {isMobile ? <Smartphone className="h-5 w-5 text-indigo-600" /> : <Monitor className="h-5 w-5 text-indigo-600" />}
          </div>
          <div>
            <h3 id={`${title}-vitals`} className="text-base font-bold text-slate-950">
              {title}
            </h3>
            <p className="text-xs text-slate-500">
              {device.score !== null ? `Engine Score: ${device.score}/100` : "Score unmeasured"}
            </p>
          </div>
        </div>
        {device.score !== null ? (
          <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${device.score >= 90 ? "bg-emerald-50 text-emerald-700" : device.score >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
            {device.score}/100
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <Metric name="LCP" value={device.lcp} unit="ms" rating={device.ratings.lcp} />
        <Metric name="INP (field)" value={device.inp} unit="ms" rating={device.ratings.inp} />
        <Metric name="TBT (lab)" value={device.tbt} unit="ms" rating={rateDuration(device.tbt, 200, 600)} />
        <Metric name="CLS" value={device.cls} unit="cls" rating={device.ratings.cls} />
        <Metric name="FCP" value={device.fcp} unit="ms" rating={rateDuration(device.fcp, 1800, 3000)} />
        <Metric name="TTFB" value={device.ttfb} unit="ms" rating={rateDuration(device.ttfb, 800, 1800)} />
      </div>
      <p className="mt-3.5 text-xs text-slate-500">
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
  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "seo" | "ai" | "fixes">("overview");

  return (
    <>
      <div className="audit-screen mx-auto flex max-w-5xl flex-col gap-6 bg-slate-50 px-4 py-8 text-slate-900 print:hidden sm:px-6">
        {/* Executive Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                  Vigodesk · WebReports Studio
                </p>
              </div>

              {report.cached ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  <Zap className="h-3 w-3 text-amber-500" /> Cached Result
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {report.summary.headline || stageLabel(report.status, report.stage)}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {report.summary.text || "The scan is still collecting evidence."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
                  <p className="text-sm font-medium text-amber-900">
                    Incomplete measurement: {report.completeness.unavailableSections.join(", ") || "some sections"}. Unavailable
                    scores are omitted, not treated as zero.
                  </p>
                </div>
              </div>
            ) : null}

            {finished && publicView ? (
              <Button
                type="button"
                className="mt-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            ) : null}
          </div>
        </section>

        {/* Studio Interactive Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
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
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
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
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
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
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "ai"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Search Engine Readiness
          </button>
          {report.topFixes.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveTab("fixes")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
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
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Category scores">
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

        {/* Tab 1: Overview or Always Active sections */}
        {(activeTab === "overview" || activeTab === "vitals") && (
          <section className="grid gap-4 md:grid-cols-2" aria-label="Performance">
            <DevicePanel title="Mobile vitals" device={report.performance.mobile} />
            <DevicePanel title="Desktop vitals" device={report.performance.desktop} />
          </section>
        )}

        {/* Key Problems Section (Required for unit test contracts) */}
        {(activeTab === "overview" || activeTab === "seo") && (
          <section aria-labelledby="problems-heading" className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 id="problems-heading" className="text-lg font-bold tracking-tight text-slate-950">
                Key problems
              </h2>
              <span className="text-xs font-medium text-slate-500">Prioritized by impact</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {problems.map((group) => (
                <article key={group.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <h3 className="font-semibold text-slate-950 text-sm">{group.title}</h3>
                  </div>
                  <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-600">
                    {group.lines.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
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
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950">Technical SEO Checks</h3>
                <p className="text-xs text-slate-500">Automated crawl diagnostics for search engines</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {report.seo.checks.length} items evaluated
              </span>
            </div>
            <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
              {report.seo.checks.map((check) => (
                <CheckItemRow key={check.id} check={check} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Fix Roadmap: Do These First (Required by test contracts) */}
        {report.topFixes.length > 0 && (activeTab === "overview" || activeTab === "fixes") ? (
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs" aria-labelledby="fixes-heading">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="fixes-heading" className="text-lg font-bold text-slate-950">
                  Do these first
                </h2>
                <p className="text-xs text-slate-500">Developer actionable fixes ranked by ROI</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Action Plan
              </span>
            </div>
            <ol className="mt-4 space-y-3">
              {report.topFixes.map((fix) => (
                <li key={fix.rank} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                        {fix.rank}
                      </span>
                      <div className="font-semibold text-sm text-slate-950">{fix.title}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600">
                        Impact: {fix.impact}
                      </span>
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600">
                        Effort: {fix.effort}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{fix.why}</p>
                  {fix.instructions ? (
                    <div className="mt-3 rounded-xl border border-slate-200/80 bg-white p-3 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900">How to resolve:</p>
                      <p className="mt-1 leading-relaxed">{fix.instructions}</p>
                    </div>
                  ) : null}
                  {fix.snippet ? (
                    <pre className="mt-2.5 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-400">
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
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs" aria-labelledby="ai-note">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h2 id="ai-note" className="text-lg font-bold text-slate-950">
                  Show up in AI answers
                </h2>
                <p className="text-xs text-slate-500">
                  SearchGPT, Claude, Perplexity, and AI Overview indexing signals
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Crawler access and structured data help a site be understood in AI answers. They do not guarantee inclusion.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Bot access does not guarantee inclusion in AI answers.
            </p>

            {/* AI Bot Crawler Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(report.aiSearch.botAccess).map(([bot, status]) => (
                <div key={bot} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="text-xs font-semibold text-slate-900">{bot}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {status === "allowed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        <XCircle className="h-3 w-3" /> Blocked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* llms.txt & JS Dependency Callouts */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
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
                <p className="mt-1 text-xs text-slate-500">
                  Standardized Markdown syllabus for LLM agents to consume structured documentation.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Client-Side JS Dependency</span>
                  <span className="font-mono text-xs text-slate-600">
                    {report.aiSearch.jsDependency.rawVsRenderedRatio !== null
                      ? `${Math.round(report.aiSearch.jsDependency.rawVsRenderedRatio * 100)}% SSR`
                      : "Standard"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  AI bots parse raw HTML first. Low server-rendered content can reduce indexing accuracy.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* How Vigodesk can help (Section Required for unit tests) */}
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:p-8" aria-labelledby="readyio-help">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <h2 id="readyio-help" className="text-lg font-bold">
              How Vigodesk can help
            </h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300">
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
          <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
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
    <div className="group rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        {icon}
      </div>
      <div className={`mt-2 font-bold ${score === null ? "text-base text-slate-400" : `text-3xl ${scoreColor(score)}`}`}>
        {score === null ? "Not measured" : score}
      </div>
      {score !== null ? (
        <div className="mt-2">
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
    <div className="flex flex-col gap-1 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        {isPass ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
        ) : isCritical ? (
          <XCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-900">{check.title}</span>
            {check.affectedCount > 0 ? (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                {check.affectedCount} page{check.affectedCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{check.description}</p>
        </div>
      </div>
      {check.fix ? (
        <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50/80 rounded-md px-2 py-0.5 shrink-0 self-start sm:self-center">
          {check.fix}
        </span>
      ) : null}
    </div>
  );
}
