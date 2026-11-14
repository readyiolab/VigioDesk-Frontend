import { Progress } from "@/components/ui/progress";
import { scanStepTitle } from "./stageLabel";
import { siteIconUrl } from "./siteIcon";
import type { WebReport } from "./types";
import { cn } from "@/lib/utils";
import { Check, Globe, Layers } from "lucide-react";

const STEPS = [
  {
    stage: "validating",
    short: "URL",
    title: scanStepTitle("validating"),
    detail: "Confirming this is a public website that can be audited.",
  },
  {
    stage: "crawling",
    short: "Crawl",
    title: scanStepTitle("crawling"),
    detail: "Opening the site and collecting pages for this scan.",
  },
  {
    stage: "analyzing_seo",
    short: "SEO",
    title: scanStepTitle("analyzing_seo"),
    detail: "Checking titles, links, and indexability.",
  },
  {
    stage: "analyzing_ai_search",
    short: "AI",
    title: scanStepTitle("analyzing_ai_search"),
    detail: "Checking how AI crawlers can read the site.",
  },
  {
    stage: "testing_mobile",
    short: "Mobile",
    title: scanStepTitle("testing_mobile"),
    detail: "Lab measurement in a mobile browser — usually the longest step.",
  },
  {
    stage: "testing_desktop",
    short: "Desktop",
    title: scanStepTitle("testing_desktop"),
    detail: "Lab measurement in a desktop browser.",
  },
  {
    stage: "scoring",
    short: "Score",
    title: scanStepTitle("scoring"),
    detail: "Turning checks into scores. Missing sections stay out of the total.",
  },
  {
    stage: "generating_summary",
    short: "Summary",
    title: scanStepTitle("generating_summary"),
    detail: "Writing the executive summary.",
  },
  {
    stage: "saving_results",
    short: "Save",
    title: scanStepTitle("saving_results"),
    detail: "Saving the finished audit.",
  },
] as const;

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ScanProgress({ report }: { report: WebReport }) {
  const found = STEPS.findIndex((step) => step.stage === report.stage);
  const current = found === -1 ? 0 : found;
  const active = STEPS[current];
  const host = hostnameOf(report.url);
  const favicon = siteIconUrl(host, 64);
  const queued = report.status === "queued";
  const pct = Math.max(0, Math.min(100, report.progress ?? 0));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={favicon}
                alt=""
                className="size-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <Globe className="size-5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                  {host}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    queued
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  )}
                >
                  {!queued ? (
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-blue-600" />
                    </span>
                  ) : null}
                  {queued ? "Queued" : "Scanning"}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">{report.url}</p>
            </div>
          </div>
          {report.pagesCrawled > 0 ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              <Layers className="size-3.5" />
              {report.pagesCrawled} page{report.pagesCrawled === 1 ? "" : "s"} found
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="text-5xl font-black tabular-nums tracking-tight text-slate-950 sm:text-6xl">
            {pct}
            <span className="text-2xl font-bold text-slate-400">%</span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-900" aria-live="polite">
            {active.title}
          </p>
          <p className="mt-1 max-w-md text-sm text-slate-500">{active.detail}</p>
        </div>

        <div className="mt-6">
          <Progress value={pct} aria-label="Scan progress" className="h-2.5 bg-slate-100 [&>div]:bg-blue-600" />
        </div>

        {/* Horizontal stage rail */}
        <ol
          className="mt-8 flex items-start justify-between gap-1 overflow-x-auto pb-1"
          aria-label="Audit steps"
        >
          {STEPS.map((step, index) => {
            const state = index < current ? "done" : index === current ? "active" : "waiting";
            return (
              <li key={step.stage} className="relative flex min-w-[3.25rem] flex-1 flex-col items-center">
                {index < STEPS.length - 1 ? (
                  <span
                    className={cn(
                      "absolute left-[calc(50%+10px)] right-[calc(-50%+10px)] top-[9px] h-0.5",
                      state === "done" ? "bg-blue-600" : "bg-slate-200"
                    )}
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 flex size-[18px] items-center justify-center rounded-full border-2",
                    state === "done" && "border-blue-600 bg-blue-600 text-white",
                    state === "active" && "border-blue-600 bg-white ring-4 ring-blue-100",
                    state === "waiting" && "border-slate-300 bg-white"
                  )}
                >
                  {state === "done" ? <Check className="size-2.5 stroke-[3]" /> : null}
                  {state === "active" ? (
                    <span className="size-2 animate-pulse rounded-full bg-blue-600" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "mt-2 text-center text-[10px] font-semibold leading-tight",
                    state === "active" && "text-blue-700",
                    state === "done" && "text-slate-700",
                    state === "waiting" && "text-slate-400"
                  )}
                >
                  {step.short}
                </span>
                {state === "active" ? <span className="sr-only">, in progress</span> : null}
                {state === "done" ? <span className="sr-only">, done</span> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
