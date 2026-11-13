import {
  absoluteUrl,
  BRAND_DESCRIPTION,
  BRAND_NAME,
  breadcrumbsFor,
  SITE_NAME,
  SITE_URL,
  type SeoConfig,
} from "@/lib/seo";
import type { FaqItem } from "@/components/common/FaqSection";

export type JsonLdObject = Record<string, unknown>;

export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: BRAND_DESCRIPTION,
    sameAs: [],
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: BRAND_DESCRIPTION,
    publisher: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/workspace?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function webPageSchema(seo: SeoConfig): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.title,
    description: seo.description,
    url: absoluteUrl(seo.path),
    isPartOf: { "@type": "WebSite", url: SITE_URL, name: SITE_NAME },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(path: string): JsonLdObject {
  const crumbs = breadcrumbsFor(path);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqPageSchema(faqs: FaqItem[]): JsonLdObject | null {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

const PRODUCT_COPY: Record<
  NonNullable<SeoConfig["product"]>,
  { name: string; type: "SoftwareApplication" | "Service"; description: string }
> = {
  pdf: {
    name: "VigioDesk PDF Tools",
    type: "SoftwareApplication",
    description: "Online PDF merge, split, compress, convert, protect, and more.",
  },
  esign: {
    name: "VigioDesk eSign",
    type: "SoftwareApplication",
    description: "Legally binding electronic signatures with audit trails.",
  },
  letters: {
    name: "Employee Letter Studio",
    type: "SoftwareApplication",
    description: "Bulk branded employee letters from Excel with secure PDF delivery.",
  },
  diagrams: {
    name: "Diagram Studio",
    type: "SoftwareApplication",
    description: "Browser flowchart and architecture diagram editor.",
  },
  webreports: {
    name: "Web Reports",
    type: "Service",
    description: "AI website audits for Core Web Vitals, SEO, and AI-search readiness.",
  },
  desktop: {
    name: "PDF Toolkit Desktop",
    type: "SoftwareApplication",
    description: "Windows desktop PDF toolkit — fast and offline-ready.",
  },
  enterprise: {
    name: "VigioDesk Enterprise BYOC",
    type: "Service",
    description: "Bring-your-own-cloud document processing for enterprises.",
  },
};

export function productServiceSchema(seo: SeoConfig): JsonLdObject | null {
  if (!seo.product) return null;
  const p = PRODUCT_COPY[seo.product];
  if (p.type === "SoftwareApplication") {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: p.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: absoluteUrl(seo.path),
      description: p.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      provider: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.name,
    description: p.description,
    url: absoluteUrl(seo.path),
    provider: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
  };
}
