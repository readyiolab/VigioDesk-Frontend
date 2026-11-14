import { cn } from "@/lib/utils";
import { wr } from "../semrushTheme";

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  color = wr.purpleRing,
  track = "#e8e9ee",
  className,
  children,
}: {
  value: number | null;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      {children ? <div className="absolute inset-0 flex items-center justify-center">{children}</div> : null}
    </div>
  );
}

export function SemiGauge({
  value,
  size = 140,
  stroke = 12,
  color = wr.purpleRing,
  track = "#e8e9ee",
  className,
  children,
}: {
  value: number | null;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circumference;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)} style={{ width: size }}>
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      {children ? (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-1">{children}</div>
      ) : null}
    </div>
  );
}

export function StackedStatusBar({
  segments,
  className,
}: {
  segments: { key: string; value: number; color: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={cn("flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      {segments.map((seg) =>
        seg.value > 0 ? (
          <div
            key={seg.key}
            title={`${seg.key}: ${seg.value}`}
            style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
            className="h-full"
          />
        ) : null
      )}
    </div>
  );
}
