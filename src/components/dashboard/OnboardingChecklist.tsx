"use client";

import { useState, useEffect } from "react";
import { getOnboardingStatus } from "@/app/dashboard/onboarding-actions";
import { CheckCircle2, Circle, ChevronRight, X, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingChecklist() {
  const [data, setData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getOnboardingStatus().then(setData);
  }, []);

  if (!data || data.allCompleted || dismissed) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className="fixed bottom-8 right-8 z-[100] w-80 bg-[#0a0b11] border border-primary/20 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden"
        >
          <div className="bg-primary/10 px-5 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm">Primeiros Passos</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <span>Progresso</span>
                <span>{data.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.percentage}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              {data.steps.map((step: unknown) => (
                <Link 
                  key={step.id} 
                  href={step.href}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-xl transition-all group",
                    step.completed ? "opacity-50" : "hover:bg-white/5"
                  )}
                >
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Circle className="w-4 h-4 text-border group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className={cn(
                      "text-xs font-bold transition-all",
                      step.completed ? "text-text-secondary line-through" : "text-text-primary"
                    )}>
                      {step.title}
                    </p>
                    {!step.completed && (
                      <p className="text-[10px] text-text-secondary leading-tight line-clamp-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                  {!step.completed && (
                    <ChevronRight className="w-3 h-3 ml-auto text-text-secondary opacity-0 group-hover:opacity-100 transition-all" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex justify-center">
             <button 
               onClick={() => setDismissed(true)}
               className="text-[10px] font-bold text-text-secondary hover:text-white transition-all uppercase tracking-widest"
             >
               Ocultar por enquanto
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


