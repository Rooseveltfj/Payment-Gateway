"use client";

import { useEffect, useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
  createdAt: string;
}

export default function StatementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const res = await fetch(`/api/financial/statement?page=${page}&type=${filterType}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { pages: 1 });
      setLoading(false);
    };
    fetchTransactions();
  }, [page, filterType]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ["ID", "Tipo", "Descricao", "Valor", "Saldo_Apos", "Data"];
    const rows = transactions.map((t: Transaction) => [
      t.id,
      t.type,
      t.description,
      t.amount,
      t.balance,
      new Date(t.createdAt).toLocaleString("pt-BR")
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato_blackgate_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Extrato Detalhado</h1>
          <p className="text-sm text-text-secondary mt-1">Histórico completo de movimentações da sua conta.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportToCSV} disabled={loading}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-xl overflow-x-auto shadow-sm">
        <Filter className="h-4 w-4 text-text-secondary ml-2 shrink-0" />
        <FilterButton label="Todas" active={filterType === "ALL"} onClick={() => setFilterType("ALL")} />
        <FilterButton label="Vendas" active={filterType === "SALE"} onClick={() => setFilterType("SALE")} />
        <FilterButton label="Saques" active={filterType === "WITHDRAWAL"} onClick={() => setFilterType("WITHDRAWAL")} />
        <FilterButton label="Estornos" active={filterType === "REFUND"} onClick={() => setFilterType("REFUND")} />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Saldo Após</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan={5} className="px-6 py-6 h-16 bg-card/50" />
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((t: Transaction) => (
                  <tr key={t.id} className="hover:bg-hover/50 transition-colors group">
                    <td className="px-6 py-4">
                       <TypeBadge type={t.type} />
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{t.description}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn("text-sm font-bold", t.amount > 0 ? "text-success" : "text-error")}>
                         {t.amount > 0 ? "+" : ""}{formatCurrency(t.amount)}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-semibold text-text-secondary">{formatCurrency(t.balance)}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs text-text-secondary">{new Date(t.createdAt).toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="max-w-xs mx-auto">
                         <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                            <Filter className="h-8 w-8 text-text-secondary" />
                         </div>
                         <h3 className="text-lg font-bold text-text-primary">Nenhuma movimentação</h3>
                         <p className="text-sm text-text-secondary mt-1">
                           Você ainda não possui transações registradas para este filtro.
                         </p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-background/30 flex items-center justify-between">
             <span className="text-xs text-text-secondary">Página {page} de {pagination.pages}</span>
             <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} 
                  disabled={page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
        active 
          ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
          : "text-text-secondary hover:bg-hover hover:text-text-primary"
      )}
    >
      {label}
    </button>
  );
}

function TypeBadge({ type }: { type: string }) {
  const configs: Record<string, { label: string, color: string, icon: React.ComponentType<{className?: string}> }> = {
    SALE: { label: "Venda", color: "bg-success/10 text-success border-success/20", icon: ArrowDownLeft },
    WITHDRAWAL: { label: "Saque", color: "bg-error/10 text-error border-error/20", icon: ArrowUpRight },
    REFUND: { label: "Estorno", color: "bg-warning/10 text-warning border-warning/20", icon: RotateCcw },
    CHARGEBACK: { label: "Chargeback", color: "bg-error/20 text-error border-error/30", icon: TrendingDown },
  };

  const config = configs[type] || { label: type, color: "bg-hover text-text-secondary border-border" };
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border", config.color)}>
       {Icon && <Icon className="h-3 w-3" />}
       {config.label}
    </div>
  );
}
