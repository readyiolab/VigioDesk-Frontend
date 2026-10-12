import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/services/api";
import { useCreateWebReport, useWebReportList } from "@/features/webreports/queries";

export default function WebReportsHome() {
  const navigate = useNavigate();
  const list = useWebReportList();
  const create = useCreateWebReport();
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState("");
  const [force, setForce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a website URL.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Use an http or https URL.");
      return;
    }
    try {
      const pages = maxPages ? Number(maxPages) : undefined;
      const result = await create.mutateAsync({
        url: trimmed,
        maxPages: Number.isFinite(pages) ? pages : undefined,
        force,
      });
      if (result.cached) toast.message("Showing a recent scan of this URL.");
      if (result.report.id) navigate(`/webreports/${result.report.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The scan could not be started.");
    }
  }

  const reports = list.data?.reports || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Website audit</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Scan a public site for performance, SEO, and AI-search readiness. The audit runs in the background.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4">
        <label className="block text-sm font-medium" htmlFor="audit-url">
          Website URL
        </label>
        <Input
          id="audit-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          autoComplete="url"
          disabled={create.isPending}
        />
        <label className="block text-sm font-medium" htmlFor="audit-pages">
          Page limit (optional)
        </label>
        <Input
          id="audit-pages"
          inputMode="numeric"
          value={maxPages}
          onChange={(event) => setMaxPages(event.target.value)}
          disabled={create.isPending}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={force} onChange={(event) => setForce(event.target.checked)} />
          Force a new scan even if one finished in the last 30 minutes
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Starting…" : "Start scan"}
        </Button>
      </form>

      <section className="mt-8" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-lg font-semibold">
          Recent scans
        </h2>
        {list.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading scans…</p> : null}
        {!list.isLoading && reports.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No scans yet. Submit a URL to start.</p>
        ) : null}
        <ul className="mt-3 space-y-2">
          {reports.map((report) => (
            <li key={report.id} className="rounded-xl border border-border px-3 py-2">
              <Link className="font-medium underline-offset-4 hover:underline" to={`/webreports/${report.id}`}>
                {report.url}
              </Link>
              <div className="text-xs text-muted-foreground">
                {report.status}
                {report.scores.overall !== null ? ` · ${report.scores.overall}` : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
