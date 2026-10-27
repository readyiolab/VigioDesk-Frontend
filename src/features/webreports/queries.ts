import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { webreportsApi } from "@/services/webreportsApi";
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
