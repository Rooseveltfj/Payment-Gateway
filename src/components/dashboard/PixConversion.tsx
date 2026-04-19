"use client";

import { Card } from "@/components/ui/Card";

interface PixConversionProps {
  rate: number; // 0–100
}

export function PixConversion({ rate }: PixConversionProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      {/* Ring */}
      <div className="relative mx-auto sm:mx-0">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          {/* Track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="rgba(139,92,246,0.12)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[#f1f5f9]">{rate}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-[14px] font-semibold text-[#f1f5f9]">Conversão por PIX</h3>
        <p className="mt-1.5 text-[12px] text-[#64748b] leading-relaxed">
          {rate}% das transações via PIX foram concluídas com sucesso.
          {rate >= 75
            ? " Excelente taxa de conversão! 🚀"
            : rate >= 50
            ? " Taxa aceitável — há espaço para otimizar."
            : " Taxa baixa — revise o fluxo de checkout."}
        </p>
        <div className="mt-4 flex items-center gap-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
            <span className="text-[#64748b]">Aprovados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/[0.12]" />
            <span className="text-[#64748b]">Restante</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PixConversionSkeleton() {
  return (
    <Card className="h-[136px] animate-pulse opacity-50" />
  );
}
