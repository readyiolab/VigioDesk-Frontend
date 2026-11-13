import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { WebReport } from "./types";
import {
  categoryHealth,
  issueDistribution,
  isFinding,
  letterGrade,
} from "./reportNarrative";

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 42;
const CONTENT_W = PAGE_W - MARGIN * 2;

const ink = rgb(0.09, 0.13, 0.2);
const muted = rgb(0.4, 0.45, 0.52);
const line = rgb(0.88, 0.9, 0.93);
const blue = rgb(0.15, 0.39, 0.92);
const red = rgb(0.86, 0.15, 0.15);
const amber = rgb(0.85, 0.47, 0.02);
const sky = rgb(0.08, 0.55, 0.78);
const green = rgb(0.02, 0.59, 0.41);
const softBg = rgb(0.97, 0.98, 0.99);

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || url;
  }
}

function scoreText(score: number | null) {
  return score === null ? "—" : String(score);
}

function scoreColor(score: number | null) {
  if (score === null) return muted;
  if (score >= 90) return green;
  if (score >= 50) return amber;
  return red;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  if (!words[0]) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawFooter(
  page: PDFPage,
  font: PDFFont,
  pageNo: number,
  total: number,
  scoringVersion: string
) {
  page.drawLine({
    start: { x: MARGIN, y: 28 },
    end: { x: PAGE_W - MARGIN, y: 28 },
    thickness: 0.5,
    color: line,
  });
  page.drawText(`Zuvigo Web Reports · ${scoringVersion}`, {
    x: MARGIN,
    y: 14,
    size: 8,
    font,
    color: muted,
  });
  const label = `Page ${pageNo} of ${total}`;
  page.drawText(label, {
    x: PAGE_W - MARGIN - font.widthOfTextAtSize(label, 8),
    y: 14,
    size: 8,
    font,
    color: muted,
  });
}

function drawSectionTitle(page: PDFPage, font: PDFFont, title: string, y: number) {
  page.drawText(title.toUpperCase(), {
    x: MARGIN,
    y,
    size: 9,
    font,
    color: muted,
  });
  return y - 14;
}

export async function buildWebReportPdf(report: WebReport): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const domain = hostnameOf(report.url);
  const customerName = report.customerBranding?.companyName || domain;
  const grade = letterGrade(report.scores.overall);
  const allChecks = [...report.seo.checks, ...report.aiSearch.checks];
  const dist = issueDistribution(allChecks);
  const categories = categoryHealth(allChecks);
  const findings = allChecks
    .filter(isFinding)
    .sort((a, b) => {
      const rank = { critical: 0, warning: 1, info: 2, pass: 3 } as const;
      return rank[a.severity] - rank[b.severity] || b.affectedCount - a.affectedCount;
    });

  const when = report.scannedAt
    ? new Date(report.scannedAt).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "In progress";

  // ── Page 1: Cover / health ──────────────────────────────────────
  const page1 = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  // Header bar
  page1.drawRectangle({
    x: 0,
    y: PAGE_H - 72,
    width: PAGE_W,
    height: 72,
    color: softBg,
  });
  page1.drawText("Zuvigo.com", {
    x: MARGIN,
    y: PAGE_H - 36,
    size: 16,
    font: fontBold,
    color: ink,
  });
  page1.drawText("Site Audit Report", {
    x: MARGIN,
    y: PAGE_H - 52,
    size: 9,
    font,
    color: muted,
  });
  const nameW = fontBold.widthOfTextAtSize(customerName.slice(0, 40), 12);
  page1.drawText(customerName.slice(0, 40), {
    x: PAGE_W - MARGIN - nameW,
    y: PAGE_H - 36,
    size: 12,
    font: fontBold,
    color: ink,
  });
  const domainW = font.widthOfTextAtSize(domain, 9);
  page1.drawText(domain, {
    x: PAGE_W - MARGIN - domainW,
    y: PAGE_H - 52,
    size: 9,
    font,
    color: muted,
  });

  y = PAGE_H - 100;

  // Headline + meta
  const headline = report.summary.headline || "Website audit";
  for (const lineText of wrapText(headline, fontBold, 18, CONTENT_W - 120)) {
    page1.drawText(lineText, { x: MARGIN, y, size: 18, font: fontBold, color: ink });
    y -= 22;
  }

  // Score badge (right)
  const scoreBoxX = PAGE_W - MARGIN - 88;
  const scoreBoxY = PAGE_H - 168;
  page1.drawRectangle({
    x: scoreBoxX,
    y: scoreBoxY,
    width: 88,
    height: 72,
    color: softBg,
    borderColor: line,
    borderWidth: 1,
  });
  const overall = scoreText(report.scores.overall);
  const overallSize = 28;
  page1.drawText(overall, {
    x: scoreBoxX + (88 - fontBold.widthOfTextAtSize(overall, overallSize)) / 2,
    y: scoreBoxY + 32,
    size: overallSize,
    font: fontBold,
    color: scoreColor(report.scores.overall),
  });
  const gradeLabel = `Grade ${grade.grade}`;
  page1.drawText(gradeLabel, {
    x: scoreBoxX + (88 - font.widthOfTextAtSize(gradeLabel, 9)) / 2,
    y: scoreBoxY + 14,
    size: 9,
    font,
    color: muted,
  });

  y = Math.min(y, scoreBoxY - 8);

  page1.drawText(report.url.slice(0, 90), {
    x: MARGIN,
    y,
    size: 9,
    font,
    color: blue,
  });
  y -= 16;
  page1.drawText(`${when}  ·  ${report.pagesCrawled} pages analyzed`, {
    x: MARGIN,
    y,
    size: 9,
    font,
    color: muted,
  });
  y -= 18;

  if (report.summary.text) {
    for (const lineText of wrapText(report.summary.text, font, 10, CONTENT_W - 100).slice(0, 5)) {
      page1.drawText(lineText, { x: MARGIN, y, size: 10, font, color: ink });
      y -= 13;
    }
    y -= 8;
  }

  // Score strip
  y = drawSectionTitle(page1, fontBold, "Category scores", y);
  const scoreItems: [string, number | null][] = [
    ["Overall", report.scores.overall],
    ["Mobile", report.scores.mobile],
    ["Desktop", report.scores.desktop],
    ["SEO", report.scores.seo],
    ["AI Search", report.scores.aiSearch],
  ];
  const tileW = (CONTENT_W - 16) / 5;
  scoreItems.forEach(([label, score], i) => {
    const x = MARGIN + i * (tileW + 4);
    page1.drawRectangle({
      x,
      y: y - 44,
      width: tileW,
      height: 48,
      color: softBg,
      borderColor: line,
      borderWidth: 0.8,
    });
    page1.drawText(label, { x: x + 8, y: y - 12, size: 8, font, color: muted });
    const val = scoreText(score);
    page1.drawText(val, {
      x: x + 8,
      y: y - 34,
      size: 16,
      font: fontBold,
      color: scoreColor(score),
    });
  });
  y -= 64;

  // Completeness note
  const missing = scoreItems
    .filter(([, s]) => s === null)
    .map(([l]) => l)
    .filter((l) => l !== "Overall");
  if (missing.length) {
    page1.drawText(`Not measured: ${missing.join(", ")} (omitted from totals, not scored as zero).`, {
      x: MARGIN,
      y,
      size: 8,
      font,
      color: amber,
    });
    y -= 16;
  }

  // Issue distribution
  y = drawSectionTitle(page1, fontBold, "Issue distribution", y);
  const chips: [string, number, ReturnType<typeof rgb>][] = [
    ["Errors", dist.errors, red],
    ["Warnings", dist.warnings, amber],
    ["Notices", dist.notices, sky],
    ["Passed", dist.passed, green],
  ];
  let chipX = MARGIN;
  for (const [label, n, color] of chips) {
    const text = `${label}  ${n}`;
    const tw = font.widthOfTextAtSize(text, 9) + 16;
    page1.drawRectangle({
      x: chipX,
      y: y - 18,
      width: tw,
      height: 20,
      color: softBg,
      borderColor: color,
      borderWidth: 1,
    });
    page1.drawText(text, { x: chipX + 8, y: y - 12, size: 9, font: fontBold, color });
    chipX += tw + 8;
  }
  y -= 36;

  // Category health
  if (categories.length) {
    y = drawSectionTitle(page1, fontBold, "Category health", y);
    page1.drawText("Category", { x: MARGIN, y, size: 8, font: fontBold, color: muted });
    page1.drawText("Pass %", { x: MARGIN + 200, y, size: 8, font: fontBold, color: muted });
    page1.drawText("Err", { x: MARGIN + 260, y, size: 8, font: fontBold, color: muted });
    page1.drawText("Warn", { x: MARGIN + 300, y, size: 8, font: fontBold, color: muted });
    page1.drawText("OK", { x: MARGIN + 350, y, size: 8, font: fontBold, color: muted });
    y -= 4;
    page1.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.6,
      color: line,
    });
    y -= 14;
    for (const cat of categories.slice(0, 10)) {
      if (y < 60) break;
      page1.drawText(cat.category.slice(0, 28), {
        x: MARGIN,
        y,
        size: 9,
        font,
        color: ink,
      });
      page1.drawText(`${cat.passRate}%`, {
        x: MARGIN + 200,
        y,
        size: 9,
        font: fontBold,
        color: scoreColor(cat.passRate),
      });
      page1.drawText(String(cat.errors), { x: MARGIN + 260, y, size: 9, font, color: red });
      page1.drawText(String(cat.warnings), { x: MARGIN + 300, y, size: 9, font, color: amber });
      page1.drawText(String(cat.passed), { x: MARGIN + 350, y, size: 9, font, color: green });
      y -= 14;
    }
  }

  drawFooter(page1, font, 1, 2, report.scoringVersion || "v1");

  // ── Page 2: CWV + findings + fixes ──────────────────────────────
  const page2 = pdf.addPage([PAGE_W, PAGE_H]);
  y = PAGE_H - MARGIN;

  page2.drawText("Performance, findings & fixes", {
    x: MARGIN,
    y,
    size: 14,
    font: fontBold,
    color: ink,
  });
  y -= 24;

  y = drawSectionTitle(page2, fontBold, "Core Web Vitals", y);
  const devices = [
    ["Mobile", report.performance.mobile],
    ["Desktop", report.performance.desktop],
  ] as const;
  const halfW = (CONTENT_W - 12) / 2;
  devices.forEach(([label, device], i) => {
    const x = MARGIN + i * (halfW + 12);
    page2.drawRectangle({
      x,
      y: y - 70,
      width: halfW,
      height: 78,
      color: softBg,
      borderColor: line,
      borderWidth: 0.8,
    });
    page2.drawText(label, { x: x + 10, y: y - 14, size: 10, font: fontBold, color: ink });
    page2.drawText(scoreText(device.score), {
      x: x + halfW - 36,
      y: y - 14,
      size: 12,
      font: fontBold,
      color: scoreColor(device.score),
    });
    const metrics = [
      ["LCP", device.lcp == null ? "—" : `${Math.round(device.lcp)} ms`],
      ["CLS", device.cls == null ? "—" : device.cls.toFixed(2)],
      ["INP", device.inp == null ? "—" : `${Math.round(device.inp)} ms`],
    ];
    metrics.forEach(([m, v], mi) => {
      const mx = x + 10 + mi * 70;
      page2.drawText(m, { x: mx, y: y - 36, size: 8, font, color: muted });
      page2.drawText(v, { x: mx, y: y - 52, size: 10, font: fontBold, color: ink });
    });
  });
  y -= 92;

  // Top issues
  y = drawSectionTitle(page2, fontBold, "Top issues", y);
  page2.drawText("Sev", { x: MARGIN, y, size: 8, font: fontBold, color: muted });
  page2.drawText("Issue", { x: MARGIN + 50, y, size: 8, font: fontBold, color: muted });
  page2.drawText("Pages", { x: MARGIN + 340, y, size: 8, font: fontBold, color: muted });
  page2.drawText("Fix", { x: MARGIN + 380, y, size: 8, font: fontBold, color: muted });
  y -= 4;
  page2.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.6,
    color: line,
  });
  y -= 12;

  if (findings.length === 0) {
    page2.drawText("No issues found on this scan.", {
      x: MARGIN,
      y,
      size: 9,
      font,
      color: muted,
    });
    y -= 16;
  } else {
    for (const check of findings.slice(0, 12)) {
      if (y < 160) break;
      const sev =
        check.severity === "critical"
          ? "Error"
          : check.severity === "warning"
            ? "Warning"
            : check.severity === "info"
              ? "Notice"
              : "Pass";
      const sevColor =
        check.severity === "critical"
          ? red
          : check.severity === "warning"
            ? amber
            : check.severity === "info"
              ? sky
              : green;
      page2.drawText(sev, { x: MARGIN, y, size: 8, font: fontBold, color: sevColor });
      const titleLines = wrapText(check.title, font, 9, 280);
      page2.drawText(titleLines[0] || check.title, {
        x: MARGIN + 50,
        y,
        size: 9,
        font,
        color: ink,
      });
      page2.drawText(String(check.affectedCount || "—"), {
        x: MARGIN + 340,
        y,
        size: 8,
        font,
        color: muted,
      });
      const fixLine = wrapText(check.fix || "—", font, 8, 130)[0] || "—";
      page2.drawText(fixLine, { x: MARGIN + 380, y, size: 8, font, color: muted });
      y -= 14;
      if (titleLines[1]) {
        page2.drawText(titleLines[1], {
          x: MARGIN + 50,
          y,
          size: 8,
          font,
          color: muted,
        });
        y -= 12;
      }
    }
  }

  y -= 8;

  // Priority fixes
  y = drawSectionTitle(page2, fontBold, "Priority fixes", y);
  if (report.topFixes.length === 0) {
    page2.drawText("No prioritized fixes.", { x: MARGIN, y, size: 9, font, color: muted });
  } else {
    for (const fix of report.topFixes.slice(0, 8)) {
      if (y < 50) break;
      page2.drawText(`${fix.rank}.`, {
        x: MARGIN,
        y,
        size: 9,
        font: fontBold,
        color: blue,
      });
      const title = wrapText(fix.title, fontBold, 9, CONTENT_W - 40);
      page2.drawText(title[0] || fix.title, {
        x: MARGIN + 18,
        y,
        size: 9,
        font: fontBold,
        color: ink,
      });
      y -= 12;
      const meta = `${fix.impact} impact · ${fix.effort} effort`;
      page2.drawText(meta, { x: MARGIN + 18, y, size: 8, font, color: muted });
      y -= 11;
      if (fix.why) {
        for (const lineText of wrapText(fix.why, font, 8, CONTENT_W - 20).slice(0, 2)) {
          if (y < 45) break;
          page2.drawText(lineText, { x: MARGIN + 18, y, size: 8, font, color: ink });
          y -= 10;
        }
      }
      y -= 6;
    }
  }

  drawFooter(page2, font, 2, 2, report.scoringVersion || "v1");

  return pdf.save();
}

export function webReportPdfFilename(report: WebReport): string {
  const host = hostnameOf(report.url).replace(/[^\w.-]+/g, "_");
  const day = report.scannedAt
    ? new Date(report.scannedAt).toISOString().slice(0, 10).replace(/-/g, "")
    : new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `audit-${host}-${day}.pdf`;
}

export async function downloadWebReportPdf(report: WebReport): Promise<void> {
  const bytes = await buildWebReportPdf(report);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = webReportPdfFilename(report);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
