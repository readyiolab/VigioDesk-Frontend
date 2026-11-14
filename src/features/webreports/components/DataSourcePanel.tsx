import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Flame, Link2, Settings, Wrench } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { historyToChartSeries, type HistoryPoint } from "../dashboardMetrics";
import type { IntegrationMetrics, IntegrationsStatus } from "../integrationsTypes";
import { useWebReportIntegrationActions } from "../queries";
import { wr, wrClass } from "../semrushTheme";

type SourceTab = "zuvigo" | "ga" | "gsc" | "backlinks";

type MetricKey = "siteHealth" | "aiVisibility" | "pages" | "errors" | "warnings" | "sessions" | "clicks";

function GoogleG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function DataSourcePanel({
  history,
  currentSeo,
  currentAi,
  pagesCrawled,
  errors,
  warnings,
  scannedAt,
  host,
  integrations,
  metrics,
  publicView,
  focusTab,
}: {
  history: HistoryPoint[];
  currentSeo: number | null;
  currentAi: number | null;
  pagesCrawled: number;
  errors: number;
  warnings: number;
  scannedAt: string | null;
  host: string;
  integrations?: IntegrationsStatus;
  metrics?: IntegrationMetrics | null;
  publicView?: boolean;
  focusTab?: SourceTab;
}) {
  const [tab, setTab] = useState<SourceTab>(focusTab || "zuvigo");
  useEffect(() => {
    if (focusTab) setTab(focusTab);
  }, [focusTab]);
  const [enabled, setEnabled] = useState<Record<MetricKey, boolean>>({
    siteHealth: true,
    aiVisibility: true,
    pages: false,
    errors: false,
    warnings: false,
    sessions: true,
    clicks: true,
  });
  const [backlinkLogin, setBacklinkLogin] = useState("");
  const [backlinkPassword, setBacklinkPassword] = useState("");
  const [properties, setProperties] = useState<{ id: string; label: string }[]>([]);
  const actions = useWebReportIntegrationActions();

  const zuvigoSeries = useMemo(() => {
    const fromHistory = historyToChartSeries(history);
    if (fromHistory.length > 0) return fromHistory;
    if (!scannedAt) return [];
    return [
      {
        date: scannedAt,
        label: new Date(scannedAt).toLocaleString(undefined, { month: "short", day: "numeric" }),
        siteHealth: currentSeo,
        aiVisibility: currentAi,
        overall: currentSeo,
        pages: pagesCrawled,
        errors,
        warnings,
      },
    ];
  }, [history, scannedAt, currentSeo, currentAi, pagesCrawled, errors, warnings]);

  const gaSeries = useMemo(
    () =>
      (metrics?.google_analytics.series || []).map((p) => ({
        ...p,
        label: new Date(p.date).toLocaleString(undefined, { month: "short", day: "numeric" }),
      })),
    [metrics]
  );

  const gscSeries = useMemo(
    () =>
      (metrics?.google_search_console.series || []).map((p) => ({
        ...p,
        label: new Date(p.date).toLocaleString(undefined, { month: "short", day: "numeric" }),
      })),
    [metrics]
  );

  async function connectGoogle(provider: "google_analytics" | "google_search_console") {
    try {
      localStorage.setItem("webreports_oauth_return_to", window.location.pathname + window.location.search);
      const { url } = await actions.authorize.mutateAsync(provider);
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start Google connect");
    }
  }

  async function loadProperties(provider: "google_analytics" | "google_search_console") {
    try {
      const res = await actions.listProperties.mutateAsync(provider);
      const list = res.properties || res.sites || [];
      setProperties(list);
      if (!list.length) toast.message("No properties found for this Google account.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load properties");
    }
  }

  async function selectProperty(provider: "google_analytics" | "google_search_console", id: string, label: string) {
    try {
      await actions.setProperty.mutateAsync({ provider, propertyId: id, propertyLabel: label });
      toast.success("Property saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save property");
    }
  }

  async function saveBacklinks() {
    try {
      await actions.saveBacklinks.mutateAsync({ login: backlinkLogin, password: backlinkPassword });
      setBacklinkPassword("");
      toast.success("Backlinks API connected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save DataForSEO credentials");
    }
  }

  const tabs: { id: SourceTab; label: string; icon: React.ReactNode }[] = [
    { id: "zuvigo", label: "Zuvigo Data", icon: <Flame className="size-3.5" /> },
    { id: "ga", label: "Google Analytics", icon: <BarChart3 className="size-3.5 text-orange-500" /> },
    { id: "gsc", label: "Google Search Console", icon: <Wrench className="size-3.5 text-blue-600" /> },
    { id: "backlinks", label: "Backlinks", icon: <Link2 className="size-3.5 text-[#6b46c1]" /> },
  ];

  const zuvigoOpts: { key: MetricKey; label: string; color: string }[] = [
    { key: "siteHealth", label: "Site Health", color: wr.purple },
    { key: "aiVisibility", label: "AI Visibility", color: wr.tealLine },
    { key: "pages", label: "Pages Crawled", color: "#6366f1" },
    { key: "errors", label: "Errors", color: wr.error },
    { key: "warnings", label: "Warnings", color: wr.warning },
  ];

  return (
    <section className={cn(wrClass.card, "overflow-hidden shadow-sm")} aria-label="Data sources and trends">
      <div className="flex items-center justify-between gap-2 border-b border-[#eceef3] px-1 sm:px-2">
        <div className="flex flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-xs font-semibold transition sm:px-3",
                tab === t.id
                  ? "border-[#3b82f6] bg-[#e8f1ff] text-[#1f232b]"
                  : "border-transparent text-[#6b7280] hover:bg-slate-50"
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.id === "zuvigo" ? "Zuvigo" : t.id === "ga" ? "GA" : t.id === "gsc" ? "GSC" : "Links"}</span>
            </button>
          ))}
        </div>
        <button type="button" className="mr-2 rounded p-1.5 text-[#9ca3af] hover:bg-slate-50" title="Settings" aria-label="Settings">
          <Settings className="size-4" />
        </button>
      </div>

      {tab === "zuvigo" ? (
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {zuvigoOpts.map((m) => (
              <label key={m.key} className="flex cursor-pointer items-center gap-1.5 text-xs text-[#4b5563]">
                <input
                  type="checkbox"
                  checked={enabled[m.key]}
                  onChange={() => setEnabled((prev) => ({ ...prev, [m.key]: !prev[m.key] }))}
                  className="size-3.5 rounded border-slate-300"
                  style={{ accentColor: m.color }}
                />
                <span className="inline-block size-2 rounded-full" style={{ backgroundColor: m.color }} />
                {m.label}
              </label>
            ))}
          </div>
          {zuvigoSeries.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-[#9ca3af]">
              No trend history yet. Rescan this site over time to build the chart.
            </div>
          ) : (
            <div className="h-[240px] w-full sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={zuvigoSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e3e5eb", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {zuvigoOpts
                    .filter((m) => enabled[m.key])
                    .map((m) => (
                      <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}

      {tab === "ga" ? (
        <ConnectedPanel
          title="Connect Google Analytics"
          description="Enrich your analysis with real-time sessions and users from Google Analytics."
          connected={Boolean(integrations?.google_analytics.connected)}
          accountEmail={integrations?.google_analytics.accountEmail}
          propertyLabel={integrations?.google_analytics.propertyLabel}
          publicView={publicView}
          onConnect={() => void connectGoogle("google_analytics")}
          onDisconnect={() => void actions.disconnect.mutateAsync("google_analytics").then(() => toast.success("Disconnected"))}
          onLoadProperties={() => void loadProperties("google_analytics")}
          properties={properties}
          onSelectProperty={(id, label) => void selectProperty("google_analytics", id, label)}
          connecting={actions.authorize.isPending}
        >
          {gaSeries.length > 0 ? (
            <div className="space-y-2">
              <div className="flex gap-4 text-xs text-[#6b7280]">
                <span>
                  Sessions <strong className="text-[#6b46c1]">{metrics?.google_analytics.sessions ?? 0}</strong>
                </span>
                <span>
                  Users <strong className="text-[#6b46c1]">{metrics?.google_analytics.users ?? 0}</strong>
                </span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gaSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e3e5eb", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="sessions" name="Sessions" stroke={wr.purple} strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="users" name="Users" stroke={wr.tealLine} strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : integrations?.google_analytics.connected ? (
            <p className="py-8 text-center text-sm text-[#9ca3af]">
              Connected{integrations.google_analytics.propertyLabel ? ` · ${integrations.google_analytics.propertyLabel}` : ""}.
              Select a property if the chart is empty.
            </p>
          ) : null}
        </ConnectedPanel>
      ) : null}

      {tab === "gsc" ? (
        <ConnectedPanel
          title="Connect Google Search Console"
          description="Enrich your analysis with clicks, impressions, and queries from Search Console."
          connected={Boolean(integrations?.google_search_console.connected)}
          accountEmail={integrations?.google_search_console.accountEmail}
          propertyLabel={integrations?.google_search_console.propertyLabel}
          publicView={publicView}
          onConnect={() => void connectGoogle("google_search_console")}
          onDisconnect={() =>
            void actions.disconnect.mutateAsync("google_search_console").then(() => toast.success("Disconnected"))
          }
          onLoadProperties={() => void loadProperties("google_search_console")}
          properties={properties}
          onSelectProperty={(id, label) => void selectProperty("google_search_console", id, label)}
          connecting={actions.authorize.isPending}
        >
          {gscSeries.length > 0 ? (
            <div className="space-y-2">
              <div className="flex gap-4 text-xs text-[#6b7280]">
                <span>
                  Clicks <strong className="text-[#6b46c1]">{metrics?.google_search_console.clicks ?? 0}</strong>
                </span>
                <span>
                  Impressions <strong className="text-[#6b46c1]">{metrics?.google_search_console.impressions ?? 0}</strong>
                </span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gscSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e3e5eb", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="clicks" name="Clicks" stroke={wr.purple} strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="impressions" name="Impressions" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : integrations?.google_search_console.connected ? (
            <p className="py-8 text-center text-sm text-[#9ca3af]">Connected for {host}. Select a site property if needed.</p>
          ) : null}
        </ConnectedPanel>
      ) : null}

      {tab === "backlinks" ? (
        <div className="space-y-4 p-5">
          {integrations?.backlinks.connected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#1f232b]">Backlinks connected</p>
                  <p className="text-xs text-[#6b7280]">
                    Mode: {integrations.backlinks.mode || "platform"}
                    {integrations.backlinks.accountEmail ? ` · ${integrations.backlinks.accountEmail}` : ""}
                  </p>
                </div>
                {!publicView && integrations.backlinks.mode === "byo" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => void actions.disconnect.mutateAsync("backlinks").then(() => toast.success("Disconnected"))}
                  >
                    Disconnect
                  </Button>
                ) : null}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MetricTile label="Authority" value={metrics?.backlinks.authorityScore} />
                <MetricTile label="Ref. Domains" value={metrics?.backlinks.referringDomains} />
                <MetricTile label="Backlinks" value={metrics?.backlinks.backlinks} />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-md space-y-3 text-center">
              <h3 className="text-lg font-bold text-[#1f232b]">Connect backlinks</h3>
              <p className="text-sm text-[#6b7280]">
                Use platform DataForSEO credentials, or paste your own login and password to unlock Authority Score and
                referring domains.
              </p>
              {!publicView ? (
                <div className="space-y-2 text-left">
                  <Input
                    value={backlinkLogin}
                    onChange={(e) => setBacklinkLogin(e.target.value)}
                    placeholder="DataForSEO login"
                    className="h-9"
                  />
                  <Input
                    type="password"
                    value={backlinkPassword}
                    onChange={(e) => setBacklinkPassword(e.target.value)}
                    placeholder="DataForSEO password"
                    className="h-9"
                  />
                  <Button
                    type="button"
                    className="h-9 w-full bg-[#1f232b] hover:bg-black"
                    disabled={actions.saveBacklinks.isPending}
                    onClick={() => void saveBacklinks()}
                  >
                    Save API key
                  </Button>
                  {integrations?.backlinks.platformBacklinksReady ? (
                    <p className="text-center text-[11px] text-[#16a34a]">Platform backlinks are also configured on the server.</p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-[#9ca3af]">Sign in to connect backlinks.</p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: number | null | undefined }) {
  const shown =
    value === null || value === undefined
      ? "n/a"
      : value >= 1000
        ? `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`
        : String(value);
  return (
    <div className="rounded-lg border border-[#eceef3] bg-[#f8f9fb] px-3 py-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#8b919c]">{label}</div>
      <div className={cn("mt-1 text-xl font-bold tabular-nums", shown === "n/a" ? "text-[#9ca3af]" : "text-[#6b46c1]")}>
        {shown}
      </div>
    </div>
  );
}

function ConnectedPanel({
  title,
  description,
  connected,
  accountEmail,
  propertyLabel,
  publicView,
  onConnect,
  onDisconnect,
  onLoadProperties,
  properties,
  onSelectProperty,
  connecting,
  children,
}: {
  title: string;
  description: string;
  connected: boolean;
  accountEmail?: string | null;
  propertyLabel?: string | null;
  publicView?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onLoadProperties: () => void;
  properties: { id: string; label: string }[];
  onSelectProperty: (id: string, label: string) => void;
  connecting?: boolean;
  children?: React.ReactNode;
}) {
  if (!connected) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <h3 className="text-lg font-bold text-[#1f232b]">{title}</h3>
        <p className="max-w-md text-sm text-[#6b7280]">{description}</p>
        {!publicView ? (
          <Button
            type="button"
            variant="outline"
            className="mt-1 h-10 gap-2 border-[#d1d5db] bg-white px-5 shadow-sm"
            disabled={connecting}
            onClick={onConnect}
          >
            <GoogleG className="size-4" />
            Connect
          </Button>
        ) : (
          <p className="text-xs text-[#9ca3af]">Sign in to connect this data source.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1f232b]">Connected</p>
          <p className="truncate text-xs text-[#6b7280]">
            {accountEmail || "Google account"}
            {propertyLabel ? ` · ${propertyLabel}` : ""}
          </p>
        </div>
        {!publicView ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={onLoadProperties}>
              Choose property
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={onDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : null}
      </div>
      {properties.length > 0 ? (
        <div className="max-h-36 overflow-y-auto rounded-md border border-[#eceef3]">
          {properties.map((p) => (
            <button
              key={p.id}
              type="button"
              className="block w-full truncate border-b border-[#eceef3] px-3 py-2 text-left text-xs hover:bg-[#f8f9fb] last:border-b-0"
              onClick={() => onSelectProperty(p.id, p.label)}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}
