export type ReportStatus = "queued" | "running" | "completed" | "failed";
export type CheckStatus = "present" | "absent" | "unavailable" | "inconclusive";
export type VitalRating = "good" | "needs-improvement" | "poor" | "unavailable";

export interface AuditCheck {
  id: string;
  category: string;
  status: CheckStatus;
  severity: "critical" | "warning" | "info" | "pass";
  title: string;
  description: string;
  affectedCount: number;
  affectedUrls: string[];
  fix: string;
  impact: "high" | "medium" | "low";
  effort: "easy" | "medium" | "hard";
}

export interface DevicePerformance {
  score: number | null;
  lcp: number | null;
  inp: number | null;
  tbt: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  bytes: number | null;
  ratings: { lcp: VitalRating; inp: VitalRating; cls: VitalRating };
  field: {
    lcp?: { percentile: number | null; category: string | null };
    inp?: { percentile: number | null; category: string | null };
    cls?: { percentile: number | null; category: string | null };
  };
  issues: { id: string; title: string; displayValue?: string }[];
  unavailableReason: string | null;
  pageUrl: string | null;
}

export interface Recommendation {
  rank: number;
  title: string;
  impact: string;
  effort: string;
  why: string;
  scope: string;
  instructions: string;
  snippet?: string;
  checkIds: string[];
}

export interface WebReport {
  contractVersion: number;
  id?: string;
  url: string;
  status: ReportStatus;
  stage: string;
  progress: number;
  scannedAt: string | null;
  createdAt?: string;
  pagesCrawled: number;
  completeness: { complete: boolean; unavailableSections: string[] };
  scores: {
    overall: number | null;
    mobile: number | null;
    desktop: number | null;
    seo: number | null;
    aiSearch: number | null;
  };
  scoringVersion: string;
  summary: { headline: string | null; text: string | null };
  performance: { mobile: DevicePerformance; desktop: DevicePerformance };
  seo: { checks: AuditCheck[] };
  aiSearch: {
    botAccess: Record<string, string>;
    llmsTxt: { present: boolean; status: string };
    jsDependency: { rawVsRenderedRatio: number | null; status: CheckStatus };
    checks: AuditCheck[];
  };
  topFixes: Recommendation[];
  shareToken?: string | null;
  error: { message: string } | null;
  cached?: boolean;
}

export interface ReportListResponse {
  reports: WebReport[];
  pagination: { limit: number; offset: number; total: number };
}
