/**
 * Single source for sitemap / prerender / robots host.
 * Keep paths in sync with src/lib/seo.ts SITEMAP_PATHS.
 */
export const SITE_URL = (process.env.VITE_SITE_URL || "https://vigodesk.com").replace(
  /\/$/,
  ""
);

export const SITE_NAME = "vigodesk.com";
export const BRAND_NAME = "VigioDesk";

export const BRAND_DESCRIPTION =
  "VigioDesk (vigodesk.com) — convert, merge, split, and protect PDFs online; eSign with audit trails; employee Letter Studio; Diagram Studio; and AI website audits. Fast, privacy-first document tools for modern teams.";

/** @type {readonly string[]} */
export const SITEMAP_PATHS = [
  "/",
  "/desktop",
  "/esign",
  "/enterprise",
  "/letters",
  "/diagrams",
  "/webreports",
  "/workspace",
  "/pricing",
  "/security",
  "/developer",
  "/api-docs",
  "/blog",
  "/about",
  "/privacy",
  "/terms",
  "/gdpr",
  "/docs",
];

/** Minimal titles/descriptions for static HTML shells (crawlers). */
export const PAGE_SEO = {
  "/": {
    title: `${SITE_NAME} | PDF Tools, eSign & Document Studios`,
    description: BRAND_DESCRIPTION,
  },
  "/desktop": {
    title: `PDF Toolkit Desktop for Windows | ${SITE_NAME}`,
    description: "All your PDF tools in one Windows desktop app — fast, private, and offline-ready.",
  },
  "/esign": {
    title: `eSign PDF Online — Legally Binding Signatures | ${SITE_NAME}`,
    description: "Send, sign, and verify PDFs with a full audit trail.",
  },
  "/enterprise": {
    title: `Bring Your Own Cloud (BYOC) | ${SITE_NAME} Enterprise`,
    description: "Keep PDFs in your own cloud bucket. We never keep the file bytes.",
  },
  "/letters": {
    title: `Employee Letter Studio | ${SITE_NAME}`,
    description: "Create branded employee letters from Excel and send secure PDFs in bulk.",
  },
  "/diagrams": {
    title: `Diagram Studio — Draw Flowcharts & Architecture | ${SITE_NAME}`,
    description: "Create professional diagrams and flowcharts in the browser.",
  },
  "/webreports": {
    title: `Web Reports — AI Site Audit for SEO & AI Search | ${SITE_NAME}`,
    description: "Crawl your website for Core Web Vitals, SEO issues, and AI-search readiness.",
  },
  "/workspace": {
    title: `PDF Workspace | ${SITE_NAME}`,
    description: "Merge, split, compress, convert, and protect PDFs online.",
  },
  "/pricing": {
    title: `Plans & Pricing | ${SITE_NAME}`,
    description: "VigioDesk plans for individuals and teams.",
  },
  "/security": {
    title: `Security & Trust | ${SITE_NAME}`,
    description: "AES-256 encryption, TLS in transit, and signed eSign audit trails.",
  },
  "/developer": {
    title: `Developer API | ${SITE_NAME}`,
    description: "REST and webhook APIs for PDF, eSign, OCR, and AI.",
  },
  "/api-docs": {
    title: `API Documentation | ${SITE_NAME}`,
    description: "VigioDesk developer API documentation.",
  },
  "/blog": {
    title: `Engineering Blog | ${SITE_NAME}`,
    description: "Engineering deep dives from the VigioDesk team.",
  },
  "/about": {
    title: `About Us | ${SITE_NAME}`,
    description: "VigioDesk builds privacy-first document tools for modern teams.",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How VigioDesk handles your data.",
  },
  "/terms": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: "Terms of service for VigioDesk.",
  },
  "/gdpr": {
    title: `GDPR & Compliance | ${SITE_NAME}`,
    description: "GDPR and compliance information for VigioDesk customers.",
  },
  "/docs": {
    title: `Support & Documentation | ${SITE_NAME}`,
    description: "Help center for VigioDesk products.",
  },
};
