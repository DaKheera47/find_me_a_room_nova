"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  completed: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                step.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep === step.number
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground/50",
              )}
            >
              {step.completed ? <Check className="size-4" /> : step.number}
            </div>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                step.completed || currentStep === step.number
                  ? "text-foreground"
                  : "text-muted-foreground/50",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-8 transition-colors sm:w-12",
                step.completed ? "bg-primary" : "bg-muted-foreground/30",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
