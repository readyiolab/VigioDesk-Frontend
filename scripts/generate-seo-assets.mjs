/**
 * Writes robots.txt + sitemap.xml into public/, and after Vite build
 * emits per-route HTML shells under dist/ so crawlers see correct meta
 * without waiting for client JS.
 *
 * Usage:
 *   node scripts/generate-seo-assets.mjs           # public/ only
 *   node scripts/generate-seo-assets.mjs --prerender  # also dist shells
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  PAGE_SEO,
  SITE_NAME,
  SITE_URL,
  SITEMAP_PATHS,
} from "./seo-site.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const distDir = path.join(root, "dist");
const prerender = process.argv.includes("--prerender");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeRobots() {
  const body = `User-agent: *
Allow: /
Allow: /desktop
Allow: /esign
Allow: /enterprise
Allow: /letters
Allow: /diagrams
Allow: /webreports
Allow: /workspace
Allow: /pricing
Allow: /security
Allow: /developer
Allow: /api-docs
Allow: /blog
Allow: /about
Allow: /privacy
Allow: /terms
Allow: /gdpr
Allow: /docs

# App interiors / private tokens
Disallow: /login
Disallow: /register
Disallow: /verify-email
Disallow: /history
Disallow: /profile
Disallow: /billing
Disallow: /settings/
Disallow: /sign
Disallow: /sign/
Disallow: /s/
Disallow: /ai/
Disallow: /letters/
Disallow: /diagrams/studio
Disallow: /diagrams/new
Disallow: /diagrams/shared/
Disallow: /webreports/scan
Disallow: /webreports/shared/

# Major search + AI answer crawlers welcome
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(publicDir, "robots.txt"), body, "utf8");
}

function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP_PATHS.map((p) => {
    const loc = p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`;
    const priority = p === "/" ? "1.0" : p.split("/").length <= 2 ? "0.8" : "0.6";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
  if (prerender && fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf8");
    fs.copyFileSync(path.join(publicDir, "robots.txt"), path.join(distDir, "robots.txt"));
  }
}

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: BRAND_DESCRIPTION,
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: BRAND_DESCRIPTION,
  };
}

function injectShell(baseHtml, routePath) {
  const seo = PAGE_SEO[routePath] || {
    title: SITE_NAME,
    description: BRAND_DESCRIPTION,
  };
  const url = routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
  const image = `${SITE_URL}/logo.png`;
  const schemas = JSON.stringify([organizationJsonLd(), websiteJsonLd()]);

  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(url)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(image)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(url)}" />`
  );

  // Ensure JSON-LD once per shell (replace prior prerender block if re-run)
  html = html.replace(
    /<script type="application\/ld\+json" id="seo-prerender-jsonld">[\s\S]*?<\/script>\s*/i,
    ""
  );
  html = html.replace(
    "</head>",
    `    <script type="application/ld+json" id="seo-prerender-jsonld">${schemas}</script>\n  </head>`
  );

  // Noscript crawlable blurb (per-route)
  const noscript = `<noscript>
      <main id="seo-prerender-content" style="max-width:720px;margin:2rem auto;font-family:system-ui,sans-serif;padding:1rem">
        <h1>${escapeHtml(seo.title)}</h1>
        <p>${escapeHtml(seo.description)}</p>
        <p><a href="${escapeHtml(SITE_URL)}/">Home</a> · <a href="${escapeHtml(SITE_URL)}/about">About</a></p>
      </main>
    </noscript>`;
  if (/id="seo-prerender-content"/.test(html)) {
    html = html.replace(/<noscript>[\s\S]*?id="seo-prerender-content"[\s\S]*?<\/noscript>/i, noscript);
  } else {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);
  }

  return html;
}

function writePrerenderShells() {
  const indexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn("[seo] dist/index.html missing — skip prerender shells");
    return;
  }
  const base = fs.readFileSync(indexPath, "utf8");

  for (const routePath of SITEMAP_PATHS) {
    const html = injectShell(base, routePath);
    if (routePath === "/") {
      fs.writeFileSync(indexPath, html, "utf8");
      continue;
    }
    const dir = path.join(distDir, routePath.replace(/^\//, ""));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  }
  console.log(`[seo] Prerendered ${SITEMAP_PATHS.length} HTML shells under dist/`);
}

writeRobots();
writeSitemap();
console.log(`[seo] Wrote public/robots.txt and public/sitemap.xml → ${SITE_URL}`);

if (prerender) {
  writePrerenderShells();
}
