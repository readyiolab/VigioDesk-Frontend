const SCAN_STEP_TITLES: Record<string, string> = {
  validating: "Checking the address",
  crawling: "Reading public pages",
  analyzing_seo: "Reviewing SEO",
  analyzing_ai_search: "Checking AI-search readiness",
  testing_mobile: "Measuring mobile performance",
  testing_desktop: "Measuring desktop performance",
  scoring: "Scoring the evidence",
  generating_summary: "Writing the summary",
  saving_results: "Saving the report",
};

export function scanStepTitle(stage: string): string {
  return SCAN_STEP_TITLES[stage] ?? "Checking the address";
}

export function stageLabel(status: string, stage: string): string {
  if (status === "failed") return "The scan did not complete";
  if (status === "completed") return "Scan complete";
  return scanStepTitle(stage);
}
