import React from "react";
import { Check, FileUp, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStep } from "@/lib/design-tokens";

interface ProcessingStepperProps {
  currentStep: ProcessingStep;
  /** Middle step label, e.g. "Merging" */
  toolLabel?: string;
  className?: string;
}

type UiStepKey = "select" | "action" | "download";

function getUiStepStatus(
  stepKey: UiStepKey,
  currentStep: ProcessingStep
): "completed" | "active" | "pending" {
  if (currentStep === "done") return "completed";
  if (currentStep === "failed") {
    if (stepKey === "select") return "completed";
    if (stepKey === "action") return "active";
    return "pending";
  }
  // upload | queue | poll | idle (while processing UI is shown)
  if (stepKey === "select") return "completed";
  if (stepKey === "action") return "active";
  return "pending";
}

export const ProcessingStepper: React.FC<ProcessingStepperProps> = ({
  currentStep,
  toolLabel = "Working",
  className,
}) => {
  if (currentStep === "idle") return null;

  const steps = [
    { key: "select" as const, label: "Select", icon: FileUp },
    { key: "action" as const, label: toolLabel, icon: Loader2 },
    { key: "download" as const, label: "Download", icon: Download },
  ];

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const status = getUiStepStatus(step.key, currentStep);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500",
                    status === "completed" && "border-emerald-500 bg-emerald-500 text-white",
                    status === "active" && "border-primary bg-primary/10 text-primary",
                    status === "pending" && "border-white/20 bg-white/5 text-white/40"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="h-4 w-4 animate-scale-in" />
                  ) : status === "active" ? (
                    <Icon className={cn("h-4 w-4", step.key === "action" && "animate-spin")} />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold transition-colors",
                    status === "completed" && "text-emerald-400",
                    status === "active" && "text-white font-bold",
                    status === "pending" && "text-white/40"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className="flex-1 mx-2 mb-6">
                  <div className="h-0.5 w-full rounded-full bg-white/15 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        getUiStepStatus(steps[i + 1].key, currentStep) !== "pending"
                          ? "bg-emerald-500 w-full"
                          : getUiStepStatus(step.key, currentStep) === "active"
                            ? "bg-primary/50 w-1/2 animate-pulse"
                            : getUiStepStatus(step.key, currentStep) === "completed"
                              ? "bg-emerald-500 w-full"
                              : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
