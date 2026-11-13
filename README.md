# VigioDesk frontend (Vite + React)

SPA for vigodesk.com — PDF tools, eSign, Letter Studio, Diagram Studio, and Web Reports.

## SEO / AEO / GEO

Marketing metadata lives in `src/lib/seo.ts` and `src/lib/schema.ts`. Crawl files are generated from `scripts/seo-site.mjs` (keep `SITEMAP_PATHS` in sync with `src/lib/seo.ts`).

```bash
npm run seo:generate   # refresh public/robots.txt + public/sitemap.xml
npm run build          # prebuild writes crawl files; postbuild emits prerender HTML shells under dist/<path>/index.html
```

After changing SEO copy or sitemap paths, rebuild so prerendered shells and `sitemap.xml` stay aligned. Canonical host: `VITE_SITE_URL` (default `https://vigodesk.com`).

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```
