/** Site origin for canonical / OG URLs. Override with VITE_SITE_URL in env. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://vigodesk.com"
).replace(/\/$/, "");

export const SITE_NAME = "vigodesk.com";

export const BRAND_NAME = "VigioDesk";

/** Shared brand blurb for meta, schema, and llms.txt */
export const BRAND_DESCRIPTION =
  "VigioDesk (vigodesk.com) — convert, merge, split, and protect PDFs online; eSign with audit trails; employee Letter Studio; Diagram Studio; and AI website audits. Fast, privacy-first document tools for modern teams.";

export const OG_IMAGE_PATH = "/logo.png";

export function absoluteUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${p}`;
}

export function ogImageUrl(): string {
  return absoluteUrl(OG_IMAGE_PATH);
}

export interface SeoConfig {
  title: string;
  description: string;
  /** Path only, e.g. /desktop — used for canonical + og:url */
  path: string;
  /** Defaults to index,follow for public pages */
  robots?: string;
  ogType?: string;
  keywords?: string;
  /** Product schema type for GEO */
  product?: "pdf" | "esign" | "letters" | "diagrams" | "webreports" | "desktop" | "enterprise";
  /** Show Organization + WebSite JSON-LD */
  marketing?: boolean;
}

export const DEFAULT_SEO: SeoConfig = {
  title: `${SITE_NAME} | PDF Tools, eSign & Document Studios`,
  description: BRAND_DESCRIPTION,
  path: "/",
  robots: "index, follow",
  ogType: "website",
  marketing: true,
  keywords:
    "PDF converter, merge PDF, eSign PDF, employee letters, diagram studio, website audit, VigioDesk",
};

/** Exact path → SEO. Longer / more specific paths win via lookup order below. */
const EXACT: Record<string, Omit<SeoConfig, "path">> = {
  "/": {
    title: `${SITE_NAME} | PDF Tools, eSign & Document Studios`,
    description: BRAND_DESCRIPTION,
    robots: "index, follow",
    marketing: true,
    product: "pdf",
    keywords:
      "PDF tools, online PDF editor, merge PDF, eSign, electronic signature, Letter Studio, Diagram Studio, Web Reports",
  },
  "/desktop": {
    title: `PDF Toolkit Desktop for Windows | ${SITE_NAME}`,
    description:
      "All your PDF tools in one Windows desktop app — fast, private, and offline-ready after license activation.",
    robots: "index, follow",
    marketing: true,
    product: "desktop",
    keywords: "PDF desktop app, Windows PDF tools, offline PDF editor, VigioDesk download",
  },
  "/esign": {
    title: `eSign PDF Online — Legally Binding Signatures | ${SITE_NAME}`,
    description:
      "Send, sign, and verify PDFs with a full audit trail. Multi-recipient signing, private signer links, and a SHA-256 seal on every completed document.",
    robots: "index, follow",
    marketing: true,
    product: "esign",
    keywords: "eSign PDF, electronic signature, sign PDF online, audit trail",
  },
  "/enterprise": {
    title: `Bring Your Own Cloud (BYOC) | ${SITE_NAME} Enterprise`,
    description:
      "Keep PDFs in your own AWS, Azure, R2, GCS, or MinIO bucket. Browser uploads go straight to your storage — we never keep the file bytes.",
    robots: "index, follow",
    marketing: true,
    product: "enterprise",
    keywords: "BYOC, bring your own cloud, enterprise PDF, AWS S3 PDF",
  },
  "/letters": {
    title: `Employee Letter Studio | ${SITE_NAME}`,
    description:
      "Create branded employee letters from Excel — validate, generate password-protected PDFs in bulk, and send from your Outlook or Gmail. AI assists, humans approve.",
    robots: "index, follow",
    marketing: true,
    product: "letters",
    keywords: "employee letter generator, HR letter Excel, bulk PDF letters",
  },
  "/diagrams": {
    title: `Diagram Studio — Draw Flowcharts & Architecture | ${SITE_NAME}`,
    description:
      "Create professional diagrams, flowcharts, and architecture maps in the browser. Collaborate, export, and share — Diagram Studio by VigioDesk.",
    robots: "index, follow",
    marketing: true,
    product: "diagrams",
    keywords: "diagram studio, flowchart online, architecture diagram, draw.io alternative",
  },
  "/webreports": {
    title: `Web Reports — AI Site Audit for SEO & AI Search | ${SITE_NAME}`,
    description:
      "Crawl your website for Core Web Vitals, SEO issues, and AI-search readiness. Semrush-style scores, fixes, and shareable PDF audits.",
    robots: "index, follow",
    marketing: true,
    product: "webreports",
    keywords: "website audit, SEO audit, Core Web Vitals, AI search, llms.txt, Semrush alternative",
  },
  "/workspace": {
    title: `PDF Workspace | ${SITE_NAME}`,
    description:
      "Open the VigioDesk workspace to merge, split, compress, convert, protect, and more.",
    robots: "index, follow",
    marketing: true,
    product: "pdf",
  },
  "/pricing": {
    title: `Plans & Pricing | ${SITE_NAME}`,
    description: "VigioDesk plans for individuals and teams — PDF tools, eSign, studios, and AI audits.",
    robots: "index, follow",
    marketing: true,
  },
  "/security": {
    title: `Security & Trust | ${SITE_NAME}`,
    description:
      "AES-256 encryption, TLS in transit, automated file purging, and cryptographically signed eSign audit trails.",
    robots: "index, follow",
    marketing: true,
  },
  "/developer": {
    title: `Developer API | ${SITE_NAME}`,
    description:
      "REST and webhook APIs for PDF conversion, eSign, OCR, and AI summaries. Integrate document workflows into your product.",
    robots: "index, follow",
    marketing: true,
  },
  "/api-docs": {
    title: `API Documentation | ${SITE_NAME}`,
    description: "VigioDesk developer API docs — conversion, eSign, OCR, and AI endpoints.",
    robots: "index, follow",
    marketing: true,
  },
  "/blog": {
    title: `Engineering Blog | ${SITE_NAME}`,
    description:
      "Deep dives into PDF rendering, document AI, and product engineering from the VigioDesk team.",
    robots: "index, follow",
    marketing: true,
  },
  "/about": {
    title: `About Us | ${SITE_NAME}`,
    description:
      "VigioDesk builds fast, privacy-first document tools — PDF, eSign, Letter Studio, Diagram Studio, and Web Reports.",
    robots: "index, follow",
    marketing: true,
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "How VigioDesk handles your data. We do not sell personal data or train public AI models on your documents.",
    robots: "index, follow",
    marketing: true,
  },
  "/terms": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: "Terms of service for using VigioDesk online tools, eSign, and studios.",
    robots: "index, follow",
    marketing: true,
  },
  "/gdpr": {
    title: `GDPR & Compliance | ${SITE_NAME}`,
    description:
      "VigioDesk GDPR and compliance information for teams processing documents in regulated regions.",
    robots: "index, follow",
    marketing: true,
  },
  "/docs": {
    title: `Support & Documentation | ${SITE_NAME}`,
    description: "Help center and documentation for VigioDesk PDF tools, eSign, and enterprise features.",
    robots: "index, follow",
    marketing: true,
  },
  "/billing": {
    title: `Plans & Pricing | ${SITE_NAME}`,
    description: "VigioDesk plans and pricing for individuals and teams.",
    robots: "noindex, nofollow",
  },
  "/login": {
    title: `Sign in | ${SITE_NAME}`,
    description: "Sign in to your VigioDesk account.",
    robots: "noindex, nofollow",
  },
  "/register": {
    title: `Create account | ${SITE_NAME}`,
    description: "Create a VigioDesk account to save history, eSign, and unlock AI tools.",
    robots: "noindex, nofollow",
  },
  "/verify-email": {
    title: `Verify email | ${SITE_NAME}`,
    description: "Verify your VigioDesk email address.",
    robots: "noindex, nofollow",
  },
  "/history": {
    title: `Activity History | ${SITE_NAME}`,
    description: "View and download your recent VigioDesk jobs.",
    robots: "noindex, nofollow",
  },
  "/profile": {
    title: `Profile | ${SITE_NAME}`,
    description: "Manage your VigioDesk profile.",
    robots: "noindex, nofollow",
  },
  "/settings/cloud": {
    title: `Cloud Storage Settings | ${SITE_NAME}`,
    description: "Connect your own cloud storage for Enterprise BYOC.",
    robots: "noindex, nofollow",
  },
  "/sign": {
    title: `eSign Dashboard | ${SITE_NAME}`,
    description: "Manage documents for electronic signature.",
    robots: "noindex, nofollow",
  },
  "/ai/summarize": {
    title: `Summarize PDF | ${SITE_NAME}`,
    description: "Get an AI summary of any PDF in VigioDesk.",
    robots: "noindex, nofollow",
  },
  "/ai/explain": {
    title: `Explain PDF | ${SITE_NAME}`,
    description: "Turn dense PDF content into plain language with VigioDesk AI.",
    robots: "noindex, nofollow",
  },
  "/ai/chat": {
    title: `Chat with PDF | ${SITE_NAME}`,
    description: "Ask questions grounded in your PDF with VigioDesk AI.",
    robots: "noindex, nofollow",
  },
};

const NOINDEX_PREFIXES = [
  "/sign/",
  "/s/",
  "/ai/",
  "/letters/",
  "/diagrams/studio",
  "/diagrams/new",
  "/diagrams/shared/",
  "/webreports/scan",
  "/webreports/shared/",
  "/history",
  "/profile",
  "/settings/",
  "/assets",
] as const;

function titleForWorkspaceTool(toolId: string): string {
  const map: Record<string, string> = {
    merge: "Merge PDF",
    split: "Split PDF",
    compress: "Compress PDF",
    rotate: "Rotate PDF",
    protect: "Protect PDF",
    "jpg-to-pdf": "JPG to PDF",
    jpgToPdf: "JPG to PDF",
    "pdf-to-jpg": "PDF to JPG",
    pdfToJpg: "PDF to JPG",
    watermark: "Watermark PDF",
    officeConvert: "Office to PDF",
    ocr: "OCR PDF",
  };
  return map[toolId] ?? toolId.replace(/-/g, " ");
}

function isNoindexPath(path: string): boolean {
  if (NOINDEX_PREFIXES.some((p) => path.startsWith(p))) return true;
  // /diagrams/:id (not /diagrams landing)
  if (/^\/diagrams\/[^/]+$/.test(path) && path !== "/diagrams") return true;
  // /webreports/:id (not landing)
  if (/^\/webreports\/[^/]+$/.test(path) && path !== "/webreports") return true;
  return false;
}

/** Resolve SEO for the current pathname (SPA). */
export function resolveSeo(pathname: string): SeoConfig {
  const path = pathname.replace(/\/$/, "") || "/";

  if (EXACT[path]) {
    return { path, ogType: "website", ...EXACT[path] };
  }

  const workspaceMatch = path.match(/^\/workspace\/([^/]+)$/);
  if (workspaceMatch) {
    const toolName = titleForWorkspaceTool(workspaceMatch[1]);
    return {
      path,
      title: `${toolName} | ${SITE_NAME}`,
      description: `${toolName} online with VigioDesk — fast, private PDF processing.`,
      robots: "index, follow",
      ogType: "website",
      marketing: true,
      product: "pdf",
    };
  }

  if (path.startsWith("/sign/")) {
    return {
      path,
      title: `Document editor | ${SITE_NAME}`,
      description: "Edit and send a PDF for signature.",
      robots: "noindex, nofollow",
      ogType: "website",
    };
  }

  if (path.startsWith("/s/")) {
    return {
      path,
      title: `Sign document | ${SITE_NAME}`,
      description: "Review and sign this document securely.",
      robots: "noindex, nofollow",
      ogType: "website",
    };
  }

  if (isNoindexPath(path)) {
    return {
      path,
      title: `${SITE_NAME}`,
      description: BRAND_DESCRIPTION,
      robots: "noindex, nofollow",
      ogType: "website",
    };
  }

  return {
    ...DEFAULT_SEO,
    path,
    title: `${SITE_NAME}`,
    robots: "index, follow",
  };
}

/** Public paths included in sitemap.xml (and prerender shells). */
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
] as const;

export type SitemapPath = (typeof SITEMAP_PATHS)[number];

/** Breadcrumb crumbs for a marketing path */
export function breadcrumbsFor(path: string): { name: string; path: string }[] {
  const crumbs = [{ name: "Home", path: "/" }];
  const normalized = path.replace(/\/$/, "") || "/";
  if (normalized === "/") return crumbs;
  const seo = resolveSeo(normalized);
  const short = seo.title.split("|")[0]?.trim() || normalized;
  crumbs.push({ name: short, path: normalized });
  return crumbs;
}
