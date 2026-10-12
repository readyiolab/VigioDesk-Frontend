import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { ReportDashboard } from "@/features/webreports/ReportDashboard";
import { ScanProgress } from "@/features/webreports/ScanProgress";
import { scanStepTitle } from "@/features/webreports/stageLabel";
import { useWebReport, useWebReportActions } from "@/features/webreports/queries";

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

  if (query.isLoading) return <p className="px-4 py-10 text-sm text-slate-500">Loading report…</p>;
  if (query.isError || !report) {
    return (
      <p role="alert" className="px-4 py-10 text-sm text-slate-700">
        This report is unavailable. <Link to="/webreports/scan">Back to scans</Link>
      </p>
    );
  }

  const running = report.status === "queued" || report.status === "running";
  const finished = report.status === "completed";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F9FC] text-slate-900">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 print:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-sm font-semibold tracking-tight text-slate-950">Readyio WebReports</p>
            <Link to="/webreports/scan" className="shrink-0 text-sm text-blue-700 hover:underline">
              Back to scans
            </Link>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{report.url}</p>
        </div>
        {running ? (
          <p className="hidden shrink-0 text-sm font-medium text-slate-700 sm:block">{scanStepTitle(report.stage)}</p>
        ) : finished ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <Button type="button" onClick={() => window.print()}>
              Download PDF
            </Button>
            <Button type="button" variant="outline" onClick={share} disabled={actions.share.isPending}>
              Share
            </Button>
            <Button type="button" variant="outline" onClick={revoke} disabled={actions.revoke.isPending || !report.shareToken}>
              Revoke share
            </Button>
            <Button type="button" variant="outline" onClick={rescan} disabled={actions.rescan.isPending}>
              Rescan
            </Button>
            <Button type="button" variant="outline" onClick={remove} disabled={actions.remove.isPending}>
              Delete
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={remove} disabled={actions.remove.isPending}>
            Delete
          </Button>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {running ? <ScanProgress report={report} /> : <ReportDashboard report={report} />}
      </div>
    </div>
  );
}
