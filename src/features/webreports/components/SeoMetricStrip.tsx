import { ProgressRing } from "./ProgressRing";
import type { DashboardMetrics } from "../dashboardMetrics";
import { wr, wrClass } from "../semrushTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function fmt(value: number | null | undefined): string {
  if (value === null || value === undefined) return "n/a";
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

function Cell({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-[8.5rem] flex-1 flex-col gap-2 px-3 py-3.5 sm:min-w-0 sm:px-4 sm:py-4", className)}>
      <div className={wrClass.label}>{title}</div>
      {children}
    </div>
  );
}

export function SeoMetricStrip({
  metrics,
  onConnectBacklinks,
  backlinksConnected,
}: {
  metrics: DashboardMetrics;
  onConnectBacklinks?: () => void;
  backlinksConnected?: boolean;
}) {
  return (
    <section className={cn(wrClass.card, "overflow-hidden shadow-sm")} aria-label="SEO dashboard metrics">
      <div className="flex flex-col divide-y divide-[#eceef3] lg:flex-row lg:divide-x lg:divide-y-0">
        <Cell title="Organic Traffic">
          <div className={metrics.organicTraffic === null ? wrClass.metricMuted : wrClass.metricPurple}>
            {fmt(metrics.organicTraffic)}
          </div>
          <div className="text-xs text-[#6b7280]">
            Organic Keywords <span className={wrClass.metricLink}>{fmt(metrics.organicKeywords)}</span>
          </div>
          <div className="mt-auto h-0.5 w-full rounded bg-[#6b46c1]/30" />
        </Cell>

        <Cell title="Authority Score">
          <div className={metrics.authorityScore === null ? wrClass.metricMuted : wrClass.metricPurple}>
            {fmt(metrics.authorityScore)}
          </div>
          {backlinksConnected ? (
            <span className="w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Backlinks connected
            </span>
          ) : onConnectBacklinks ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-fit border-[#e3e5eb] px-2 text-[11px]"
              onClick={onConnectBacklinks}
            >
              Connect backlinks
            </Button>
          ) : (
            <span className="w-fit rounded-full bg-[#f3eefc] px-2 py-0.5 text-[10px] font-medium text-[#6b46c1]">
              Connect backlinks for score
            </span>
          )}
          <div className="space-y-0.5 text-xs text-[#6b7280]">
            <div>
              Ref. Domains <span className={wrClass.metricLink}>{fmt(metrics.refDomains)}</span>
            </div>
          </div>
        </Cell>

        <Cell title="AI Visibility">
          <div className={metrics.aiVisibility === null ? wrClass.metricMuted : wrClass.metricPurple}>
            {metrics.aiVisibility === null ? "n/a" : `${metrics.aiVisibility}%`}
          </div>
          <div className="text-xs text-[#6b7280]">
            Citations <span className="font-semibold text-[#9ca3af]">{fmt(metrics.citations)}</span>
          </div>
        </Cell>

        <Cell title="Mentions" className="min-w-[11rem]">
          <div className={metrics.mentionsTotal === null ? wrClass.metricMuted : wrClass.metricPurple}>
            {fmt(metrics.mentionsTotal)}
          </div>
          <ul className="space-y-1">
            {metrics.mentions.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-xs text-[#6b7280]">
                <span>{m.label}</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    m.status === "allowed"
                      ? "text-[#16a34a]"
                      : m.status === "blocked"
                        ? "text-[#dc2626]"
                        : "text-[#9ca3af]"
                  )}
                >
                  {m.display}
                </span>
              </li>
            ))}
          </ul>
        </Cell>

        <Cell title="Site Health">
          <div className="flex items-center gap-3">
            <ProgressRing value={metrics.siteHealth} size={52} stroke={5} color={wr.purpleRing}>
              <span className="text-sm font-bold tabular-nums text-[#6b46c1]">
                {metrics.siteHealth === null ? "—" : `${metrics.siteHealth}%`}
              </span>
            </ProgressRing>
            <div className="space-y-1 text-xs text-[#6b7280]">
              <div>
                Errors <span className={wrClass.metricLink}>{metrics.errors}</span>
              </div>
              <div>
                Warnings <span className={wrClass.metricLink}>{metrics.warnings}</span>
              </div>
            </div>
          </div>
        </Cell>
      </div>
    </section>
  );
}
