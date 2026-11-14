export type IntegrationProvider = "google_analytics" | "google_search_console" | "backlinks";

export interface IntegrationStatusItem {
  provider: IntegrationProvider;
  connected: boolean;
  accountEmail: string | null;
  propertyId: string | null;
  propertyLabel: string | null;
  platformBacklinksReady?: boolean;
  mode?: "byo" | "platform" | "none";
}

export interface IntegrationsStatus {
  google_analytics: IntegrationStatusItem;
  google_search_console: IntegrationStatusItem;
  backlinks: IntegrationStatusItem & { mode?: "byo" | "platform" | "none" };
}

export interface IntegrationMetrics {
  host: string;
  google_analytics: {
    connected: boolean;
    series: { date: string; sessions: number; users: number }[];
    sessions: number | null;
    users: number | null;
  };
  google_search_console: {
    connected: boolean;
    series: { date: string; clicks: number; impressions: number }[];
    clicks: number | null;
    impressions: number | null;
    keywords: { query: string; clicks: number; impressions: number; position: number }[];
  };
  backlinks: {
    connected: boolean;
    authorityScore: number | null;
    referringDomains: number | null;
    backlinks: number | null;
  };
}
