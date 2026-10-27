import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { ReportDashboard } from "@/features/webreports/ReportDashboard";
import { ScanProgress } from "@/features/webreports/ScanProgress";
import { scanStepTitle } from "@/features/webreports/stageLabel";
import { useWebReport, useWebReportActions } from "@/features/webreports/queries";
import { ArrowLeft, Download, Share2, ShieldX, RefreshCw, Trash2, Globe, ExternalLink } from "lucide-react";

export default function WebReportPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useWebReport(id);
  const actions = useWebReportActions(id);
  const report = query.data?.report;

  async function share() {
    try {
      const result = await actions.share.mutateAsync();
      const link = `${window.location.origin}${result.sharePath}`;
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard.");
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

  if (query.isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Loading executive audit report…</p>
      </div>
    );
  }

  if (query.isError || !report) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Globe className="h-6 w-6" />
        </div>
        <p role="alert" className="text-base font-semibold text-slate-900">
          This report is unavailable.
        </p>
        <p className="mt-1 text-sm text-slate-500">The audit report may have expired or was deleted.</p>
        <div className="mt-6">
          <Link
            to="/webreports/scan"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to scans
          </Link>
        </div>
      </div>
    );
  }

  const running = report.status === "queued" || report.status === "running";
  const finished = report.status === "completed";

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
      {/* Studio Header */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 print:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <Link
              to="/webreports/scan"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 hover:text-slate-950"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to scans
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1.5 font-semibold text-xs text-indigo-700 tracking-wide uppercase">
              <span>Zuvigo.com AI Audit</span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-xs font-medium text-slate-700">{report.url}</span>
            <a
              href={report.url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-600"
              title="Open website in new tab"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {running ? (
          <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-800">
            <span className="h-2 w-2 animate-ping rounded-full bg-indigo-600" />
            <span className="hidden sm:inline">{scanStepTitle(report.stage)}</span>
            <span className="sm:hidden">Scanning…</span>
          </div>
        ) : finished ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              onClick={() => window.print()}
              className="gap-1.5 bg-indigo-600 text-white shadow-xs hover:bg-indigo-700"
              size="sm"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={share}
              disabled={actions.share.isPending}
              className="gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            {report.shareToken ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={revoke}
                disabled={actions.revoke.isPending}
                className="gap-1.5 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              >
                <ShieldX className="h-3.5 w-3.5" />
                Revoke share
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={rescan}
              disabled={actions.rescan.isPending}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rescan
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={actions.remove.isPending}
              className="gap-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={remove}
            disabled={actions.remove.isPending}
            className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {running ? (
          <ScanProgress report={report} />
        ) : (
          <ReportDashboard
            report={report}
            onUpdateBranding={(b) => actions.updateBranding.mutateAsync(b)}
            isUpdatingBranding={actions.updateBranding.isPending}
          />
        )}
      </div>
    </div>
  );
}

