import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { ReportDashboard } from "@/features/webreports/ReportDashboard";
import { ScanProgress } from "@/features/webreports/ScanProgress";
import { scanStepTitle } from "@/features/webreports/stageLabel";
import { downloadWebReportPdf } from "@/features/webreports/buildWebReportPdf";
import { useWebReport, useWebReportActions, useWebReportHistoryById } from "@/features/webreports/queries";
import { ArrowLeft, Download, Share2, ShieldX, RefreshCw, Trash2, Globe, ExternalLink, Loader2 } from "lucide-react";

export default function WebReportPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useWebReport(id);
  const actions = useWebReportActions(id);
  const report = query.data?.report;
  const historyQuery = useWebReportHistoryById(id || undefined);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  async function share() {
    try {
      const result = await actions.share.mutateAsync();
      const link = `${window.location.origin}${result.sharePath}`;
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create a share link.");
    }
  }

  async function revoke() {
    try {
      await actions.revoke.mutateAsync();
      toast.success("Share link revoked.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not revoke the share link.");
    }
  }

  async function rescan() {
    try {
      const result = await actions.rescan.mutateAsync();
      if (result.report.id) navigate(`/webreports/${result.report.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not rescan.");
    }
  }

  async function remove() {
    if (!window.confirm("Delete this report? A running scan will stop saving results.")) return;
    try {
      await actions.remove.mutateAsync();
      navigate("/webreports/scan");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete the report.");
    }
  }

  async function downloadPdf() {
    if (!report || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      await downloadWebReportPdf(report);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }

  if (query.isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-[#f4f6f9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Loading audit…</p>
      </div>
    );
  }

  if (query.isError || !report) {
    return (
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Globe className="h-6 w-6" />
        </div>
        <p role="alert" className="text-base font-semibold text-slate-900">
          This report is unavailable.
        </p>
        <p className="mt-1 text-sm text-slate-500">It may have expired or been deleted.</p>
        <Link
          to="/webreports/scan"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scans
        </Link>
      </div>
    );
  }

  const running = report.status === "queued" || report.status === "running";
  const finished = report.status === "completed";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f4f6f9] text-slate-900">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4 print:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to="/webreports/scan"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Scans
            </Link>
            <span className="truncate font-mono text-xs text-slate-600">{report.url}</span>
            <a
              href={report.url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-600"
              title="Open website"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {running ? (
          <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-blue-600" />
            </span>
            <span>{report.progress}%</span>
            <span className="hidden text-blue-600/80 sm:inline">· {scanStepTitle(report.stage)}</span>
          </div>
        ) : finished ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <Button
              type="button"
              onClick={() => void downloadPdf()}
              size="sm"
              className="h-8 gap-1.5"
              disabled={downloadingPdf}
              aria-label="Download PDF"
            >
              {downloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {downloadingPdf ? "Preparing…" : "Download PDF"}
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={share}
              disabled={actions.share.isPending}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            {report.shareToken ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={revoke}
                disabled={actions.revoke.isPending}
              >
                <ShieldX className="h-3.5 w-3.5" />
                Revoke
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={rescan}
              disabled={actions.rescan.isPending}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rescan
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-slate-500 hover:text-red-600"
              onClick={remove}
              disabled={actions.remove.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-red-600"
            onClick={remove}
            disabled={actions.remove.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {running ? (
          <ScanProgress report={report} />
        ) : (
          <ReportDashboard
            report={report}
            history={historyQuery.data?.points || []}
            onUpdateBranding={(b) => actions.updateBranding.mutateAsync(b)}
            isUpdatingBranding={actions.updateBranding.isPending}
            onRescan={() => void rescan()}
            rescanPending={actions.rescan.isPending}
          />
        )}
      </div>
    </div>
  );
}
