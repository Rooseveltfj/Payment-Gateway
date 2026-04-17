"use client";

import { Bell, ChevronDown, ArrowDownToLine } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export type Period = "today" | "week" | "month" | "quarter" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hoje",
  week: "Última semana",
  month: "Último mês",
  quarter: "Últimos 3 meses",
  year: "Este ano",
};

interface TopbarProps {
  onPeriodChange?: (p: Period) => void;
  period?: Period;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export function Topbar({ onPeriodChange, period = "week", user: propUser }: TopbarProps) {
  const { data: session } = useSession();
  const user = propUser || session?.user;
  const userName = user?.name?.split(' ')[0] || "Usuário";
  
  const needsKyc = user?.kycStatus && user.kycStatus !== "APPROVED";
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      {needsKyc && (
        <div className="fixed left-60 right-0 top-0 z-50 h-10 bg-warning/10 border-b border-warning/20 flex items-center justify-center text-warning text-xs font-semibold" style={{backdropFilter: 'blur(4px)'}}>
           ⚠️ Sua conta precisa de verificação para sacar. 
           <a href="/dashboard/configuracoes/kyc" className="underline ml-2 hover:text-warning/80">Complete o KYC →</a>
        </div>
      )}
      <header
        className={cn("fixed left-60 right-0 z-30 flex h-14 items-center justify-between px-8 transition-all", needsKyc ? "top-10" : "top-0")}
      style={{
        background: "#09090b",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Left — greeting */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary leading-none">
          Olá, {userName} 👋
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Seja bem-vindo ao painel de controle
        </p>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-3">
        {/* Period Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-text-primary hover:bg-hover transition-colors duration-200 cursor-pointer"
          >
            {PERIOD_LABELS[period]}
            <ChevronDown
              className={cn(
                "h-3 w-3 text-text-secondary transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden"
            >
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    onPeriodChange?.(key);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-xs transition-colors duration-150 cursor-pointer",
                    key === period
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-hover hover:text-text-primary"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal CTA */}
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Solicitar saque
        </button>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-text-secondary hover:text-text-primary hover:bg-hover transition-colors duration-200 cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>
      </div>
      </header>
    </>
  );
}
