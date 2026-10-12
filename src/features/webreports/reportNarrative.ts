import type { DevicePerformance, VitalRating, WebReport } from "./types";

export interface ProblemGroup {
  title: string;
  lines: string[];
}

export function keyProblems(report: WebReport): ProblemGroup[] {
  return [
    { title: "Mobile", lines: deviceProblems("Mobile", report.performance.mobile) },
    { title: "Desktop", lines: deviceProblems("Desktop", report.performance.desktop) },
    { title: "SEO", lines: seoProblems(report) },
    { title: "AI search", lines: aiProblems(report) },
  ];
}

export function rateDuration(ms: number | null, good: number, needsImprovement: number): VitalRating {
  if (ms === null || !Number.isFinite(ms)) return "unavailable";
  if (ms <= good) return "good";
  if (ms <= needsImprovement) return "needs-improvement";
  return "poor";
}

function deviceProblems(name: string, device: DevicePerformance): string[] {
  if (device.score === null && device.unavailableReason) return [device.unavailableReason];
  const lines: string[] = [];
  if (device.lcp !== null && device.lcp > 2500) {
    lines.push(`Largest paint is ${Math.round(device.lcp)} ms. The main content is slow to appear.`);
  }
  if (device.tbt !== null && device.tbt > 200) {
    lines.push(`Main-thread work is ${Math.round(device.tbt)} ms. Taps can feel late. This is a lab signal, not field INP.`);
  }
  if (device.cls !== null && device.cls > 0.1) {
    lines.push(`Layout shift is ${device.cls.toFixed(2)}. Content moves while the page loads.`);
  }
  for (const issue of device.issues.slice(0, 2)) {
    lines.push(issue.displayValue ? `${issue.title} (${issue.displayValue})` : issue.title);
  }
  if (lines.length === 0) {
    lines.push(
      device.score === null ? `${name} performance was not measured.` : `${name} looks healthy on this scan.`
    );
  }
  return lines.slice(0, 4);
}

function seoProblems(report: WebReport): string[] {
  const present = report.seo.checks.filter((check) => check.status === "present");
  const notMeasured =
    report.scores.seo === null ||
    report.completeness.unavailableSections.includes("seo") ||
    (report.seo.checks.length > 0 && present.length === 0 && report.seo.checks.every((check) => check.status !== "absent"));
  if (present.length === 0 && notMeasured) return ["SEO was not measured on this scan."];
  if (present.length === 0) return ["No SEO problems stood out in this scan."];
  return present.slice(0, 4).map((check) => check.title);
}

function aiProblems(report: WebReport): string[] {
  const present = report.aiSearch.checks.filter((check) => check.status === "present");
  if (present.length > 0) return present.slice(0, 3).map((check) => check.title);
  if (report.scores.aiSearch === null || report.completeness.unavailableSections.includes("ai-search")) {
    return ["AI search was not measured on this scan."];
  }
  return ["No AI-search problems stood out in this scan."];
}
