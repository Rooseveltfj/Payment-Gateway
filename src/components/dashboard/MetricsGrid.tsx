"use client";

import { DollarSign, Clock, TrendingUp, ArrowUpDown, Percent, ArrowDownToLine, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WithdrawalModal } from "@/app/dashboard/financeiro/WithdrawalModal";

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
}

function MetricCard({ title, value, icon: Icon, iconColor, iconBg, action, tooltip }: MetricCardProps) {
  const [showTip, setShowTip] = useState(false);

  return (
    <Card hoverable className="h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[12px] font-medium text-[#64748b]">{title}</p>
            {tooltip && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTip(true)}
                  onMouseLeave={() => setShowTip(false)}
                  className="text-[#334155] hover:text-[#64748b] transition-colors cursor-pointer"
                >
                  <Info className="h-3 w-3" />
                </button>
                {showTip && (
                  <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#141422] px-3 py-2 text-[11px] text-[#f1f5f9] shadow-2xl">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#f1f5f9]">{value}</p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </Card>
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
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Saldo disponível"
          value={formatBRL(metrics.availableBalance)}
          icon={DollarSign}
          iconColor="text-[#22c55e]"
          iconBg="rgba(34,197,94,0.12)"
          action={
            <Button 
                variant="ghost" 
                size="sm" 
                icon={<ArrowDownToLine className="w-3.5 h-3.5" />}
                onClick={() => setIsWithdrawalModalOpen(true)}
            >
              Sacar
            </Button>
          }
        />
        <MetricCard
          title="Saldo pendente"
          value={formatBRL(metrics.pendingBalance)}
          icon={Clock}
          iconColor="text-[#8b5cf6]"
          iconBg="rgba(139,92,246,0.12)"
          tooltip="Valores em processamento (1–3 dias úteis)"
        />
        <MetricCard
          title="Saldo retido"
          value={formatBRL(metrics.retainedBalance)}
          icon={Clock}
          iconColor="text-[#eab308]"
          iconBg="rgba(234,179,8,0.12)"
          tooltip="Retenção de segurança — liberado após 30 dias"
        />
        <MetricCard
          title="Lucro líquido"
          value={formatBRL(metrics.netProfit)}
          icon={TrendingUp}
          iconColor="text-[#8b5cf6]"
          iconBg="rgba(139,92,246,0.12)"
        />
        <MetricCard
          title="Total de transações"
          value={metrics.totalTransactions.toLocaleString("pt-BR")}
          icon={ArrowUpDown}
          iconColor="text-[#64748b]"
          iconBg="rgba(255,255,255,0.05)"
        />
        <MetricCard
          title="Ticket médio"
          value={formatBRL(metrics.averageTicket)}
          icon={Percent}
          iconColor="text-[#8b5cf6]"
          iconBg="rgba(139,92,246,0.12)"
        />
      </div>

      {isWithdrawalModalOpen && (
        <WithdrawalModal 
            available={metrics.availableBalance}
            onClose={() => setIsWithdrawalModalOpen(false)}
            onSuccess={() => {
                setIsWithdrawalModalOpen(false);
                // In a real app we might want to refresh metrics here
            }}
        />
      )}
    </>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[128px]">
          <Card className="h-full animate-pulse opacity-50" />
        </div>
      ))}
    </div>
  );
}

