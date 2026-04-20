"use client";

import { Bell, ChevronDown, ArrowDownToLine, User, Shield, FileText, Code, Sun, LogOut, LayoutDashboard, Settings, HelpCircle, Laptop } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";

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
  const pathname = usePathname();
  
  // Use props if provided, otherwise use context
  const currentPeriod = propPeriod || context.period;
  const handlePeriodChange = onPeriodChange || context.setPeriod;

  const user = propUser || session?.user;
  const userName = user?.name?.split(' ')[0] || "Usuário";
  
  const [realKycStatus, setRealKycStatus] = useState<string | null>(user?.kycStatus || null);
  const needsKyc = realKycStatus && realKycStatus !== "APPROVED";
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync with session/prop
  useEffect(() => {
    if (user?.kycStatus) {
      setRealKycStatus(user.kycStatus);
    }
  }, [user?.kycStatus]);

  // Real-time check if still not approved in session
  useEffect(() => {
    if (realKycStatus && realKycStatus !== "APPROVED") {
      const checkStatus = async () => {
        try {
          const res = await fetch("/api/user/status");
          const data = await res.json();
          if (data.kycStatus === "APPROVED") {
            setRealKycStatus("APPROVED");
          }
        } catch (e) {
          console.error("Failed to check KYC status", e);
        }
      };

      // Check immediately and then every 30s as fallback
      checkStatus();
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [realKycStatus]);

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
        <div className="fixed left-0 lg:left-64 right-0 top-0 z-50 h-10 bg-[#7c19c1]/10 border-b border-[#7c19c1]/20 flex items-center justify-center text-[#9b49e6] text-[10px] md:text-xs font-bold transition-all duration-300" style={{backdropFilter: 'blur(8px)'}}>
           <Shield className="w-3.5 h-3.5 mr-2 shrink-0" />
           <span className="truncate">Sua conta precisa de verificação.</span>
           <a href="/dashboard/configuracoes/kyc" className="underline ml-2 hover:text-[#b17ef3] transition-colors whitespace-nowrap">Completar KYC →</a>
        </div>
      )}
      <header
        className={cn(
          "fixed left-0 lg:left-64 right-0 z-30 flex h-16 items-center justify-between px-4 md:px-8 transition-all duration-300",
          needsKyc ? "top-10" : "top-0"
        )}
      style={{
        background: "rgba(9, 9, 11, 0.8)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: 'blur(12px)'
      }}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => context.setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-all"
        >
          <Sun className="h-5 w-5 text-text-secondary rotate-90" /> {/* Using Sun as menu placeholder for now or another icon */}
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-text-primary leading-none">
            Olá, {userName}
          </h2>
          <p className="text-[10px] text-text-secondary mt-1 tracking-tight">
            Seja bem-vindo ao PulsePay
          </p>
        </div>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-3">
        {/* Period Dropdown — Only visible on Dashboard */}
        {pathname === "/dashboard" && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[12px] font-medium text-text-primary hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-md"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              {PERIOD_LABELS[currentPeriod]}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-text-secondary transition-transform duration-300",
                  dropdownOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/[0.08] bg-[#0c0c14]/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-2xl"
                >
                  <div className="p-1.5 space-y-0.5">
                    {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          handlePeriodChange?.(key);
                          setDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-[12px] rounded-xl transition-all duration-200",
                          key === currentPeriod
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                        )}
                      >
                        {key === currentPeriod && <div className="w-1 h-3 bg-primary rounded-full mr-2" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notifications */}
        <NotificationCenter />

        <div className="h-6 w-[1px] bg-white/5 mx-1" />

          {/* User Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 backdrop-blur-md group"
            >
              <div className="relative">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/30 group-hover:ring-primary/50 transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] overflow-hidden">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={userName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-4.5 w-4.5" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#09090b] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
              <div className="hidden sm:flex flex-col items-start mr-2">
                <span className="text-[12px] font-bold text-text-primary leading-none capitalize tracking-tight">{userName}</span>
                <span className="text-[9px] text-text-secondary uppercase font-bold tracking-[0.1em] mt-1 flex items-center gap-1">
                   <Shield className="h-2 w-2 text-primary" />
                   {user?.role || "Player"}
                </span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-text-secondary opacity-30 group-hover:opacity-60 transition-all", userMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-[calc(100%+0.75rem)] w-64 rounded-[24px] bg-[#0c0c14]/95 border border-white/[0.08] shadow-[0_20px_70px_rgba(0,0,0,0.6)] py-2.5 z-[100] backdrop-blur-3xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/[0.05] mb-2 bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner overflow-hidden">
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={userName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5.5 w-5.5" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-bold text-text-primary truncate">{user?.name || "Usuário"}</span>
                        <span className="text-[11px] text-text-secondary truncate opacity-70">{user?.email || ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 space-y-0.5">
                    <Link href="/dashboard/configuracoes/perfil" className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-xl transition-all group">
                      <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      Perfil
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-xl transition-all group">
                      <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>
                      Painel Geral
                    </Link>
                    <Link href="/dashboard/configuracoes/kyc" className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-xl transition-all group">
                      <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Shield className="h-4 w-4" />
                      </div>
                      Documentação KYC
                    </Link>
                    
                    <div className="h-px bg-white/[0.05] my-2 mx-3" />
                    
                    <Link href="/dashboard/integracoes" className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-xl transition-all group">
                      <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <Code className="h-4 w-4" />
                      </div>
                      API & Checkout
                    </Link>
                    
                    <div className="flex items-center justify-between px-3.5 py-2.5 text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-xl transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all">
                          <Sun className="h-4 w-4" />
                        </div>
                        Modo Escuro
                      </div>
                      <div className="w-8 h-4 rounded-full bg-primary/20 relative">
                         <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-primary shadow-[0_0_5px_rgba(139,92,246,0.6)]" />
                      </div>
                    </div>
                    
                    <div className="h-px bg-white/[0.05] my-2 mx-3" />
                    
                    <button 
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-3 px-3.5 py-3 text-[12px] font-bold text-error/70 hover:text-error hover:bg-error/5 rounded-xl transition-all group"
                    >
                      <div className="p-1.5 rounded-lg bg-error/5 group-hover:bg-error/10 transition-all">
                        <LogOut className="h-4 w-4" />
                      </div>
                      Encerrar Sessão
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </div>
    </header>
    </>
  );
}
