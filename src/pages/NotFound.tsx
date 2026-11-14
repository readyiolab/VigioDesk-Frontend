import { Link } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Real 404 view — must not redirect to home (that causes Soft 404 in Search Console).
 * Meta is noindex via resolveSeo default / exact /404 path.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-border dark:bg-muted">
        <FileQuestion className="h-8 w-8" aria-hidden />
      </div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">404</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base text-slate-600 dark:text-slate-300">
        This URL is not a published VigioDesk page. It may have been removed, mistyped, or never existed.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-xl">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/workspace">Open workspace</Link>
        </Button>
      </div>
    </div>
  );
}
