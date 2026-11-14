import { describe, expect, it } from "vitest";
import { buildDashboardMetrics } from "./dashboardMetrics";
import type { WebReport } from "./types";

function baseReport(overrides: Partial<WebReport> = {}): WebReport {
  return {
    id: "rep-1",
    url: "https://apple.com/",
    status: "completed",
    stage: "completed",
    progress: 100,
    scannedAt: "2026-11-14T11:35:00.000Z",
    pagesCrawled: 1,
    crawl: {
      pagesAttempted: 1,
      htmlPages: 0,
      timedOutPages: 0,
      sitemapSeeds: 0,
      seoSource: "unavailable",
    },
    completeness: { complete: false, unavailableSections: ["seo"] },
    scores: { overall: 65, mobile: 29, desktop: 84, seo: null, aiSearch: 96 },
    scoringVersion: "1",
    summary: { headline: "Needs work", text: "SEO unavailable" },
    performance: {
      mobile: {
        score: 29,
        lcp: 10010,
        inp: null,
        tbt: null,
        cls: 0.16,
        fcp: null,
        ttfb: null,
        bytes: null,
        ratings: { lcp: "poor", inp: "unavailable", cls: "needs-improvement" },
        field: {},
        issues: [],
        unavailableReason: null,
        pageUrl: "https://apple.com/",
      },
      desktop: {
        score: 84,
        lcp: 1892,
        inp: null,
        tbt: null,
        cls: 0.05,
        fcp: null,
        ttfb: null,
        bytes: null,
        ratings: { lcp: "good", inp: "unavailable", cls: "good" },
        field: {},
        issues: [],
        unavailableReason: null,
        pageUrl: "https://apple.com/",
      },
    },
    seo: { checks: [] },
    aiSearch: {
      botAccess: {},
      llmsTxt: { present: false, status: "missing" },
      manifest: { present: false, status: "missing" },
      humansTxt: { present: false, status: "missing" },
      jsDependency: { rawVsRenderedRatio: null, status: "unavailable" },
      checks: [],
    },
    topFixes: [],
    shareToken: null,
    error: null,
    ...overrides,
  };
}

describe("buildDashboardMetrics site audit crawl counts", () => {
  it("shows attempted URLs as total and Healthy 0 when htmlPages is 0", () => {
    const metrics = buildDashboardMetrics(baseReport());
    expect(metrics.crawled.total).toBe(1);
    expect(metrics.crawled.healthy).toBe(0);
    expect(metrics.crawled.broken).toBe(0);
    expect(metrics.pagesCrawled).toBe(1);
  });

  it("counts healthy from measurable HTML when SEO succeeded", () => {
    const metrics = buildDashboardMetrics(
      baseReport({
        scores: { overall: 80, mobile: 70, desktop: 90, seo: 85, aiSearch: 90 },
        completeness: { complete: true, unavailableSections: [] },
        crawl: {
          pagesAttempted: 3,
          htmlPages: 3,
          timedOutPages: 0,
          sitemapSeeds: 2,
          seoSource: "http",
        },
        pagesCrawled: 3,
      })
    );
    expect(metrics.crawled.total).toBe(3);
    expect(metrics.crawled.healthy).toBe(3);
  });
});
