import { useEffect } from "react";

type JsonLdProps = {
  id: string;
  data: unknown | unknown[];
};

/**
 * Injects JSON-LD into <head> for GEO / rich results.
 * Cleans up on unmount or when data changes.
 */
export function JsonLd({ id, data }: JsonLdProps) {
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = scriptId;
      document.head.appendChild(el);
    }
    const payload = Array.isArray(data) ? data.filter(Boolean) : data;
    el.text = JSON.stringify(payload);
    return () => {
      el?.remove();
    };
  }, [id, data]);

  return null;
}
