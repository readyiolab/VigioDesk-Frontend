import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, Check, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { useLetterStudioHome } from "@/features/letters";
import { cn } from "@/lib/utils";
import {
  StudioPageHeader,
  StudioPrimaryButton,
  StudioPageBody,
  StudioSkeleton,
  StudioSection,
  StudioEmptyState,
  StudioStatusChip,
} from "@/components/letters/StudioPageHeader";
import {
  LETTER_HOW_IT_WORKS,
  LETTER_STEP_META,
  computeLetterNextStep,
} from "@/lib/letterOnboarding";

export default function LettersHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const homeQuery = useLetterStudioHome(user?.id);

  useEffect(() => {
    if (homeQuery.data?.warning) toast.message(homeQuery.data.warning);
  }, [homeQuery.data?.warning]);

  useEffect(() => {
    if (homeQuery.error) {
      toast.error(
        homeQuery.error instanceof Error
          ? homeQuery.error.message
          : "Failed to open Letter Studio"
      );
    }
  }, [homeQuery.error]);

  const orgName = homeQuery.data?.orgName ?? "";
  const loading = homeQuery.isLoading;
  const batches = homeQuery.data?.batches?.slice(0, 8) ?? [];
  const brandCount = homeQuery.data?.brandCount ?? 0;
  const templateCount = homeQuery.data?.templateCount ?? 0;
  const hasSentBefore = batches.length > 0;

  const activeStep = useMemo(
    () =>
      computeLetterNextStep({
        brandCount,
        templateCount,
        batchCount: batches.length,
      }),
    [brandCount, templateCount, batches.length]
  );

  const done = {
    1: brandCount > 0,
    2: templateCount > 0,
    3: batches.length > 0,
  } as const;

  const current = LETTER_STEP_META.find((s) => s.n === activeStep)!;
  const isFree = user?.plan === "FREE";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4 sm:p-6">
        <StudioSkeleton className="h-8 w-48" />
        <StudioSkeleton className="h-32 w-full max-w-xl" />
        <p className="text-sm text-muted-foreground">Preparing your workspace.</p>
      </div>
    );
  }

  const primaryCta =
    templateCount > 0
      ? { label: "Send letters", to: "/letters/batches/new" }
      : { label: `Continue: ${current.short}`, to: current.to };

  return (
    <div className="flex min-h-full flex-col">
      <StudioPageHeader
        title={orgName || "Your organization"}
        description={
          hasSentBefore
            ? "Send the same letter to many people from Excel."
            : "Send the same letter to many people — pick a letter, add Excel, download PDFs."
        }
        action={
          <StudioPrimaryButton onClick={() => navigate(primaryCta.to)}>
            {primaryCta.label}
            <ArrowRight className="ml-1.5 size-4" />
          </StudioPrimaryButton>
        }
      />

      <StudioPageBody>
        {isFree && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-950">
            Free plan: up to 5 employees per send, email sending disabled (you can still
            download PDFs).{" "}
            <Link to="/billing" className="font-semibold underline underline-offset-2">
              Upgrade to PRO
            </Link>
          </div>
        )}

        {!hasSentBefore && (
          <StudioSection title="How it works">
            <ol className="space-y-2 px-4 py-4">
              {LETTER_HOW_IT_WORKS.map((line, i) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-foreground">{line}</span>
                </li>
              ))}
            </ol>
          </StudioSection>
        )}

        {hasSentBefore ? (
          <RecentLettersSection batches={batches} navigate={navigate} />
        ) : (
          <>
            <SetupChecklist activeStep={activeStep} done={done} navigate={navigate} />
            <RecentLettersSection batches={batches} navigate={navigate} />
          </>
        )}
      </StudioPageBody>
    </div>
  );
}

function SetupChecklist({
  activeStep,
  done,
  navigate,
}: {
  activeStep: 1 | 2 | 3;
  done: { 1: boolean; 2: boolean; 3: boolean };
  navigate: (to: string) => void;
}) {
  return (
    <StudioSection
      title="Your progress"
      description={`Next up: ${LETTER_STEP_META.find((s) => s.n === activeStep)?.title}`}
    >
      <ol className="grid md:grid-cols-3">
        {LETTER_STEP_META.map((step, idx) => {
          const isActive = step.n === activeStep;
          const isDone = done[step.n as 1 | 2 | 3];
          return (
            <li
              key={step.n}
              className={cn(
                "flex flex-col gap-3 p-4",
                idx > 0 && "md:border-l md:border-border",
                idx < LETTER_STEP_META.length - 1 && "border-b border-border md:border-b-0",
                isActive && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    isDone && !isActive
                      ? "bg-emerald-500/15 text-emerald-700"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone && !isActive ? <Check className="size-4" /> : step.n}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  {step.recommended && !isDone && (
                    <StudioStatusChip tone="default">Recommended</StudioStatusChip>
                  )}
                  {isActive && (
                    <span className="mt-1 inline-block">
                      <StudioStatusChip tone="info">You are here</StudioStatusChip>
                    </span>
                  )}
                  {isDone && !isActive && (
                    <span className="mt-1 block text-[11px] font-medium text-emerald-700">
                      Done
                    </span>
                  )}
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={isActive ? "default" : "outline"}
                className="mt-auto h-9 w-full rounded-xl"
                onClick={() => navigate(step.to)}
              >
                {step.cta}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </li>
          );
        })}
      </ol>
    </StudioSection>
  );
}

function RecentLettersSection({
  batches,
  navigate,
}: {
  batches: {
    id: string;
    templateName?: string;
    totalRows?: number;
    status?: string;
    createdAt: string;
  }[];
  navigate: (to: string) => void;
}) {
  return (
    <StudioSection
      title="Recent sends"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-primary"
          onClick={() => navigate("/letters/history")}
        >
          View all
        </Button>
      }
    >
      {batches.length === 0 ? (
        <StudioEmptyState
          icon={<FileSpreadsheet className="size-5" />}
          title="No sends yet"
          description="Pick a letter, add Excel, then Make PDFs."
        />
      ) : (
        <div className="divide-y divide-border">
          {batches.map((b) => (
            <Link
              key={b.id}
              to={`/letters/batches/${b.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-muted/50"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">
                  {b.templateName || "Letter send"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {b.totalRows} people · {hubBatchStatus(b.status)} ·{" "}
                  {new Date(b.createdAt).toLocaleString()}
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </StudioSection>
  );
}

function hubBatchStatus(status?: string): string {
  switch (status) {
    case "GENERATED":
      return "Ready";
    case "GENERATING":
      return "Making PDFs";
    case "SENDING":
      return "Sending";
    case "SENT":
      return "Sent";
    case "FAILED":
    case "CANCELLED":
      return "Needs fix";
    default:
      return "In progress";
  }
}
