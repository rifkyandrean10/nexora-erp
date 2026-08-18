import { getReportSummary } from "@/app/actions/report";
import { ReportsPage } from "@/components/reports/reports-page";

export default async function ReportsDashboardPage() {
  const summary = await getReportSummary();

  return <ReportsPage summary={summary} />;
}
