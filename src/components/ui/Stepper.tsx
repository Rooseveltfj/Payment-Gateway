"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isActive = stepIdx === currentStep;
          const isComplete = stepIdx < currentStep;

          return (
            <li key={step.id} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "")}>
              {/* Connection Line */}
              {stepIdx !== steps.length - 1 && (
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className={cn("h-0.5 w-full", isComplete ? "bg-primary" : "bg-hover")} />
                </div>
              )}
              
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  isActive
                    ? "border-2 border-primary bg-background ring-4 ring-background"
                    : isComplete
                    ? "bg-primary text-white"
                    : "bg-hover border-2 border-hover text-text-secondary group-hover:bg-hover/80"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <span className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-text-secondary")}>
                    {stepIdx + 1}
                  </span>
                )}
              </div>
              
              {/* Title Below Step */}
              <div 
                className={cn(
                  "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium",
                  isActive || isComplete ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {step.title}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
