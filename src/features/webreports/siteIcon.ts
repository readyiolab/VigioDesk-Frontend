/** Favicon URL that works as a plain <img src> without CORS/canvas issues. */
export function siteIconUrl(domainOrUrl: string, _size: 16 | 32 | 64 | 128 = 64): string {
  let host = domainOrUrl.trim();
  try {
    if (/^https?:\/\//i.test(host)) host = new URL(host).hostname;
  } catch {
    // keep raw
  }
  host = host.replace(/^www\./i, "").split("/")[0] || host;
  // DuckDuckGo icons avoid Google's 301+CORS failures in some browsers.
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`;
}

/** Prefer DuckDuckGo when branding still points at Google's favicon endpoint. */
export function resolveSiteIcon(logoUrl: string | null | undefined, domainOrUrl: string, size: 16 | 32 | 64 | 128 = 64): string {
  if (logoUrl && !/google\.com\/s2\/favicons/i.test(logoUrl)) return logoUrl;
  return siteIconUrl(domainOrUrl, size);
}
