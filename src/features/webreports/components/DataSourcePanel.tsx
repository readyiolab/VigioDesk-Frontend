import { useMemo, useState } from "react";
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
import { BarChart3, Flame, Settings, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { historyToChartSeries, type HistoryPoint } from "../dashboardMetrics";
import { wr, wrClass } from "../semrushTheme";

type SourceTab = "zuvigo" | "ga" | "gsc";

type MetricKey = "siteHealth" | "aiVisibility" | "pages" | "errors" | "warnings";

const METRIC_OPTS: { key: MetricKey; label: string; color: string }[] = [
  { key: "siteHealth", label: "Site Health", color: wr.purple },
  { key: "aiVisibility", label: "AI Visibility", color: wr.tealLine },
  { key: "pages", label: "Pages Crawled", color: "#6366f1" },
  { key: "errors", label: "Errors", color: wr.error },
  { key: "warnings", label: "Warnings", color: wr.warning },
];

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

function ConnectEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <h3 className="text-lg font-bold text-[#1f232b]">{title}</h3>
      <p className="max-w-md text-sm text-[#6b7280]">{description}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-2 h-10 gap-2 border-[#d1d5db] bg-white px-5 shadow-sm"
        onClick={() => {
          window.open("https://developers.google.com/identity/protocols/oauth2", "_blank", "noreferrer");
        }}
      >
        <GoogleG className="size-4" />
        Connect
      </Button>
      <p className="text-[11px] text-[#9ca3af]">OAuth connection will be available in a future update.</p>
    </div>
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
}: {
  history: HistoryPoint[];
  currentSeo: number | null;
  currentAi: number | null;
  pagesCrawled: number;
  errors: number;
  warnings: number;
  scannedAt: string | null;
}) {
  const [tab, setTab] = useState<SourceTab>("zuvigo");
  const [enabled, setEnabled] = useState<Record<MetricKey, boolean>>({
    siteHealth: true,
    aiVisibility: true,
    pages: false,
    errors: false,
    warnings: false,
  });

  const series = useMemo(() => {
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

  const tabs: { id: SourceTab; label: string; icon: React.ReactNode }[] = [
    { id: "zuvigo", label: "Zuvigo Data", icon: <Flame className="size-3.5" /> },
    { id: "ga", label: "Google Analytics", icon: <BarChart3 className="size-3.5 text-orange-500" /> },
    { id: "gsc", label: "Google Search Console", icon: <Wrench className="size-3.5 text-blue-600" /> },
  ];

  return (
    <section className={cn(wrClass.card, "overflow-hidden shadow-sm")} aria-label="Data sources and trends">
      <div className="flex items-center justify-between gap-2 border-b border-[#eceef3] px-2">
        <div className="flex flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition",
                tab === t.id
                  ? "border-[#3b82f6] bg-[#e8f1ff] text-[#1f232b]"
                  : "border-transparent text-[#6b7280] hover:bg-slate-50"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="mr-2 rounded p-1.5 text-[#9ca3af] hover:bg-slate-50 hover:text-[#6b7280]" title="Settings">
          <Settings className="size-4" />
        </button>
      </div>

      {tab === "ga" ? (
        <ConnectEmpty
          title="Connect Google Analytics"
          description="Enrich your analysis with real-time data from Google Analytics to your SEO Dashboard."
        />
      ) : null}

      {tab === "gsc" ? (
        <ConnectEmpty
          title="Connect Google Search Console"
          description="Enrich your analysis with real-time data from Google Search Console to your SEO Dashboard."
        />
      ) : null}

      {tab === "zuvigo" ? (
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {METRIC_OPTS.map((m) => (
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

          {series.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-[#9ca3af]">
              No trend history yet. Rescan this site over time to build the chart.
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8b919c" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: "#e3e5eb", fontSize: 12 }}
                    labelStyle={{ color: "#1f232b", fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {METRIC_OPTS.filter((m) => enabled[m.key]).map((m) => (
                    <Line
                      key={m.key}
                      type="monotone"
                      dataKey={m.key}
                      name={m.label}
                      stroke={m.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
