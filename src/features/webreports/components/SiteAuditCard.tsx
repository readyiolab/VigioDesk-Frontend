import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SemiGauge, StackedStatusBar } from "./ProgressRing";
import type { DashboardMetrics } from "../dashboardMetrics";
import { wr, wrClass } from "../semrushTheme";

export function SiteAuditCard({
  metrics,
  onViewFull,
}: {
  metrics: DashboardMetrics;
  onViewFull?: () => void;
}) {
  const { crawled } = metrics;
  const segments = [
    { key: "Healthy", value: crawled.healthy, color: wr.healthy },
    { key: "Broken", value: crawled.broken, color: wr.broken },
    { key: "Have issues", value: crawled.haveIssues, color: wr.issues },
    { key: "Redirect", value: crawled.redirect, color: wr.redirect },
    { key: "Blocked", value: crawled.blocked, color: wr.blocked },
  ];

  return (
    <section className="space-y-2" aria-labelledby="site-audit-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="site-audit-heading" className="flex items-center gap-1.5 text-base font-bold text-[#1f232b]">
            Site Audit
            <Info className="size-3.5 text-[#9ca3af]" aria-hidden />
          </h2>
          <p className="mt-0.5 text-xs text-[#8b919c]">Updated: {metrics.scannedLabel}</p>
        </div>
      </div>

      <div className={cn(wrClass.card, "p-4 shadow-sm")}>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-[#6b7280]">
              Site Health
              <Info className="size-3 text-[#9ca3af]" aria-hidden />
            </div>
            <SemiGauge value={metrics.siteHealth} size={150} stroke={14} color={wr.purpleRing}>
              <div className="text-center">
                <div className="text-2xl font-bold tabular-nums text-[#3b5bdb]">
                  {metrics.siteHealth === null ? "—" : `${metrics.siteHealth}%`}
                </div>
                <div className="text-[11px] text-[#8b919c]">from crawl</div>
              </div>
            </SemiGauge>
          </div>

          <div className="flex flex-col justify-center gap-5">
            <div>
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#6b7280]">
                Errors
                <Info className="size-3 text-[#9ca3af]" aria-hidden />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums text-[#dc2626]">{metrics.errors}</span>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#6b7280]">
                Warnings
                <Info className="size-3 text-[#9ca3af]" aria-hidden />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums text-[#ea580c]">{metrics.warnings}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-[#6b7280]">
              Crawled Pages
              <Info className="size-3 text-[#9ca3af]" aria-hidden />
            </div>
            <div className="text-3xl font-bold tabular-nums text-[#6b46c1]">{crawled.total}</div>
            <StackedStatusBar className="mt-3" segments={segments} />
            <ul className="mt-3 space-y-1.5 text-xs text-[#6b7280]">
              {segments.map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    {s.key}
                  </span>
                  <span className="font-semibold tabular-nums text-[#1f232b]">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {onViewFull ? (
          <div className="mt-5">
            <Button type="button" variant="outline" size="sm" className="h-8 border-[#e3e5eb] text-xs" onClick={onViewFull}>
              View full report
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
