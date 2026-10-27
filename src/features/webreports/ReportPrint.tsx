import type { ProblemGroup } from "./reportNarrative";
import type { WebReport } from "./types";

function scoreText(score: number | null): string {
  return score === null ? "Not measured" : String(score);
}

export function ReportPrint({ report, problems }: { report: WebReport; problems: ProblemGroup[] }) {
  const when = report.scannedAt ? new Date(report.scannedAt).toLocaleString() : "In progress";
  return (
    <article hidden className="audit-print text-slate-900">
      <section className="audit-page bg-[#F7F9FC] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Vigodesk · WebReports</p>
        <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-slate-950">
          {report.summary.headline || "Website audit"}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          {report.summary.text || "This scan finished with the measurements below."}
        </p>
        <p className="mt-4 truncate text-sm text-slate-500">{report.url}</p>
        <p className="mt-1 text-xs text-slate-500">
          {when} · {report.pagesCrawled} {report.pagesCrawled === 1 ? "page" : "pages"}
        </p>
        <div className="mt-8 grid grid-cols-5 gap-3">
          <ScoreTile label="Overall" score={report.scores.overall} featured />
          <ScoreTile label="Mobile" score={report.scores.mobile} />
          <ScoreTile label="Desktop" score={report.scores.desktop} />
          <ScoreTile label="SEO" score={report.scores.seo} />
          <ScoreTile label="AI search" score={report.scores.aiSearch} />
        </div>
        {!report.completeness.complete ? (
          <p className="mt-6 text-sm text-amber-800">
            Incomplete measurement: {report.completeness.unavailableSections.join(", ") || "some sections"}. Missing
            scores are left out. They are not treated as zero.
          </p>
        ) : null}
      </section>

      <section className="audit-page bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Vigodesk · WebReports</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Key problems</h2>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {problems.map((group) => (
            <div key={group.title} className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-4">
              <h3 className="text-sm font-semibold text-slate-950">{group.title}</h3>
              <ul className="mt-2 space-y-2 text-sm leading-5 text-slate-700">
                {group.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="audit-page bg-[#F7F9FC] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Vigodesk · WebReports</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Show up in AI answers</h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-700">
          Crawler access and structured data help a site be understood in AI answers. They do not guarantee inclusion.
        </p>
        <h2 className="mt-8 text-2xl font-semibold tracking-tight">How Vigodesk can help</h2>
        <ul className="mt-4 max-w-xl space-y-3 text-sm leading-6 text-slate-700">
          <li>Rerun this audit after the fixes so the next score sits beside this one.</li>
          <li>Share the report with the people who will change the site.</li>
          <li>Use the same scan again when the mobile speed or structured data changes.</li>
        </ul>
        <p className="mt-10 text-xs text-slate-500">{report.url}</p>
      </section>
    </article>
  );
}

function ScoreTile({ label, score, featured }: { label: string; score: number | null; featured?: boolean }) {
  const tone = score === null ? "text-slate-400" : score >= 90 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 ${featured ? "bg-white" : "bg-white/80"}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 font-semibold ${score === null ? "text-sm" : "text-3xl"} ${tone}`}>{scoreText(score)}</div>
    </div>
  );
}

