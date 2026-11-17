import { memo, useEffect, useRef, useState } from "react";
import { renderPageToCanvas, type PDFDocumentProxy, type RenderTask } from "@/lib/pdf";
import { cn } from "@/lib/utils";

interface ThumbnailSidebarProps {
  pdf: PDFDocumentProxy | null;
  pageCount: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  /** Page numbers that have at least one field placed, for the dot indicator. */
  pagesWithFields?: Set<number>;
}

const THUMB_WIDTH = 112;

/**
 * One lazily-rendered thumbnail.
 *
 * Rendered only once it scrolls into the sidebar (IntersectionObserver) — a
 * 500-page document must not rasterize 500 thumbnails on open. Once rendered
 * it stays cached; thumbnails are small and re-rendering on every scroll would
 * be worse than the memory.
 */
const Thumbnail = memo(function Thumbnail({
  pdf,
  pageNumber,
  isActive,
  hasFields,
  onSelect,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  isActive: boolean;
  hasFields: boolean;
  onSelect: (page: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const renderedRef = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect(); // once rendered, stop watching
        }
      },
      { root: el.closest("[data-thumbnail-scroll]"), rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldRender || renderedRef.current) return;
    let cancelled = false;
    let task: RenderTask | null = null;

    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled || !canvasRef.current) return;
        const baseWidth = page.getViewport({ scale: 1 }).width;
        task = renderPageToCanvas(page, canvasRef.current, THUMB_WIDTH / baseWidth);
        await task.promise;
        renderedRef.current = true;
      } catch {
        // A failed or cancelled thumbnail is cosmetic — the page-number
        // placeholder remains.
      }
    })();

    return () => {
      cancelled = true;
      // Unmounting mid-render (fast sidebar scrolling) would otherwise leave the
      // task painting into a detached canvas.
      task?.cancel();
    };
  }, [shouldRender, pdf, pageNumber]);

  // Keep the active thumbnail in view as the user scrolls the main pane.
  useEffect(() => {
    if (isActive) {
      wrapperRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isActive]);

  return (
    <button
      ref={wrapperRef}
      onClick={() => onSelect(pageNumber)}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex w-full flex-col items-center gap-1 rounded p-1 transition-colors",
        "focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:outline-none",
        isActive ? "bg-white/10" : "hover:bg-white/5"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-white transition-colors",
          isActive ? "outline outline-1 outline-offset-1 outline-sky-300" : "outline outline-1 outline-transparent group-hover:outline-white/30"
        )}
        style={{ width: THUMB_WIDTH, minHeight: 60 }}
      >
        <canvas ref={canvasRef} className="block" />
        {hasFields && (
          <span
            className="absolute right-1 top-1 size-1.5 rounded-full bg-sky-400"
            aria-label="This page has fields"
          />
        )}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium tabular-nums",
          isActive ? "text-white" : "text-white/60"
        )}
      >
        {pageNumber}
      </span>
    </button>
  );
});

export const ThumbnailSidebar = memo(function ThumbnailSidebar({
  pdf,
  pageCount,
  currentPage,
  onPageSelect,
  pagesWithFields,
}: ThumbnailSidebarProps) {
  if (!pdf) return null;

  return (
    <aside
      data-thumbnail-scroll
      className="w-32 shrink-0 overflow-y-auto border-r border-border bg-[#4a505a] p-1.5"
      aria-label="Page thumbnails"
    >
      {Array.from({ length: pageCount }, (_, i) => (
        <Thumbnail
          key={i + 1}
          pdf={pdf}
          pageNumber={i + 1}
          isActive={currentPage === i + 1}
          hasFields={pagesWithFields?.has(i + 1) ?? false}
          onSelect={onPageSelect}
        />
      ))}
    </aside>
  );
});
