import type { ReactNode } from "react";
import type { DevicePerformance, VitalRating, WebReport } from "./types";
import { stageLabel } from "./stageLabel";

const RATING_LABEL: Record<VitalRating, string> = {
  good: "Good",
  "needs-improvement": "Needs improvement",
  poor: "Poor",
  unavailable: "Unavailable",
};

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function ScoreRing({ score, label }: { score: number | null; label: string }) {
  const value = score ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = score === null ? 0 : (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="h-28 w-28 motion-reduce:transition-none" role="img" aria-label={`${label} score ${score === null ? "unavailable" : score}`}>
        <circle cx="50" cy="50" r={radius} className="stroke-muted" strokeWidth="8" fill="none" />
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
        <text x="50" y="54" textAnchor="middle" className="fill-foreground text-xl font-semibold">
          {score === null ? "—" : score}
        </text>
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Metric({ name, value, unit, rating }: { name: string; value: number | null; unit: string; rating: VitalRating }) {
  const shown = value === null ? "Unavailable" : unit === "cls" ? value.toFixed(2) : `${Math.round(value)} ${unit}`;
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-xs text-muted-foreground">{name}</div>
      <div className="mt-1 text-lg font-semibold">{shown}</div>
      <div className="text-xs">{RATING_LABEL[rating]}</div>
    </div>
  );
}

function DevicePanel({ title, device }: { title: string; device: DevicePerformance }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby={`${title}-heading`}>
      <h3 id={`${title}-heading`} className="text-lg font-semibold">
        {title}
      </h3>
      {device.unavailableReason && device.score === null ? (
        <p className="mt-2 text-sm text-muted-foreground">{device.unavailableReason}</p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric name="LCP" value={device.lcp} unit="ms" rating={device.ratings.lcp} />
        <Metric name="INP (field)" value={device.inp} unit="ms" rating={device.ratings.inp} />
        <Metric name="TBT (lab)" value={device.tbt} unit="ms" rating="unavailable" />
        <Metric name="CLS" value={device.cls} unit="cls" rating={device.ratings.cls} />
        <Metric name="FCP" value={device.fcp} unit="ms" rating="unavailable" />
        <Metric name="TTFB" value={device.ttfb} unit="ms" rating="unavailable" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        INP is field data when CrUX has it. TBT is a lab diagnostic and is not a measured INP value.
      </p>
      {device.issues.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm">
          {device.issues.slice(0, 4).map((issue) => (
            <li key={issue.id}>
              {issue.title}
              {issue.displayValue ? ` (${issue.displayValue})` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function ReportDashboard({
  report,
  publicView,
  actions,
}: {
  report: WebReport;
  publicView?: boolean;
  actions?: ReactNode;
}) {
  const findings = report.seo.checks.filter((check) => check.status === "present");
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <section className="rounded-3xl border border-border bg-card p-6">
        <p className="truncate text-sm text-muted-foreground">{report.url}</p>
        <div className="mt-4 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h1 className="text-2xl font-semibold tracking-tight">
              {report.summary.headline || stageLabel(report.status, report.stage)}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {report.summary.text || "The scan is still collecting evidence."}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {report.scannedAt ? `Completed ${new Date(report.scannedAt).toLocaleString()}` : `Status ${report.status}`}
              {` · ${report.pagesCrawled} pages`}
            </p>
          </div>
          <ScoreRing score={report.scores.overall} label="Overall" />
        </div>
        {!report.completeness.complete ? (
          <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
            Incomplete measurement: {report.completeness.unavailableSections.join(", ") || "some sections"}. Unavailable
            scores are omitted, not treated as zero.
          </p>
        ) : null}
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Category scores">
        <ScoreCard label="Mobile" score={report.scores.mobile} />
        <ScoreCard label="Desktop" score={report.scores.desktop} />
        <ScoreCard label="SEO" score={report.scores.seo} />
        <ScoreCard label="AI Search" score={report.scores.aiSearch} />
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Performance">
        <DevicePanel title="Mobile" device={report.performance.mobile} />
        <DevicePanel title="Desktop" device={report.performance.desktop} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby="seo-heading">
        <h2 id="seo-heading" className="text-lg font-semibold">
          SEO health
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{findings.length} findings need attention.</p>
        <ul className="mt-4 space-y-2">
          {report.seo.checks
            .filter((check) => check.status !== "absent")
            .map((check) => (
              <li key={check.id} className="rounded-xl border border-border p-3">
                <details>
                  <summary className="cursor-pointer font-medium">
                    <span className="mr-2 rounded-full border border-border px-2 py-0.5 text-xs">{check.severity}</span>
                    {check.title}
                    <span className="ml-2 text-xs text-muted-foreground">{check.affectedCount}</span>
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{check.description}</p>
                  <p className="mt-2 text-sm">{check.fix}</p>
                </details>
              </li>
            ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby="ai-heading">
        <h2 id="ai-heading" className="text-lg font-semibold">
          AI search readiness
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bot access does not guarantee inclusion in AI answers.
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {Object.entries(report.aiSearch.botAccess).map(([bot, access]) => (
            <div key={bot} className="flex justify-between rounded-lg border border-border px-3 py-2">
              <dt>{bot}</dt>
              <dd>{access}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm">
          llms.txt: {report.aiSearch.llmsTxt.status}. JavaScript text ratio:{" "}
          {report.aiSearch.jsDependency.rawVsRenderedRatio === null
            ? "unavailable"
            : report.aiSearch.jsDependency.rawVsRenderedRatio.toFixed(2)}{" "}
          ({report.aiSearch.jsDependency.status}).
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby="fixes-heading">
        <h2 id="fixes-heading" className="text-lg font-semibold">
          Top fixes
        </h2>
        <ol className="mt-4 space-y-3">
          {report.topFixes.map((fix) => (
            <li key={fix.rank} className="rounded-xl border border-border p-3">
              <div className="font-medium">
                {fix.rank}. {fix.title}
              </div>
              <p className="text-xs text-muted-foreground">
                Impact {fix.impact} · Effort {fix.effort} · {fix.scope}
              </p>
              <p className="mt-2 text-sm">{fix.why}</p>
              <p className="mt-2 text-sm">{fix.instructions}</p>
              {fix.snippet ? (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">{fix.snippet}</pre>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {report.status === "failed" && report.error ? (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {report.error.message}
        </p>
      ) : null}

      {!publicView && actions ? <section aria-label="Report actions">{actions}</section> : null}
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${scoreColor(score)}`}>{score === null ? "Unavailable" : score}</div>
    </div>
  );
}
