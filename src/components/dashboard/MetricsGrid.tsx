"use client";

import { DollarSign, Clock, TrendingUp, ArrowUpDown, Percent, ArrowDownToLine, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  action?: React.ReactNode;
  tooltip?: string;
  animate?: boolean;
}

function MetricCard({ title, value, icon: Icon, iconColor, iconBg, action, tooltip }: MetricCardProps) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
      style={{
        background: "#111113",
        border: "0.5px solid rgba(255,255,255,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-text-secondary">{title}</p>
            {tooltip && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTip(true)}
                  onMouseLeave={() => setShowTip(false)}
                  className="text-text-secondary/60 hover:text-text-secondary transition-colors cursor-pointer"
                >
                  <Info className="h-3 w-3" />
                </button>
                {showTip && (
                  <div className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs text-text-primary shadow-xl">
                    {tooltip}
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" />
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-text-primary">{value}</p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      {action}
    </div>
  );
}

interface MetricsGridProps {
  metrics: {
    availableBalance: number;
    pendingBalance: number;
    retainedBalance: number;
    netProfit: number;
    totalTransactions: number;
    averageTicket: number;
  };
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {/* Row 1 */}
      <MetricCard
        title="Saldo disponível"
        value={formatBRL(metrics.availableBalance)}
        icon={DollarSign}
        iconColor="text-success"
        iconBg="rgba(34,197,94,0.15)"
        action={
          <button className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors duration-200 cursor-pointer w-fit">
            <ArrowDownToLine className="h-3.5 w-3.5" />
            Sacar
          </button>
        }
      />
      <MetricCard
        title="Saldo pendente"
        value={formatBRL(metrics.pendingBalance)}
        icon={Clock}
        iconColor="text-primary"
        iconBg="rgba(124,58,237,0.15)"
        tooltip="Valores em processamento (1–3 dias úteis)"
      />
      <MetricCard
        title="Saldo retido"
        value={formatBRL(metrics.retainedBalance)}
        icon={Clock}
        iconColor="text-warning"
        iconBg="rgba(245,158,11,0.15)"
        tooltip="Retenção de segurança — liberado após 30 dias"
      />

      {/* Row 2 */}
      <MetricCard
        title="Lucro líquido"
        value={formatBRL(metrics.netProfit)}
        icon={TrendingUp}
        iconColor="text-primary"
        iconBg="rgba(124,58,237,0.15)"
      />
      <MetricCard
        title="Total de transações"
        value={metrics.totalTransactions.toLocaleString("pt-BR")}
        icon={ArrowUpDown}
        iconColor="text-secondary"
        iconBg="rgba(139,92,246,0.15)"
      />
      <MetricCard
        title="Ticket médio"
        value={formatBRL(metrics.averageTicket)}
        icon={Percent}
        iconColor="text-primary"
        iconBg="rgba(124,58,237,0.15)"
      />
    </div>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl"
          style={{ background: "#111113", border: "0.5px solid rgba(255,255,255,0.08)" }}
        />
      ))}
    </div>
  );
}
