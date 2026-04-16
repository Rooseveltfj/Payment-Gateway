"use client";

interface PixConversionProps {
  rate: number; // 0–100
}

export function PixConversion({ rate }: PixConversionProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:gap-8"
      style={{
        background: "#111113",
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Ring */}
      <div className="relative mx-auto sm:mx-0">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          {/* Track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="rgba(124,58,237,0.15)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-text-primary">{rate}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-text-primary">Conversão por PIX</h3>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">
          {rate}% das transações via PIX foram concluídas com sucesso.
          {rate >= 75
            ? " Excelente taxa de conversão! 🚀"
            : rate >= 50
            ? " Taxa aceitável — há espaço para otimizar."
            : " Taxa baixa — revise o fluxo de checkout."}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-text-secondary">PIX aprovados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "rgba(124,58,237,0.25)" }} />
            <span className="text-text-secondary">Pendentes / falhos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PixConversionSkeleton() {
  return (
    <div
      className="h-36 animate-pulse rounded-xl"
      style={{ background: "#111113", border: "0.5px solid rgba(255,255,255,0.08)" }}
    />
  );
}
