import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/services/api";
import { webreportsApi } from "@/services/webreportsApi";
import { historyFromReports } from "./dashboardMetrics";
import type { ReportListResponse, WebReport } from "./types";
import { shouldPollReport, webReportKeys } from "./keys";

export function useWebReportList() {
  return useQuery({
    queryKey: webReportKeys.list(0),
    queryFn: () => webreportsApi.list(50, 0),
    refetchInterval: (query) => {
      if (typeof document !== "undefined" && document.hidden) return false;
      const reports = query.state.data?.reports || [];
      const hasActive = reports.some(
        (r) => r.status === "queued" || r.status === "running"
      );
      return hasActive ? 2500 : false;
    },
  });
}

export function useWebReport(id: string | undefined) {
  return useQuery({
    queryKey: webReportKeys.detail(id || "none"),
    enabled: Boolean(id),
    queryFn: () => webreportsApi.get(id as string),
    refetchInterval: (query) =>
      shouldPollReport(query.state.data?.report.status, typeof document !== "undefined" && document.hidden),
  });
}

export function useWebReportHistory(host: string | undefined) {
  return useQuery({
    queryKey: webReportKeys.history(host || "none"),
    enabled: Boolean(host),
    queryFn: () => webreportsApi.history(host as string, 24),
    staleTime: 60_000,
  });
}

export function useWebReportHistoryById(id: string | undefined) {
  return useQuery({
    queryKey: webReportKeys.historyByReport(id || "none"),
    enabled: Boolean(id),
    queryFn: async ({ client }) => {
      try {
        return await webreportsApi.historyForReport(id as string, 24);
      } catch (err) {
        const status = err instanceof ApiError ? err.status : 0;
        // Production may not have /:id/history deployed yet — fall back to list.
        if (status !== 404 && status !== 400) throw err;
        const detail = client.getQueryData<{ report: WebReport }>(webReportKeys.detail(id as string));
        let host = "";
        try {
          host = new URL(detail?.report.url || "").hostname;
        } catch {
          host = "";
        }
        const cached = client.getQueryData<ReportListResponse>(webReportKeys.list(0));
        const list = cached ?? (await webreportsApi.list(50, 0));
        if (!host && detail?.report.url) {
          try {
            host = new URL(detail.report.url).hostname;
          } catch {
            /* ignore */
          }
        }
        if (!host && list.reports[0]) {
          const match = list.reports.find((r) => r.id === id);
          if (match) {
            try {
              host = new URL(match.url).hostname;
            } catch {
              /* ignore */
            }
          }
        }
        return historyFromReports(list.reports, host);
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function usePublicWebReport(token: string | undefined) {
  return useQuery({
    queryKey: webReportKeys.publicReport(token || "none"),
    enabled: Boolean(token),
    queryFn: () => webreportsApi.getPublic(token as string),
    retry: false,
  });
}

export function useCreateWebReport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: webreportsApi.create,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: webReportKeys.all });
    },
  });
}

export function useWebReportActions(id: string) {
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: webReportKeys.detail(id) });
    void client.invalidateQueries({ queryKey: webReportKeys.list(0) });
  };
  return {
    rescan: useMutation({ mutationFn: () => webreportsApi.rescan(id), onSuccess: refresh }),
    share: useMutation({ mutationFn: () => webreportsApi.share(id), onSuccess: refresh }),
    revoke: useMutation({ mutationFn: () => webreportsApi.revoke(id), onSuccess: refresh }),
    updateBranding: useMutation({
      mutationFn: (body: { companyName?: string | null; logoUrl?: string | null }) =>
        webreportsApi.updateBranding(id, body),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: () => webreportsApi.remove(id), onSuccess: refresh }),
  };
}
