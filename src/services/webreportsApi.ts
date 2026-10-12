import { apiFetch } from "@/services/api";
import type { ReportListResponse, WebReport } from "@/features/webreports/types";

export const webreportsApi = {
  create: (body: { url: string; maxPages?: number; force?: boolean }) =>
    apiFetch("/webreports", { method: "POST", body: JSON.stringify(body) }) as Promise<{
      cached: boolean;
      report: WebReport;
    }>,

  list: (limit = 20, offset = 0) =>
    apiFetch(`/webreports?limit=${limit}&offset=${offset}`) as Promise<ReportListResponse>,

  get: (id: string) =>
    apiFetch(`/webreports/${id}`) as Promise<{ report: WebReport }>,

  rescan: (id: string) =>
    apiFetch(`/webreports/${id}/rescan`, { method: "POST", body: JSON.stringify({}) }) as Promise<{
      report: WebReport;
    }>,

  share: (id: string) =>
    apiFetch(`/webreports/${id}/share`, { method: "POST", body: JSON.stringify({}) }) as Promise<{
      shareToken: string;
      sharePath: string;
    }>,

  revoke: (id: string) =>
    apiFetch(`/webreports/${id}/share`, { method: "DELETE" }) as Promise<{ ok: boolean }>,

  remove: (id: string) =>
    apiFetch(`/webreports/${id}`, { method: "DELETE" }) as Promise<{ ok: boolean }>,

  getPublic: (token: string) =>
    apiFetch(`/public/webreports/${token}`) as Promise<{ report: WebReport }>,
};
