import { Button } from "@/components/ui/button";
import type { DevicePerformance, VitalRating, WebReport } from "./types";
import { stageLabel } from "./stageLabel";
import { keyProblems, rateDuration } from "./reportNarrative";
import { ReportPrint } from "./ReportPrint";

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

export function ScoreRing({ score, label }: { score: number | null; label: string }) {
  const value = score ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = score === null ? 0 : (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="h-28 w-28" role="img" aria-label={`${label} score ${score === null ? "not measured" : score}`}>
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
        <text x="50" y="54" textAnchor="middle" className="fill-slate-950 text-xl font-semibold">
          {score === null ? "—" : score}
        </text>
      </svg>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}

function Metric({ name, value, unit, rating }: { name: string; value: number | null; unit: string; rating: VitalRating }) {
  const shown = value === null ? (name.startsWith("INP") ? "Unavailable" : "Not measured") : unit === "cls" ? value.toFixed(2) : `${Math.round(value)} ${unit}`;
  const label = value === null || rating === "unavailable" ? null : RATING_LABEL[rating];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{name}</div>
      <div className="mt-1 text-lg font-semibold text-slate-950">{shown}</div>
      {label ? <div className="text-xs text-slate-600">{label}</div> : null}
      {name.startsWith("INP") && value === null ? <div className="text-xs text-slate-500">Field data missing</div> : null}
    </div>
  );
}

function DevicePanel({ title, device }: { title: string; device: DevicePerformance }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-labelledby={`${title}-vitals`}>
      <h3 id={`${title}-vitals`} className="text-lg font-semibold text-slate-950">
        {title}
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric name="LCP" value={device.lcp} unit="ms" rating={device.ratings.lcp} />
        <Metric name="INP (field)" value={device.inp} unit="ms" rating={device.ratings.inp} />
        <Metric name="TBT (lab)" value={device.tbt} unit="ms" rating={rateDuration(device.tbt, 200, 600)} />
        <Metric name="CLS" value={device.cls} unit="cls" rating={device.ratings.cls} />
        <Metric name="FCP" value={device.fcp} unit="ms" rating={rateDuration(device.fcp, 1800, 3000)} />
        <Metric name="TTFB" value={device.ttfb} unit="ms" rating={rateDuration(device.ttfb, 800, 1800)} />
      </div>
      <p className="mt-3 text-xs text-slate-500">
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
  return (
    <>
      <div className="audit-screen mx-auto flex max-w-5xl flex-col gap-8 bg-[#F7F9FC] px-4 py-8 text-slate-900 print:hidden">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Readyio · WebReports</p>
          <div className="mt-4 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {report.summary.headline || stageLabel(report.status, report.stage)}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {report.summary.text || "The scan is still collecting evidence."}
              </p>
              <p className="mt-3 truncate text-sm text-slate-500">{report.url}</p>
              <p className="mt-1 text-xs text-slate-500">
                {report.scannedAt ? `Completed ${new Date(report.scannedAt).toLocaleString()}` : `Status ${report.status}`}
                {` · ${report.pagesCrawled} pages`}
              </p>
            </div>
            <ScoreRing score={report.scores.overall} label="Overall" />
          </div>
          {!report.completeness.complete ? (
            <p className="mt-4 text-sm text-amber-800">
              Incomplete measurement: {report.completeness.unavailableSections.join(", ") || "some sections"}. Unavailable
              scores are omitted, not treated as zero.
            </p>
          ) : null}
          {finished && publicView ? (
            <Button type="button" className="mt-5" onClick={() => window.print()}>
              Download PDF
            </Button>
          ) : null}
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Category scores">
          <ScoreCard label="Mobile" score={report.scores.mobile} />
          <ScoreCard label="Desktop" score={report.scores.desktop} />
          <ScoreCard label="SEO" score={report.scores.seo} />
          <ScoreCard label="AI Search" score={report.scores.aiSearch} />
        </section>

        <section aria-labelledby="problems-heading">
          <h2 id="problems-heading" className="text-xl font-semibold tracking-tight">
            Key problems
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {problems.map((group) => (
              <article key={group.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-950">{group.title}</h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                  {group.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {report.topFixes.length > 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-labelledby="fixes-heading">
            <h2 id="fixes-heading" className="text-lg font-semibold">
              Do these first
            </h2>
            <ol className="mt-3 space-y-3">
              {report.topFixes.map((fix) => (
                <li key={fix.rank}>
                  <div className="font-medium text-slate-950">
                    {fix.rank}. {fix.title}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{fix.why}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="ai-note">
          <h2 id="ai-note" className="text-lg font-semibold">
            Show up in AI answers
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Crawler access and structured data help a site be understood in AI answers. They do not guarantee inclusion.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Bot access does not guarantee inclusion in AI answers.</p>
        </section>

        <section className="rounded-3xl bg-slate-950 p-6 text-white" aria-labelledby="readyio-help">
          <h2 id="readyio-help" className="text-lg font-semibold">
            How Readyio can help
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
            <li>Rerun this audit after the fixes so the next score sits beside this one.</li>
            <li>Share the report with the people who will change the site.</li>
            <li>Use the same scan again when the mobile speed or structured data changes.</li>
          </ul>
        </section>

        <section className="grid gap-4 md:grid-cols-2" aria-label="Performance">
          <DevicePanel title="Mobile vitals" device={report.performance.mobile} />
          <DevicePanel title="Desktop vitals" device={report.performance.desktop} />
        </section>

        {report.status === "failed" && report.error ? (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            {report.error.message}
          </p>
        ) : null}

      </div>
      {finished ? <ReportPrint report={report} problems={problems} /> : null}
    </>
  );
}

function ScoreCard({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 font-semibold ${score === null ? "text-base text-slate-400" : `text-3xl ${scoreColor(score)}`}`}>
        {score === null ? "Not measured" : score}
      </div>
    </div>
  );
}
