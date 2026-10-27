import type { ProblemGroup } from "./reportNarrative";
import type { WebReport } from "./types";

function scoreText(score: number | null): string {
  return score === null ? "Not measured" : String(score);
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ReportPrint({ report, problems }: { report: WebReport; problems: ProblemGroup[] }) {
  const when = report.scannedAt ? new Date(report.scannedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "In progress";

  const domain = getHostname(report.url);
  const customerName = report.customerBranding?.companyName || domain;
  const customerLogo = report.customerBranding?.logoUrl;
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

  return (
    <article hidden className="audit-print text-slate-900 font-sans print:block">
      {/* ── PAGE 1: COVER & EXECUTIVE SUMMARY WITH DUAL BRANDING ── */}
      <section className="audit-page bg-[#F8FAFC] p-8 border-b border-slate-200">
        {/* Dual Branded Header: Left Zuvigo.com, Right Customer */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          {/* Left: Official Zuvigo.com Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 stroke-current stroke-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
                Zuvigo<span className="text-indigo-600">.com</span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                AI Website Audit & Intelligence
              </p>
            </div>
          </div>

          {/* Right: Customer's Company Logo and Branding */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-sm font-bold text-slate-900">{customerName}</div>
              <p className="text-[10px] font-medium text-slate-500">{domain}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
              <img
                src={customerLogo || fallbackFavicon}
                alt={customerName}
                className="h-full w-full object-contain rounded-lg"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* Report Title & Metadata */}
        <div className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <span>Official AI Audit Report</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {report.summary.headline || "Website Quality & AI Audit"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            {report.summary.text || "Comprehensive technical, performance, search engine, and AI readiness audit."}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="rounded bg-slate-200/70 px-2 py-0.5 text-slate-700 font-mono">{report.url}</span>
            <span>•</span>
            <span>Audited on {when}</span>
            <span>•</span>
            <span>{report.pagesCrawled} {report.pagesCrawled === 1 ? "page analyzed" : "pages analyzed"}</span>
          </div>
        </div>

        {/* Audit Scorecards */}
        <div className="mt-8 grid grid-cols-5 gap-3">
          <ScoreTile label="Overall Score" score={report.scores.overall} featured />
          <ScoreTile label="Mobile Speed" score={report.scores.mobile} />
          <ScoreTile label="Desktop Speed" score={report.scores.desktop} />
          <ScoreTile label="SEO Quality" score={report.scores.seo} />
          <ScoreTile label="AI Readiness" score={report.scores.aiSearch} />
        </div>

        {!report.completeness.complete ? (
          <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 font-medium">
            Incomplete measurement: {report.completeness.unavailableSections.join(", ") || "some sections"}. Missing
            scores are left out. They are not treated as zero.
          </p>
        ) : null}

        {/* Executive Summary Note */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Methodology</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            This report was autonomously generated by Zuvigo.com using headless browser instrumentation, Core Web Vitals field and lab data, structured schema.org analysis, and robots.txt LLM bot permissions. All findings are verified against actual HTTP responses.
          </p>
        </div>
      </section>

      {/* ── PAGE 2: KEY PROBLEMS & FINDINGS ── */}
      <section className="audit-page bg-white p-8 border-b border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Zuvigo.com AI Audit · Critical Findings
          </div>
          <div className="text-xs font-medium text-slate-500">{customerName}</div>
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">Key problems</h2>
        <p className="mt-1 text-xs text-slate-500">
          The following high-priority issues were detected and directly impact user experience and search ranking:
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {problems.map((group) => (
            <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
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
      </section>

      {/* ── PAGE 3: RECOMMENDATIONS & AI SEARCH READINESS ── */}
      <section className="audit-page bg-[#F8FAFC] p-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Zuvigo.com AI Audit · Strategic Action Plan
          </div>
          <div className="text-xs font-medium text-slate-500">{customerName}</div>
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">Show up in AI answers</h2>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-700">
          Crawler access and structured data help a site be understood in AI answers. Bot access does not guarantee inclusion in AI answers.
        </p>

        <h2 className="mt-8 text-xl font-bold tracking-tight text-slate-950">How Zuvigo.com can help</h2>
        <ul className="mt-3 max-w-xl space-y-2.5 text-xs leading-relaxed text-slate-700">
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

        {/* Section 12: Zuvigo.com Official Footer & Contact */}
        <div className="mt-12 rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-xs font-semibold text-slate-800">
            Enterprise Website Auditing by Zuvigo.com
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            For support, developer integrations, or white-label reporting, contact us at{" "}
            <span className="font-semibold text-indigo-600">hello@zuvigo.com</span> or visit{" "}
            <span className="font-semibold text-indigo-600">https://zuvigo.com</span>
          </p>
          <p className="mt-3 text-[10px] text-slate-400">
            © {new Date().getFullYear()} Zuvigo.com · All rights reserved · Target: {report.url}
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
        ? "text-emerald-600"
        : score >= 50
          ? "text-amber-600"
          : "text-red-600";

  return (
    <div className={`rounded-xl border border-slate-200 p-4 ${featured ? "bg-white shadow-xs" : "bg-white/80"}`}>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`mt-1 font-bold ${score === null ? "text-sm" : "text-3xl"} ${tone}`}>
        {scoreText(score)}
      </div>
    </div>
  );
}
