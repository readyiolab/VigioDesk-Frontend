import type { ProblemGroup } from "./reportNarrative";
import type { WebReport, VitalRating } from "./types";

function scoreText(score: number | null): string {
  return score === null ? "Not measured" : String(score);
}

function getGrade(score: number | null) {
  if (score === null) return { grade: "—", label: "Unrated", color: "text-slate-400 bg-slate-100" };
  if (score >= 90) return { grade: "A+", label: "Optimal", color: "text-emerald-700 bg-emerald-50" };
  if (score >= 80) return { grade: "A", label: "Good", color: "text-emerald-700 bg-emerald-50" };
  if (score >= 65) return { grade: "B", label: "Moderate", color: "text-amber-700 bg-amber-50" };
  if (score >= 50) return { grade: "C", label: "Fair", color: "text-orange-700 bg-orange-50" };
  return { grade: "F", label: "Action Needed", color: "text-red-700 bg-red-50" };
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ReportPrint({ report, problems }: { report: WebReport; problems: ProblemGroup[] }) {
  const when = report.scannedAt
    ? new Date(report.scannedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "In progress";

  const domain = getHostname(report.url);
  const customerName = report.customerBranding?.companyName || domain;
  const customerLogo = report.customerBranding?.logoUrl;
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  const overallGrade = getGrade(report.scores.overall);

  return (
    <article hidden className="audit-print text-slate-900 font-sans print:block">
      {/* ── PAGE 1: COVER & EXECUTIVE DASHBOARD (DUAL BRANDED) ── */}
      <section className="audit-page bg-white p-10 border-b border-slate-200">
        {/* Dual Branded Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
          {/* Left: Official Zuvigo.com Enterprise Brand */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm ring-1 ring-slate-800">
              <span className="font-black text-2xl tracking-tight text-white">Z</span>
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-950">
                Zuvigo<span className="text-indigo-600">.com</span>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Enterprise AI Website Intelligence
              </p>
            </div>
          </div>

          {/* Right: Customer's Company Logo & Branding */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-base font-bold text-slate-950">{customerName}</div>
              <p className="font-mono text-[11px] font-medium text-slate-500">{domain}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
              <img
                src={customerLogo || fallbackFavicon}
                alt={customerName}
                className="h-full w-full object-contain rounded-lg"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* Report Identification & Metadata */}
        <div className="mt-8 flex items-start justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block rounded-md bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
              Audited by Zuvigo.com · AI Engine
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 leading-tight">
              {report.summary.headline || "Website Quality & AI Audit"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {report.summary.text || "This scan finished with the measurements below."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-800">{report.url}</span>
              <span>•</span>
              <span>Audited on {when}</span>
              <span>•</span>
              <span>{report.pagesCrawled} {report.pagesCrawled === 1 ? "page" : "pages"}</span>
            </div>
          </div>

          {/* Featured Overall Score Tile */}
          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-50 p-6 text-center w-36">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Overall Score</span>
            <span className="mt-1 text-4xl font-black text-slate-950">
              {report.scores.overall ?? "—"}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">/ 100</span>
            <span className={`mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${overallGrade.color}`}>
              Grade {overallGrade.grade}
            </span>
          </div>
        </div>

        {/* 4 Category Scores Grid */}
        <div className="mt-8 grid grid-cols-4 gap-3.5">
          <ScoreTile label="Mobile" score={report.scores.mobile} />
          <ScoreTile label="Desktop" score={report.scores.desktop} />
          <ScoreTile label="SEO" score={report.scores.seo} />
          <ScoreTile label="AI search" score={report.scores.aiSearch} />
        </div>

        {!report.completeness.complete ? (
          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 font-medium">
            Incomplete measurement: {report.completeness.unavailableSections.join(", ") || "some sections"}. Missing
            scores are left out. They are not treated as zero.
          </p>
        ) : null}

        {/* Core Web Vitals Lab Summary Table */}
        <div className="mt-8 rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider">
            Core Web Vitals &amp; Performance Telemetry
          </div>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Metric</th>
                <th className="py-2.5 px-4">Mobile Lab</th>
                <th className="py-2.5 px-4">Desktop Lab</th>
                <th className="py-2.5 px-4">Target (Good)</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2 px-4 font-semibold text-slate-900">LCP (Largest Contentful Paint)</td>
                <td className="py-2 px-4 font-mono">{formatMs(report.performance.mobile.lcp)}</td>
                <td className="py-2 px-4 font-mono">{formatMs(report.performance.desktop.lcp)}</td>
                <td className="py-2 px-4 text-slate-500">≤ 2,500 ms</td>
                <td className="py-2 px-4"><RatingBadge rating={report.performance.mobile.ratings.lcp} /></td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold text-slate-900">CLS (Cumulative Layout Shift)</td>
                <td className="py-2 px-4 font-mono">{formatCls(report.performance.mobile.cls)}</td>
                <td className="py-2 px-4 font-mono">{formatCls(report.performance.desktop.cls)}</td>
                <td className="py-2 px-4 text-slate-500">≤ 0.10</td>
                <td className="py-2 px-4"><RatingBadge rating={report.performance.mobile.ratings.cls} /></td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold text-slate-900">TBT (Total Blocking Time)</td>
                <td className="py-2 px-4 font-mono">{formatMs(report.performance.mobile.tbt)}</td>
                <td className="py-2 px-4 font-mono">{formatMs(report.performance.desktop.tbt)}</td>
                <td className="py-2 px-4 text-slate-500">≤ 200 ms</td>
                <td className="py-2 px-4"><RatingBadge rating={rateDuration(report.performance.mobile.tbt, 200, 600)} /></td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold text-slate-900">FCP (First Contentful Paint)</td>
                <td className="py-2 px-4 font-mono">{formatMs(report.performance.mobile.fcp)}</td>
                <td className="py-2 px-4 font-mono">{formatMs(report.performance.desktop.fcp)}</td>
                <td className="py-2 px-4 text-slate-500">≤ 1,800 ms</td>
                <td className="py-2 px-4"><RatingBadge rating={rateDuration(report.performance.mobile.fcp, 1800, 3000)} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PAGE 2: KEY PROBLEMS & FINDINGS ── */}
      <section className="audit-page bg-white p-10 border-b border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-700">
            Zuvigo.com AI Audit · Critical Findings
          </p>
          <p className="text-xs font-semibold text-slate-600">{customerName}</p>
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Key problems</h2>
        <p className="mt-1 text-xs text-slate-600">
          Ranked by business priority, user impact, and search crawler visibility:
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {problems.map((group) => (
            <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-bold text-slate-950">{group.title}</h3>
              <ul className="mt-2.5 space-y-2 text-xs leading-5 text-slate-700">
                {group.lines.map((line) => (
                  <li key={line} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Priority Action Items */}
        {report.topFixes.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recommended Action Plan
            </h3>
            <div className="mt-3 space-y-2.5">
              {report.topFixes.slice(0, 4).map((rec) => (
                <div key={rec.rank} className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Priority Action #{rec.rank}: {rec.instructions}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Impact: {rec.impact} · Effort: {rec.effort}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{rec.why}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* ── PAGE 3: AI SEARCH READINESS & ENTERPRISE SIGN-OFF ── */}
      <section className="audit-page bg-white p-10">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-700">
            Zuvigo.com AI Audit · AI Citations &amp; Crawlers
          </p>
          <p className="text-xs font-semibold text-slate-600">{customerName}</p>
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Show up in AI answers</h2>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-700">
          Crawler access and structured data help a site be understood in AI answers. They do not guarantee inclusion.
        </p>


        {/* AI Bot Crawlers Matrix */}
        <div className="mt-6 rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
            AI Engine Permission Matrix
          </div>
          <div className="grid grid-cols-4 divide-x divide-y divide-slate-100 bg-slate-50/50 text-xs">
            {Object.entries(report.aiSearch.botAccess).map(([bot, status]) => (
              <div key={bot} className="p-3">
                <div className="font-semibold text-slate-900">{bot}</div>
                <div className="mt-1 font-bold text-[11px]">
                  {status === "allowed" ? (
                    <span className="text-emerald-700">Allowed</span>
                  ) : (
                    <span className="text-red-700">Blocked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="mt-8 text-xl font-bold tracking-tight text-slate-950">How Zuvigo.com can help</h2>
        <ul className="mt-3 max-w-xl space-y-2 text-xs leading-relaxed text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Rerun this audit after the fixes so the next score sits beside this one.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Share the report with the people who will change the site.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Use the same scan again when the mobile speed or structured data changes.</span>
          </li>
        </ul>

        {/* Section 12: Zuvigo.com Official Enterprise Footer */}
        <div className="mt-12 rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="font-black text-slate-950 text-base">Zuvigo.com</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Autonomous AI Audit Engine
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 max-w-md mx-auto">
            This report represents verified telemetry and crawl data collected by ZuvigoBot. For questions, white-label API access, or remediation support, contact our engineering team.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-semibold text-indigo-700">
            <span>support@zuvigo.com</span>
            <span>•</span>
            <span>https://zuvigo.com</span>
          </div>
          <p className="mt-3 text-[10px] text-slate-400">
            © {new Date().getFullYear()} Zuvigo.com · All rights reserved · Audited Target: {report.url}
          </p>
        </div>
      </section>
    </article>
  );
}

function ScoreTile({ label, score, featured }: { label: string; score: number | null; featured?: boolean }) {
  const tone =
    score === null
      ? "text-slate-400"
      : score >= 90
        ? "text-emerald-700"
        : score >= 50
          ? "text-amber-700"
          : "text-red-700";

  return (
    <div className={`rounded-xl border border-slate-200 p-4 ${featured ? "bg-white shadow-xs" : "bg-white"}`}>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`mt-1 font-extrabold ${score === null ? "text-sm" : "text-3xl"} ${tone}`}>
        {scoreText(score)}
      </div>
    </div>
  );
}

function formatMs(val: number | null): string {
  return val === null ? "—" : `${Math.round(val)} ms`;
}

function formatCls(val: number | null): string {
  return val === null ? "—" : val.toFixed(2);
}

function RatingBadge({ rating }: { rating: VitalRating }) {
  if (rating === "good") {
    return <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Good</span>;
  }
  if (rating === "needs-improvement") {
    return <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Fair</span>;
  }
  if (rating === "poor") {
    return <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">Poor</span>;
  }
  return <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">—</span>;
}

function rateDuration(val: number | null, good: number, poor: number): VitalRating {
  if (val === null) return "unavailable";
  if (val <= good) return "good";
  if (val <= poor) return "needs-improvement";
  return "poor";
}
