import { useParams } from "react-router-dom";
import { ReportDashboard } from "@/features/webreports/ReportDashboard";
import { usePublicWebReport } from "@/features/webreports/queries";

export default function SharedWebReportPage() {
  const { token = "" } = useParams();
  const query = usePublicWebReport(token);

  if (query.isLoading) return <p className="px-4 py-10 text-sm text-muted-foreground">Loading shared report…</p>;
  if (query.isError || !query.data?.report) {
    return (
      <p role="alert" className="mx-auto max-w-xl px-4 py-16 text-sm">
        This share link is invalid or has been revoked.
      </p>
    );
  }

  return <ReportDashboard report={query.data.report} publicView />;
}
