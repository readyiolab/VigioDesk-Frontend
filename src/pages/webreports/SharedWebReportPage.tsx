import { useParams } from "react-router-dom";
import { ReportDashboard } from "@/features/webreports/ReportDashboard";
import { usePublicWebReport } from "@/features/webreports/queries";

export default function SharedWebReportPage() {
  const { token = "" } = useParams();
  const query = usePublicWebReport(token);

  if (query.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading shared report…</p>
      </div>
    );
  }

  if (query.isError || !query.data?.report) {
    return (
      <p role="alert" className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-slate-600">
        This share link is invalid or has been revoked.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <ReportDashboard report={query.data.report} publicView />
    </div>
  );
}
