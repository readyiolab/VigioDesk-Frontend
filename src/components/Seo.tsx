import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  absoluteUrl,
  ogImageUrl,
  resolveSeo,
  SITE_NAME,
  type SeoConfig,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbSchema,
  organizationSchema,
  productServiceSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function applySeo(seo: SeoConfig) {
  const url = absoluteUrl(seo.path);
  const image = ogImageUrl();
  document.title = seo.title;

  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "robots", seo.robots ?? "index, follow");
  if (seo.keywords) {
    upsertMeta("name", "keywords", seo.keywords);
  }

  upsertMeta("property", "og:title", seo.title);
  upsertMeta("property", "og:description", seo.description);
  upsertMeta("property", "og:type", seo.ogType ?? "website");
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:image", image);

  upsertMeta("property", "twitter:card", "summary_large_image");
  upsertMeta("property", "twitter:title", seo.title);
  upsertMeta("property", "twitter:description", seo.description);
  upsertMeta("property", "twitter:image", image);

  if (seo.marketing) {
    upsertMeta("property", "og:updated_time", new Date().toISOString());
  }

  upsertLink("canonical", url);
  upsertLink("manifest", "/manifest.json");
}

/**
 * Keeps document title + meta tags in sync with the active route.
 * Also injects Organization / WebSite / WebPage JSON-LD on marketing routes.
 */
export function RouteSeo() {
  const { pathname } = useLocation();
  const seo = useMemo(() => resolveSeo(pathname), [pathname]);
  const isMarketing = !!seo.marketing && !(seo.robots || "").includes("noindex");

  useEffect(() => {
    applySeo(seo);
  }, [seo]);

  const schemas = useMemo(() => {
    if (!isMarketing) return [];
    return [
      organizationSchema(),
      websiteSchema(),
      webPageSchema(seo),
      breadcrumbSchema(seo.path),
      productServiceSchema(seo),
    ].filter(Boolean);
  }, [isMarketing, seo]);

  if (!schemas.length) return null;

  return <JsonLd id="route-seo-jsonld" data={schemas} />;
}
