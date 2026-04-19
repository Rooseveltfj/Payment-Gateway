"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ArrowUp, 
  ArrowDownLeft, 
  Info,
  BarChart3,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge, BadgeStatus } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { WithdrawalModal } from "./WithdrawalModal";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function FinancialDashboard() {
  const [data, setData] = useState({
    available: 0,
    pending: 0,
    withdrawn: 0,
    total: 0,
    pixKey: "",
    pixKeyType: ""
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/financial/balance");
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/financial/statement?limit=10");
      const d = await res.json();
      setTransactions(d.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const columns = useMemo<Column<Transaction>[]>(() => [
    {
      header: "Tipo",
      accessor: (t) => {
        let status: BadgeStatus = "active";
        let label = t.type;
        
        if (t.type === 'SALE') { status = 'active'; label = 'Venda'; }
        if (t.type === 'WITHDRAWAL') { status = 'failed' as BadgeStatus; label = 'Saque'; } // Usando failed para vermelho-dim
        if (t.type === 'REFUND') { status = 'inactive' as BadgeStatus; label = 'Estorno'; } // Usando inactive para azul-dim
        
        // No componente Badge, 'active' mapeia para Pago (verde)
        // 'inactive' mapeia para Cancelado (azul no sistema anterior? Não, aguarde)
        // No meu novo Badge.tsx:
        // 'active' -> Pago (verde)
        // 'pending' -> Pendente (amarelo)
        // 'failed' -> Falhou (vermelho)
        // 'refunded' -> Estornado (azul)
        // 'inactive' -> Cancelado (cinza)
        
        const typeMap: Record<string, BadgeStatus> = {
          SALE: 'active',
          WITHDRAWAL: 'failed',
          REFUND: 'refunded',
          CHARGEBACK: 'failed'
        };
        
        return <Badge status={typeMap[t.type] || 'pending'} label={label} />
      }
    },
    {
      header: "Descrição",
      accessor: (t) => <span className="text-[#f1f5f9] font-medium">{t.description}</span>
    },
    {
      header: "Valor",
      className: "text-right",
      accessor: (t) => {
        const isNegative = t.type === 'WITHDRAWAL' || t.type === 'REFUND';
        return (
          <span className={cn(
            "font-bold",
            isNegative ? "text-[#ef4444]" : "text-[#4ade80]"
          )}>
            {isNegative ? "-" : "+"} {formatCurrency(Math.abs(t.amount))}
          </span>
        )
      }
    },
    {
      header: "Data",
      className: "text-right",
      accessor: (t) => (
        <span className="text-[#64748b]">
          {new Date(t.createdAt).toLocaleDateString('pt-BR')}
        </span>
      )
    }
  ], []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#f1f5f9] tracking-tighter">Visão Financeira</h1>
          <p className="text-sm text-[#64748b] mt-1">Gerencie seu saldo e acompanhe seu crescimento.</p>
        </div>
        <Button 
          variant="primary" 
          className="gap-2 h-11 px-6 font-bold"
          onClick={() => setShowWithdrawal(true)}
        >
          <ArrowUp className="w-4 h-4" />
          Solicitar Saque
        </Button>
      </div>

      {/* Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available */}
        <Card accent hoverable className="relative overflow-hidden flex flex-col justify-between min-h-[160px]">
           <div>
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-[10px] bg-[#22c55e1a] flex items-center justify-center text-[#22c55e] border border-[#22c55e33]">
                 <DollarSign className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Saldo disponível</span>
             </div>
             <p className="text-2xl font-black text-[#4ade80] tracking-tight">
               {loading ? "..." : formatCurrency(data.available)}
             </p>
           </div>
           
           <Button 
             variant="primary" 
             size="sm" 
             className="w-full mt-4 bg-[#22c55e] hover:bg-[#16a34a] text-white border-0"
             onClick={() => setShowWithdrawal(true)}
           >
             Sacar agora
           </Button>
        </Card>

        {/* Card 2: Pending */}
        <Card hoverable className="min-h-[160px]">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-[10px] bg-[#eab3081a] flex items-center justify-center text-[#eab308] border border-[#eab30833]">
               <Clock className="w-5 h-5" />
             </div>
             <div className="flex items-center gap-1.5">
               <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Saldo pendente</span>
               <div className="group relative">
                 <Info className="w-3.5 h-3.5 text-[#334155] cursor-help" />
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-[#141422] border border-white/10 rounded-lg text-[10px] text-[#f1f5f9] z-20 shadow-2xl">
                   Valores em período de maturação (14 dias).
                 </div>
               </div>
             </div>
           </div>
           <p className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
             {loading ? "..." : formatCurrency(data.pending)}
           </p>
        </Card>

        {/* Card 3: Withdrawn */}
        <Card hoverable className="min-h-[160px]">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-[10px] bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf633]">
               <ArrowDownLeft className="w-5 h-5" />
             </div>
             <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Total sacado</span>
           </div>
           <p className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
             {loading ? "..." : formatCurrency(data.withdrawn)}
           </p>
        </Card>

        {/* Card 4: Total Earnings */}
        <Card hoverable className="min-h-[160px]">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-[10px] bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf633]">
               <TrendingUp className="w-5 h-5" />
             </div>
             <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Receita total</span>
           </div>
           <p className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
             {loading ? "..." : formatCurrency(data.total)}
           </p>
        </Card>
      </div>

      {/* Info Banner: Prazo de Resgate */}
      <div className="bg-[#eab3080a] border border-[#eab3081a] border-l-[3px] border-l-[#eab30880] rounded-[16px] p-5 flex items-start gap-4 shadow-sm">
         <div className="w-10 h-10 rounded-xl bg-[#eab3081a] flex items-center justify-center text-[#eab308] border border-[#eab30826] shrink-0">
            <Calendar className="w-5 h-5" />
         </div>
         <div>
            <h4 className="text-sm font-bold text-[#f1f5f9] flex items-center gap-2">
              Prazo de Resgate
            </h4>
            <p className="text-xs text-[#64748b] mt-1.5 max-w-3xl leading-relaxed">
              Vendas realizadas via Cartão, PIX ou Boleto entram no saldo pendente por 14 dias para garantir a segurança da plataforma contra contestações e fraudes. Após este período, o valor fica 100% disponível para saque imediato.
            </p>
         </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#f1f5f9] tracking-tight ml-1">Movimentações Recentes</h3>
        <DataTable 
          columns={columns} 
          data={transactions} 
          loading={historyLoading}
          emptyMessage="Nenhuma movimentação encontrada"
        />
      </div>

      {showWithdrawal && (
        <WithdrawalModal 
          available={data.available} 
          pixKey={data.pixKey}
          pixKeyType={data.pixKeyType}
          onClose={() => setShowWithdrawal(false)} 
          onSuccess={() => {
             fetchBalance();
             fetchHistory();
             setShowWithdrawal(false);
          }}
        />
      )}
    </div>
  );
}
