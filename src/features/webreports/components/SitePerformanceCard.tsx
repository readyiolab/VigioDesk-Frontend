import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "./ProgressRing";
import type { DashboardMetrics } from "../dashboardMetrics";
import { wrClass } from "../semrushTheme";

export function SitePerformanceCard({
  metrics,
  onViewFull,
}: {
  metrics: DashboardMetrics;
  onViewFull?: () => void;
}) {
  return (
    <section className="space-y-2" aria-labelledby="site-performance-heading">
      <h2 id="site-performance-heading" className={wrClass.sectionTitle}>
        Site Performance
      </h2>
      <div className={cn(wrClass.card, "p-4 shadow-sm")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1f232b]">
              Position Tracking
              <Info className="size-3.5 text-[#9ca3af]" aria-hidden />
            </div>
            <p className="mt-0.5 text-xs text-[#8b919c]">Updated: {metrics.scannedLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
            <span className="rounded-md border border-[#e3e5eb] bg-[#f8f9fb] px-2 py-1">Worldwide · English</span>
            <span className="rounded-md border border-[#e3e5eb] bg-[#f8f9fb] px-2 py-1">Last scan</span>
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#8b919c]">
              Keywords
              <Info className="size-3 text-[#9ca3af]" aria-hidden />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ProgressRing value={metrics.top3 > 0 ? Math.min(100, metrics.top3 * 20) : 0} size={44} stroke={4} color="#94a3b8">
                  <span className="text-[10px] font-bold text-slate-500">3</span>
                </ProgressRing>
                <div>
                  <div className="text-xs text-[#8b919c]">Top 3</div>
                  <div className="text-2xl font-bold tabular-nums text-[#3b5bdb]">{metrics.top3}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ProgressRing value={metrics.top10 > 0 ? Math.min(100, metrics.top10 * 10) : 0} size={44} stroke={4} color="#94a3b8">
                  <span className="text-[10px] font-bold text-slate-500">10</span>
                </ProgressRing>
                <div>
                  <div className="text-xs text-[#8b919c]">Top 10</div>
                  <div className="text-2xl font-bold tabular-nums text-[#3b5bdb]">{metrics.top10}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#8b919c]">
              Top Keywords
              <Info className="size-3 text-[#9ca3af]" aria-hidden />
            </div>
            <div className="overflow-hidden rounded-md border border-[#eceef3]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-wide text-[#8b919c]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Keywords</th>
                    <th className="px-3 py-2 font-medium">Position</th>
                    <th className="px-3 py-2 font-medium">Visibility</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topKeywords.map((row) => (
                    <tr key={row.keyword} className="border-t border-[#eceef3]">
                      <td className="px-3 py-2.5 font-medium text-[#3b5bdb]">{row.keyword}</td>
                      <td className="px-3 py-2.5 tabular-nums text-[#6b7280]">
                        {row.position === null ? "—" : row.position}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-[#6b7280]">{row.visibility}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-[#9ca3af]">
              Rank positions require Search Console or a rank-tracking connection. Showing topic hints from this audit.
            </p>
          </div>
        </div>

        {onViewFull ? (
          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" className="h-8 border-[#e3e5eb] text-xs" onClick={onViewFull}>
              View full report
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
