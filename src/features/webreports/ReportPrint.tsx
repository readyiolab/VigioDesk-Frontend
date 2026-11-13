import type { AuditCheck, WebReport } from "./types";
import { categoryHealth, issueDistribution, isFinding, letterGrade } from "./reportNarrative";

function scoreText(score: number | null): string {
  return score === null ? "—" : String(score);
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function severityLabel(severity: AuditCheck["severity"]) {
  if (severity === "critical") return "Error";
  if (severity === "warning") return "Warning";
  if (severity === "info") return "Notice";
  return "Passed";
}

export function ReportPrint({ report }: { report: WebReport }) {
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
  const grade = letterGrade(report.scores.overall);

  const allChecks = [...report.seo.checks, ...report.aiSearch.checks];
  const dist = issueDistribution(allChecks);
  const categories = categoryHealth(allChecks);
  const findings = allChecks
    .filter(isFinding)
    .sort((a, b) => {
      const rank = { critical: 0, warning: 1, info: 2, pass: 3 } as const;
      return rank[a.severity] - rank[b.severity] || b.affectedCount - a.affectedCount;
    });

  return (
    <article hidden className="audit-print font-sans text-slate-900 print:block">
      <section className="audit-page border-b border-slate-200 bg-white p-10">
        <div className="flex items-center justify-between border-b border-slate-900 pb-5">
          <div>
            <div className="text-lg font-black tracking-tight">
              Zuvigo<span className="text-indigo-600">.com</span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Site audit report
            </p>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-sm font-bold">{customerName}</div>
              <p className="font-mono text-[11px] text-slate-500">{domain}</p>
            </div>
            <img
              src={customerLogo || fallbackFavicon}
              alt=""
              className="h-10 w-10 rounded-lg border border-slate-200 object-contain"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        <div className="mt-6 flex items-start justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold tracking-tight">
              {report.summary.headline || "Website audit"}
            </h1>
            {report.summary.text ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{report.summary.text}</p>
            ) : null}
            <p className="mt-2 font-mono text-xs text-slate-600">{report.url}</p>
            <p className="mt-2 text-xs text-slate-500">
              {when} · {report.pagesCrawled} pages analyzed
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black tabular-nums text-slate-950">
              {scoreText(report.scores.overall)}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Grade {grade.grade} · {grade.label}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {(
            [
              ["Overall", report.scores.overall],
              ["Mobile", report.scores.mobile],
              ["Desktop", report.scores.desktop],
              ["SEO", report.scores.seo],
              ["AI", report.scores.aiSearch],
            ] as const
          ).map(([label, score]) => (
            <div key={label} className="rounded-lg border border-slate-200 px-2 py-2 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
              <div className="text-lg font-bold tabular-nums">{scoreText(score)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
          <span className="text-red-700">{dist.errors} errors</span>
          <span className="text-amber-700">{dist.warnings} warnings</span>
          <span className="text-sky-700">{dist.notices} notices</span>
          <span className="text-emerald-700">{dist.passed} passed</span>
        </div>

        {categories.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Category health
            </h2>
            <table className="mt-2 w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-500">
                  <th className="py-1.5 pr-2">Category</th>
                  <th className="py-1.5 pr-2">Pass %</th>
                  <th className="py-1.5 pr-2">Err</th>
                  <th className="py-1.5 pr-2">Warn</th>
                  <th className="py-1.5">OK</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.category} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2 font-medium capitalize">{c.category}</td>
                    <td className="py-1.5 pr-2 tabular-nums">{c.passRate}%</td>
                    <td className="py-1.5 pr-2 tabular-nums">{c.errors}</td>
                    <td className="py-1.5 pr-2 tabular-nums">{c.warnings}</td>
                    <td className="py-1.5 tabular-nums">{c.passed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="audit-page bg-white p-10">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Core Web Vitals</h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {(
            [
              ["Mobile", report.performance.mobile],
              ["Desktop", report.performance.desktop],
            ] as const
          ).map(([label, device]) => (
            <div key={label} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{label}</span>
                <span className="tabular-nums">{scoreText(device.score)}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-slate-500">LCP</div>
                  <div className="font-semibold tabular-nums">
                    {device.lcp == null ? "—" : `${Math.round(device.lcp)} ms`}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">CLS</div>
                  <div className="font-semibold tabular-nums">
                    {device.cls == null ? "—" : device.cls.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">INP</div>
                  <div className="font-semibold tabular-nums">
                    {device.inp == null ? "—" : `${Math.round(device.inp)} ms`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-slate-500">Top issues</h2>
        <table className="mt-3 w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-300 text-[10px] uppercase tracking-wide text-slate-500">
              <th className="py-1.5 pr-2">Severity</th>
              <th className="py-1.5 pr-2">Issue</th>
              <th className="py-1.5 pr-2">Category</th>
              <th className="py-1.5 pr-2">Pages</th>
              <th className="py-1.5">Fix</th>
            </tr>
          </thead>
          <tbody>
            {findings.slice(0, 20).map((c) => (
              <tr key={c.id} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2 font-semibold">{severityLabel(c.severity)}</td>
                <td className="py-2 pr-2 font-medium text-slate-900">{c.title}</td>
                <td className="py-2 pr-2 capitalize text-slate-600">{c.category || "—"}</td>
                <td className="py-2 pr-2 tabular-nums">{c.affectedCount || "—"}</td>
                <td className="py-2 text-slate-600">{c.fix || "—"}</td>
              </tr>
            ))}
            {findings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No issues found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-slate-500">
          Priority fixes
        </h2>
        <ol className="mt-3 space-y-2">
          {report.topFixes.slice(0, 8).map((fix) => (
            <li key={fix.rank} className="text-xs">
              <span className="font-bold text-slate-900">
                {fix.rank}. {fix.title}
              </span>
              <span className="text-slate-500">
                {" "}
                — {fix.impact} impact · {fix.effort} effort
              </span>
              {fix.why ? <p className="mt-0.5 text-slate-600">{fix.why}</p> : null}
              {fix.instructions ? (
                <p className="mt-0.5 text-slate-600">{fix.instructions}</p>
              ) : null}
            </li>
          ))}
          {report.topFixes.length === 0 ? (
            <li className="text-xs text-slate-500">No prioritized fixes.</li>
          ) : null}
        </ol>

        <p className="mt-10 border-t border-slate-200 pt-3 text-[10px] text-slate-400">
          Generated by Zuvigo Web Reports · Scoring {report.scoringVersion}
        </p>
      </section>
    </article>
  );
}
