"use client";

import { useEffect, useState } from "react";
import { DollarSign, Clock, CheckCircle2, ArrowUpRight, Calculator, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WithdrawalModal } from "./WithdrawalModal";

export default function FinancialDashboard() {
  const [data, setData] = useState({
    available: 0,
    pending: 0,
    withdrawn: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  useEffect(() => {
    fetch("/api/financial/balance")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Visão Financeira</h1>
        <p className="text-sm text-text-secondary mt-1">Gerencie seu saldo e acompanhe seu crescimento.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Available */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <DollarSign className="h-20 w-20 text-success" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
               <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-text-secondary">Saldo disponível</span>
          </div>
          <p className="text-3xl font-bold text-text-primary tracking-tight">
            {loading ? "..." : formatCurrency(data.available)}
          </p>
          <Button 
            className="w-full mt-6 bg-success hover:bg-success/90 font-bold gap-2 shadow-lg shadow-success/10"
            onClick={() => setShowWithdrawal(true)}
            disabled={loading || data.available < 30}
          >
            <ArrowUpRight className="h-4 w-4" />
            Sacar agora
          </Button>
        </div>

        {/* Pending */}
        <StatCard 
          label="Saldo pendente" 
          val={data.pending} 
          icon={Clock} 
          color="warning" 
          loading={loading} 
          tooltip="Valores de vendas em período de maturação (14 dias)."
        />
        
        {/* Withdrawn */}
        <StatCard 
          label="Total sacado" 
          val={data.withdrawn} 
          icon={CheckCircle2} 
          color="primary" 
          loading={loading} 
        />

        {/* Total Earnings */}
        <StatCard 
          label="Receita total" 
          val={data.total} 
          icon={Calculator} 
          color="white" 
          loading={loading} 
        />
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
            <AlertCircle className="h-5 w-5" />
         </div>
         <div>
            <h4 className="text-sm font-semibold text-text-primary">Prazo de Resgate</h4>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
              Vendas realizadas via Cartão, PIX ou Boleto entram no saldo pendente por 14 dias para garantir a segurança da plataforma contra contestações. Após este período, o valor fica disponível para saque imediato via PIX.
            </p>
         </div>
      </div>

      {showWithdrawal && (
        <WithdrawalModal 
          available={data.available} 
          onClose={() => setShowWithdrawal(false)} 
          onSuccess={() => {
             // Refresh data
             fetch("/api/financial/balance").then(r => r.json()).then(setData);
             setShowWithdrawal(false);
          }}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  val: number;
  icon: React.ComponentType<{className?: string}>;
  color: 'success' | 'warning' | 'primary' | 'white';
  loading: boolean;
  tooltip?: string;
}

function StatCard({ label, val, icon: Icon, color, loading, tooltip }: StatCardProps) {
  const colorMap: Record<string, string> = {
    success: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    primary: "text-primary bg-primary/10 border-primary/20",
    white: "text-white bg-white/5 border-white/10"
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${colorMap[color]}`}>
           <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
           <span className="text-sm font-semibold text-text-secondary">{label}</span>
           {tooltip && <span className="text-[10px] text-text-secondary/60 leading-tight">{tooltip}</span>}
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary tracking-tight">
        {loading ? "..." : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)}
      </p>
    </div>
  );
}
