"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

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
    <nav aria-label="Progress" className="w-full">
      <ol role="list" className="flex items-center justify-between w-full relative">
        {steps.map((step, stepIdx) => {
          const isActive = stepIdx === currentStep;
          const isComplete = stepIdx < currentStep;
          const isLast = stepIdx === steps.length - 1;

          return (
            <li key={step.id} className={cn("relative flex flex-col items-center", !isLast ? "flex-1" : "flex-none")}>
              {/* Connection Line */}
              {!isLast && (
                <div className="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-[16px] h-[2px] bg-white/[0.06]" aria-hidden="true">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: isComplete ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#8b5cf6]" 
                  />
                </div>
              )}
              
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                  isActive
                    ? "bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                    : isComplete
                    ? "bg-[#8b5cf6] text-white"
                    : "bg-white/[0.06] border border-white/[0.05] text-[#64748b]"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className={cn("text-xs font-bold", isActive ? "text-white" : "text-[#64748b]")}>
                    {stepIdx + 1}
                  </span>
                )}
              </div>
              
              {/* Title Below Step */}
              <div 
                className={cn(
                  "mt-3 text-[12px] font-medium transition-colors duration-300",
                  isActive ? "text-[#f1f5f9] font-bold" : "text-[#64748b]"
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
