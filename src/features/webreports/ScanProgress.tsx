import { Progress } from "@/components/ui/progress";
import { scanStepTitle } from "./stageLabel";
import type { WebReport } from "./types";
import { Activity, CheckCircle2, Loader2 } from "lucide-react";

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
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-8 sm:py-12">
      {/* Active Phase Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 h-44 w-44 rounded-full bg-indigo-50/60 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
              Vigodesk Deep Audit Pipeline
            </p>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {active.title}
          </h1>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">{report.url}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600" aria-live="polite">
            {active.detail}
          </p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-indigo-600" />
                Analysis progress
              </span>
              <span className="font-semibold text-slate-900">{report.progress}%</span>
            </div>
            <Progress value={report.progress} aria-label="Scan progress" className="h-2.5" />
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Execution Stepper</h2>
        <ol className="mt-6" aria-label="Audit steps">
          {STEPS.map((step, index) => {
            const state = index < current ? "done" : index === current ? "active" : "waiting";
            return (
              <li key={step.stage} className="relative flex gap-4 pb-6 last:pb-0">
                {index < STEPS.length - 1 ? (
                  <span
                    className={`absolute top-5 left-[9px] h-[calc(100%-8px)] w-0.5 ${
                      state === "done" ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                    aria-hidden
                  />
                ) : null}
                <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                  {state === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                  ) : state === "active" ? (
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                    </span>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={
                      state === "waiting"
                        ? "text-sm text-slate-400"
                        : state === "active"
                          ? "text-sm font-semibold text-indigo-900"
                          : "text-sm font-medium text-slate-700"
                    }
                  >
                    {step.title}
                    {state === "active" ? (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-indigo-600">
                        <Loader2 className="h-3 w-3 animate-spin" /> In progress
                      </span>
                    ) : null}
                    {state === "active" ? <span className="sr-only">, in progress</span> : null}
                    {state === "done" ? <span className="sr-only">, done</span> : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

