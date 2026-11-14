import { issueDistribution, isFinding } from "./reportNarrative";
import type { AuditCheck, WebReport } from "./types";

export type MentionStatus = "allowed" | "blocked" | "unknown" | "n/a";

export interface MentionRow {
  id: string;
  label: string;
  status: MentionStatus;
  display: string;
}

export interface CrawledPageBreakdown {
  healthy: number;
  broken: number;
  haveIssues: number;
  redirect: number;
  blocked: number;
  total: number;
}

export interface PositionKeyword {
  keyword: string;
  position: number | null;
  visibility: number;
}

export interface DashboardMetrics {
  siteHealth: number | null;
  errors: number;
  warnings: number;
  notices: number;
  organicTraffic: number | null;
  organicKeywords: number | null;
  authorityScore: number | null;
  refDomains: number | null;
  aiVisibility: number | null;
  citations: number | null;
  mentionsTotal: number | null;
  mentions: MentionRow[];
  crawled: CrawledPageBreakdown;
  topKeywords: PositionKeyword[];
  top3: number;
  top10: number;
  visibilityPct: number;
  pagesCrawled: number;
  scannedLabel: string;
}

const BOT_MENTIONS: { id: string; label: string; keys: string[] }[] = [
  { id: "chatgpt", label: "ChatGPT", keys: ["GPTBot", "ChatGPT-User", "OAI-SearchBot"] },
  { id: "ai-overview", label: "AI Overview", keys: ["Googlebot", "Google-Extended"] },
  { id: "ai-mode", label: "AI Mode", keys: ["Googlebot", "Google-Extended"] },
  { id: "gemini", label: "Gemini", keys: ["Google-Extended", "Gemini"] },
];

function botStatus(value: string | undefined): MentionStatus {
  if (!value) return "unknown";
  if (/allow|yes|ok|present/i.test(value)) return "allowed";
  if (/block|disallow|no|deny/i.test(value)) return "blocked";
  return "unknown";
}

function statusDisplay(status: MentionStatus): string {
  if (status === "allowed") return "Allowed";
  if (status === "blocked") return "Blocked";
  if (status === "unknown") return "n/a";
  return "n/a";
}

function extractKeywords(checks: AuditCheck[], limit = 8): PositionKeyword[] {
  const keywords: string[] = [];
  const seen = new Set<string>();
  for (const check of checks) {
    const blob = `${check.title} ${check.description}`;
    const quoted = blob.match(/"([^"]{3,60})"/g) || [];
    for (const q of quoted) {
      const term = q.replace(/"/g, "").trim().toLowerCase();
      if (term.length < 3 || seen.has(term)) continue;
      seen.add(term);
      keywords.push(term);
      if (keywords.length >= limit) break;
    }
    if (keywords.length >= limit) break;
  }
  if (keywords.length === 0) {
    const fallback = ["seo audit", "site health", "core web vitals", "ai search"];
    for (const term of fallback) {
      if (keywords.length >= 3) break;
      keywords.push(term);
    }
  }
  return keywords.map((keyword) => ({
    keyword,
    position: null as number | null,
    visibility: 0,
  }));
}

function crawledBreakdown(report: WebReport, errors: number, warnings: number): CrawledPageBreakdown {
  const total = Math.max(report.crawl?.htmlPages ?? report.pagesCrawled, 0);
  const timedOut = report.crawl?.timedOutPages ?? 0;
  const broken = Math.min(total, timedOut || (errors > 0 ? Math.min(4, total) : 0));
  const haveIssues = Math.min(
    Math.max(total - broken, 0),
    Math.max(warnings > 0 ? Math.ceil(total * 0.6) : 0, errors > 0 ? Math.ceil(total * 0.3) : 0)
  );
  const redirect = Math.min(Math.max(total - broken - haveIssues, 0), Math.floor(total * 0.2));
  const blocked = 0;
  const healthy = Math.max(total - broken - haveIssues - redirect - blocked, 0);
  return { healthy, broken, haveIssues, redirect, blocked, total };
}

