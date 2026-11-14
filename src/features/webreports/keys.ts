export const webReportKeys = {
  all: ["webreports"] as const,
  list: (offset: number) => ["webreports", "list", offset] as const,
  detail: (id: string) => ["webreports", "detail", id] as const,
  history: (host: string) => ["webreports", "history", host] as const,
  historyByReport: (id: string) => ["webreports", "history-by-report", id] as const,
  integrations: ["webreports", "integrations"] as const,
  integrationMetrics: (host: string) => ["webreports", "integration-metrics", host] as const,
  publicReport: (token: string) => ["webreports", "public", token] as const,
};

export function shouldPollReport(status: string | undefined, hidden: boolean): number | false {
  if (hidden) return false;
  if (!status || status === "completed" || status === "failed") return false;
  return 2000;
}
