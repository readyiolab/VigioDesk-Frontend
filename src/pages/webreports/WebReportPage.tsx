import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { ReportDashboard } from "@/features/webreports/ReportDashboard";
import { ScanProgress } from "@/features/webreports/ScanProgress";
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

  if (query.isLoading) return <p className="px-4 py-10 text-sm text-muted-foreground">Loading report…</p>;
  if (query.isError || !report) {
    return (
      <p role="alert" className="px-4 py-10 text-sm">
        This report is unavailable. <Link to="/webreports/scan">Back to scans</Link>
      </p>
    );
  }

  const running = report.status === "queued" || report.status === "running";

  if (running) {
    return <ScanProgress report={report} onDelete={remove} deleting={actions.remove.isPending} />;
  }

  return (
    <div>
      <ReportDashboard
        report={report}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={share} disabled={actions.share.isPending}>
              Share
            </Button>
            <Button type="button" variant="outline" onClick={revoke} disabled={actions.revoke.isPending || !report.shareToken}>
              Revoke share
            </Button>
            <Button type="button" variant="outline" onClick={rescan} disabled={actions.rescan.isPending || running}>
              Rescan
            </Button>
            <Button type="button" variant="outline" onClick={remove} disabled={actions.remove.isPending}>
              Delete
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link to="/webreports/scan">History</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
