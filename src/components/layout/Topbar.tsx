"use client";

import { Bell, ChevronDown, ArrowDownToLine, User, Shield, FileText, Code, Sun, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";

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

export function Topbar({ onPeriodChange, period: propPeriod, user: propUser }: TopbarProps) {
  const { data: session } = useSession();
  const context = useDashboard();
  
  // Use props if provided, otherwise use context
  const currentPeriod = propPeriod || context.period;
  const handlePeriodChange = onPeriodChange || context.setPeriod;

  const user = propUser || session?.user;
  const userName = user?.name?.split(' ')[0] || "Usuário";
  
  const needsKyc = user?.kycStatus && user.kycStatus !== "APPROVED";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {needsKyc && (
        <div className="fixed left-60 right-0 top-0 z-50 h-10 bg-[#7c19c1]/10 border-b border-[#7c19c1]/20 flex items-center justify-center text-[#9b49e6] text-xs font-bold" style={{backdropFilter: 'blur(8px)'}}>
           <Shield className="w-3.5 h-3.5 mr-2" />
           Sua conta precisa de verificação para sacar. 
           <a href="/dashboard/configuracoes/kyc" className="underline ml-2 hover:text-[#b17ef3] transition-colors">Complete o KYC →</a>
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
            {PERIOD_LABELS[currentPeriod]}
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
                    handlePeriodChange?.(key);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-xs transition-colors duration-150 cursor-pointer",
                    key === currentPeriod
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

        <div className="h-6 w-[1px] bg-white/5 mx-1" />

        {/* User Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/30 group-hover:ring-primary/50 transition-all">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:flex flex-col items-start mr-1">
              <span className="text-[11px] font-bold text-white leading-none capitalize">{userName}</span>
              <span className="text-[9px] text-white/40 uppercase tracking-tighter mt-0.5">{user?.role || "Player"}</span>
            </div>
            <ChevronDown className={cn("h-3.5 w-3.5 text-white/20 group-hover:text-white/40 transition-all", userMenuOpen && "rotate-180")} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-[120%] w-56 rounded-2xl bg-[#0a0b11] border border-white/5 shadow-2xl py-2 z-[100] backdrop-blur-3xl">
              <div className="px-4 py-3 border-b border-white/5 mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white truncate max-w-[120px]">{user?.name || "Usuário"}</span>
                    <span className="text-[10px] text-white/40">{user?.email || ""}</span>
                  </div>
                </div>
              </div>

              <div className="px-2 space-y-0.5">
                <Link href="/dashboard/configuracoes/perfil" className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                  <User className="h-4 w-4 text-white/20 group-hover:text-primary" />
                  Perfil
                </Link>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                  <LayoutDashboard className="h-4 w-4 text-white/20 group-hover:text-primary" />
                  Dashboard
                </Link>
                <Link href="#" className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                  <FileText className="h-4 w-4 text-white/20 group-hover:text-primary" />
                  Documentação
                </Link>
                <Link href="/dashboard/configuracoes/kyc" className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                  <Shield className="h-4 w-4 text-white/20 group-hover:text-primary" />
                  Meus documentos
                </Link>
                
                <div className="h-[1px] bg-white/5 my-2 mx-2" />
                
                <Link href="/dashboard/integracoes" className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                  <Code className="h-4 w-4 text-white/20 group-hover:text-primary" />
                  Documentação API
                </Link>
                <button className="flex w-full items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
                  <Sun className="h-4 w-4 text-white/20 group-hover:text-primary" />
                  Modo Claro
                </button>
                
                <div className="h-[1px] bg-white/5 my-2 mx-2" />
                
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-3 px-3 py-2 text-xs font-bold text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all group"
                >
                  <LogOut className="h-4 w-4 text-red-500/30 group-hover:text-red-500" />
                  Desconectar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
