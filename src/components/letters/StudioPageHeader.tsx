import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StudioPageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-border bg-card px-4 py-4 sm:px-6",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function StudioPrimaryButton({
  children,
  className,
  size = "lg",
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button {...props} size={size} className={cn("rounded-xl", className)}>
      {children}
    </Button>
  );
}

/** Shared body padding for studio pages (non-flush layouts). */
export function StudioPageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-5 p-4 sm:p-6", className)}>{children}</div>;
}

export function StudioSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted", className || "h-24")}
      aria-hidden
    />
  );
}

/** Bordered content panel */
export function StudioSection({
  children,
  className,
  title,
  description,
  action,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StudioEmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function StudioStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "border-border bg-card text-foreground",
    success: "border-emerald-500/25 bg-emerald-500/5 text-emerald-800",
    warning: "border-amber-500/25 bg-amber-500/5 text-amber-900",
    danger: "border-destructive/25 bg-destructive/5 text-destructive",
  };
  return (
    <div className={cn("rounded-xl border p-3 shadow-sm", tones[tone])}>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}

export function StudioStepRail({
  steps,
  activeIndex,
  className,
}: {
  steps: { key: string; label: string }[];
  activeIndex: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-wrap gap-1.5", className)}>
      {steps.map((s, i) => {
        const active = i === activeIndex;
        const done = i < activeIndex;
        return (
          <li
            key={s.key}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-center text-xs font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : done
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[10px]",
                active ? "bg-white/20" : done ? "bg-primary/15" : "bg-background"
              )}
            >
              {i + 1}
            </span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

export function StudioToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2 sm:px-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StudioStatusChip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-500/15 text-emerald-800",
    warning: "bg-amber-500/15 text-amber-900",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-primary/10 text-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
