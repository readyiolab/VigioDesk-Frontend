import { apiFetch } from "@/services/api";
import type { HistoryPoint } from "@/features/webreports/dashboardMetrics";
import type {
  IntegrationMetrics,
  IntegrationProvider,
  IntegrationsStatus,
} from "@/features/webreports/integrationsTypes";
import type { ReportListResponse, WebReport } from "@/features/webreports/types";

export const webreportsApi = {
  create: (body: { url: string; maxPages?: number; force?: boolean }) =>
    apiFetch("/webreports", { method: "POST", body: JSON.stringify(body) }) as Promise<{
      cached: boolean;
      report: WebReport;
    }>,

  list: (limit = 20, offset = 0) =>
    apiFetch(`/webreports?limit=${limit}&offset=${offset}`) as Promise<ReportListResponse>,

  history: (host: string, limit = 24) =>
    apiFetch(`/webreports/history?host=${encodeURIComponent(host)}&limit=${limit}`) as Promise<{
      host: string;
      points: HistoryPoint[];
    }>,

  historyForReport: (id: string, limit = 24) =>
    apiFetch(`/webreports/${id}/history?limit=${limit}`) as Promise<{
      host: string;
      points: HistoryPoint[];
    }>,

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

  updateBranding: (id: string, body: { companyName?: string | null; logoUrl?: string | null }) =>
    apiFetch(`/webreports/${id}/branding`, { method: "PATCH", body: JSON.stringify(body) }) as Promise<{
      report: WebReport;
    }>,

  remove: (id: string) =>
    apiFetch(`/webreports/${id}`, { method: "DELETE" }) as Promise<{ ok: boolean }>,

  getPublic: (token: string) =>
    apiFetch(`/public/webreports/${token}`) as Promise<{ report: WebReport }>,

  integrationsStatus: () =>
    apiFetch("/webreports/integrations") as Promise<IntegrationsStatus>,

  integrationsMetrics: (host: string) =>
    apiFetch(`/webreports/integrations/metrics?host=${encodeURIComponent(host)}`) as Promise<IntegrationMetrics>,

  integrationsAuthorize: (provider: "google_analytics" | "google_search_console") =>
    apiFetch(`/webreports/integrations/${provider}/authorize`) as Promise<{ url: string; redirectUri: string }>,

  integrationsExchange: (code: string, state: string) =>
    apiFetch("/webreports/integrations/exchange", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    }) as Promise<{ provider: string; accountEmail: string | null }>,

  integrationsDisconnect: (provider: IntegrationProvider) =>
    apiFetch(`/webreports/integrations/${provider}`, { method: "DELETE" }) as Promise<{ ok: boolean }>,

  integrationsSaveBacklinks: (login: string, password: string) =>
    apiFetch("/webreports/integrations/backlinks", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    }) as Promise<{ ok: boolean }>,

  integrationsListProperties: (provider: "google_analytics" | "google_search_console") =>
    apiFetch(`/webreports/integrations/${provider}/properties`) as Promise<{
      properties?: { id: string; label: string }[];
      sites?: { id: string; label: string }[];
    }>,

  integrationsSetProperty: (
    provider: "google_analytics" | "google_search_console",
    propertyId: string,
    propertyLabel?: string
  ) =>
    apiFetch(`/webreports/integrations/${provider}/property`, {
      method: "PATCH",
      body: JSON.stringify({ propertyId, propertyLabel }),
    }) as Promise<{ ok: boolean }>,
};