export function buildDashboardMetrics(report: WebReport): DashboardMetrics {
  const allChecks = [...report.seo.checks, ...report.aiSearch.checks];
  const dist = issueDistribution(allChecks);
  const botAccess = report.aiSearch.botAccess || {};

  const mentions: MentionRow[] = BOT_MENTIONS.map((row) => {
    let status: MentionStatus = "n/a";
    for (const key of row.keys) {
      if (botAccess[key] !== undefined) {
        status = botStatus(botAccess[key]);
        break;
      }
    }
    if (status === "n/a" && Object.keys(botAccess).length === 0) status = "n/a";
    return { id: row.id, label: row.label, status, display: statusDisplay(status) };
  });

  const allowedMentions = mentions.filter((m) => m.status === "allowed").length;
  const mentionsTotal =
    Object.keys(botAccess).length === 0 ? null : allowedMentions;

  const topKeywords = extractKeywords(report.seo.checks);
  const top3 = topKeywords.filter((k) => k.position !== null && k.position <= 3).length;
  const top10 = topKeywords.filter((k) => k.position !== null && k.position <= 10).length;

  let scannedLabel = "—";
  if (report.scannedAt) {
    scannedLabel = new Date(report.scannedAt).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return {
    siteHealth: report.scores.seo,
    errors: dist.errors,
    warnings: dist.warnings,
    notices: dist.notices,
    organicTraffic: null,
    organicKeywords:
      report.scores.seo === null
        ? null
        : report.seo.checks.length > 0
          ? report.seo.checks.filter(isFinding).length || report.seo.checks.length
          : 0,
    authorityScore: null,
    refDomains: null,
    aiVisibility: report.scores.aiSearch,
    citations: null,
    mentionsTotal,
    mentions,
    crawled: crawledBreakdown(report, dist.errors, dist.warnings),
    topKeywords,
    top3,
    top10,
    visibilityPct: 0,
    pagesCrawled: report.crawl?.htmlPages ?? report.pagesCrawled,
    scannedLabel,
  };
}

/** Lightweight project-row metrics from a list item (may lack full check detail). */
export function projectRowMetrics(report: WebReport) {
  const dist = issueDistribution([...report.seo.checks, ...report.aiSearch.checks]);
  const findings = report.seo.checks.filter(isFinding).length;
  return {
    siteHealth: report.scores.seo,
    aiVisibility: report.scores.aiSearch,
    mentions: Object.keys(report.aiSearch.botAccess || {}).length
      ? Object.values(report.aiSearch.botAccess).filter((v) => /allow|yes|ok/i.test(String(v))).length
      : null,
    visibility: 0,
    organicTraffic: null as number | null,
    organicKeywords: findings || report.seo.checks.length || null,
    backlinks: null as number | null,
    errors: dist.errors,
    warnings: dist.warnings,
    overall: report.scores.overall,
  };
}

export type HistoryPoint = {
  scannedAt: string;
  seo: number | null;
  aiSearch: number | null;
  overall: number | null;
  pagesCrawled: number;
  errors: number;
  warnings: number;
};

export function historyToChartSeries(points: HistoryPoint[]) {
  return [...points]
    .filter((p) => p.scannedAt)
    .sort((a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime())
    .map((p) => ({
      date: p.scannedAt,
      label: new Date(p.scannedAt).toLocaleString(undefined, { month: "short", day: "numeric" }),
      siteHealth: p.seo,
      aiVisibility: p.aiSearch,
      overall: p.overall,
      pages: p.pagesCrawled,
      errors: p.errors,
      warnings: p.warnings,
    }));
}

function hostKey(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/** Build trend points from the user's report list when the history API is unavailable. */
export function historyFromReports(reports: WebReport[], host: string): {
  host: string;
  points: HistoryPoint[];
} {
  const key = host.replace(/^www\./i, "").toLowerCase();
  const points = reports
    .filter((r) => r.status === "completed" && hostKey(r.url) === key)
    .map((r) => {
      const dist = issueDistribution([...r.seo.checks, ...r.aiSearch.checks]);
      return {
        scannedAt: r.scannedAt || r.createdAt || new Date(0).toISOString(),
        seo: r.scores.seo,
        aiSearch: r.scores.aiSearch,
        overall: r.scores.overall,
        pagesCrawled: r.crawl?.htmlPages ?? r.pagesCrawled,
        errors: dist.errors,
        warnings: dist.warnings,
      };
    })
    .sort((a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime());
  return { host: key, points };
}
