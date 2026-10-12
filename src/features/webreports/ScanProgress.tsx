import { Progress } from "@/components/ui/progress";
import { scanStepTitle } from "./stageLabel";
import type { WebReport } from "./types";

const STEPS = [
  {
    stage: "validating",
    title: scanStepTitle("validating"),
    detail: "Confirming this is a public website that can be audited.",
  },
  {
    stage: "crawling",
    title: scanStepTitle("crawling"),
    detail: "Opening the site and collecting the pages in this scan.",
  },
  {
    stage: "analyzing_seo",
    title: scanStepTitle("analyzing_seo"),
    detail: "Checking titles, links, and whether pages can be indexed.",
  },
  {
    stage: "analyzing_ai_search",
    title: scanStepTitle("analyzing_ai_search"),
    detail: "Seeing how AI crawlers are allowed to read the site.",
  },
  {
    stage: "testing_mobile",
    title: scanStepTitle("testing_mobile"),
    detail: "A browser measurement is in progress. This step usually takes the longest.",
  },
  {
    stage: "testing_desktop",
    title: scanStepTitle("testing_desktop"),
    detail: "A browser measurement is in progress. This step usually takes the longest.",
  },
  {
    stage: "scoring",
    title: scanStepTitle("scoring"),
    detail: "Turning the checks into scores. Missing measurements stay out of the total.",
  },
  {
    stage: "generating_summary",
    title: scanStepTitle("generating_summary"),
    detail: "Summarizing what matters most on this site.",
  },
  {
    stage: "saving_results",
    title: scanStepTitle("saving_results"),
    detail: "Storing the finished audit so you can open it again.",
  },
] as const;

export function ScanProgress({ report }: { report: WebReport }) {
  const found = STEPS.findIndex((step) => step.stage === report.stage);
  const current = found === -1 ? 0 : found;
  const active = STEPS[current];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col py-6 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Website audit</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{active.title}</h1>
      <p className="mt-2 truncate text-sm text-muted-foreground">{report.url}</p>
      <p className="mt-4 text-sm leading-6 text-muted-foreground" aria-live="polite">
        {active.detail}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Analysis progress</span>
          <span>{report.progress}%</span>
        </div>
        <Progress value={report.progress} aria-label="Scan progress" />
      </div>

      <ol className="mt-8" aria-label="Audit steps">
        {STEPS.map((step, index) => {
          const state = index < current ? "done" : index === current ? "active" : "waiting";
          return (
            <li key={step.stage} className="relative flex gap-3 pb-5 last:pb-0">
              {index < STEPS.length - 1 ? (
                <span className="absolute top-3 left-[7px] h-[calc(100%-4px)] w-px bg-border" aria-hidden />
              ) : null}
              <span
                className={
                  state === "waiting"
                    ? "relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border border-border bg-background"
                    : state === "active"
                      ? "relative z-10 mt-1 h-4 w-4 shrink-0 animate-pulse rounded-full bg-primary ring-4 ring-primary/20"
                      : "relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full bg-primary"
                }
                aria-hidden
              />
              <div className="min-w-0">
                <p className={state === "waiting" ? "text-sm text-muted-foreground" : "text-sm font-medium"}>
                  {step.title}
                  {state === "active" ? <span className="sr-only">, in progress</span> : null}
                  {state === "done" ? <span className="sr-only">, done</span> : null}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

    </div>
  );
}
