"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  CreditCard,
  QrCode,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { TransactionDetailModal } from "./TransactionDetailModal";

interface TransactionData {
  id: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  product: { name: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [method, setMethod] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [selectedTx, setSelectedTx] = useState<TransactionData | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/transactions?page=${page}&status=${status}&method=${method}&search=${search}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { pages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, method]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const exportToCSV = () => {
    const headers = ["ID", "Produto", "Comprador", "Email", "Metodo", "Valor", "Comissao", "Status", "Data"];
    const rows = transactions.map((t: TransactionData) => [
      t.id,
      t.product.name,
      t.buyerName,
      t.buyerEmail,
      t.paymentMethod,
      t.amount,
      t.platformFee,
      t.status,
      new Date(t.createdAt).toLocaleString("pt-BR")
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vendas_PulsePay_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Vendas e Transações</h1>
          <p className="text-sm text-text-secondary mt-1">Gerencie todos os pedidos e pagamentos em tempo real.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportToCSV} disabled={loading}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
           <Input 
             placeholder="Buscar por nome, e-mail ou código..." 
             className="pl-10 bg-background/50" 
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </form>
        <div className="flex flex-wrap gap-2">
           <select 
             className="bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
             value={status}
             onChange={e => { setStatus(e.target.value); setPage(1); }}
           >
             <option value="ALL">Todos os Status</option>
             <option value="PAID">Aprovada</option>
             <option value="PENDING">Pendente</option>
             <option value="FAILED">Recusada</option>
             <option value="REFUNDED">Estornada</option>
             <option value="ABANDONED">Abandonada</option>
           </select>
           <select 
             className="bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
             value={method}
             onChange={e => { setMethod(e.target.value); setPage(1); }}
           >
             <option value="ALL">Todos os Métodos</option>
             <option value="PIX">PIX</option>
             <option value="CREDIT_CARD">Cartão de Crédito</option>
             <option value="BOLETO">Boleto</option>
           </select>
           <Button onClick={fetchTransactions} disabled={loading}>
             {loading ? "..." : "Filtrar"}
           </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-background/50 border-b border-border">
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider"># Código</th>
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Produto</th>
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Comprador</th>
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Método</th>
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Valor</th>
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Net</th>
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Status</th>
                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Ação</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border/50">
               {loading ? (
                 [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse h-16 bg-card/50"><td colSpan={8} /></tr>)
               ) : transactions.length > 0 ? (
                 transactions.map((t: TransactionData) => (
                   <tr key={t.id} className="hover:bg-hover/30 transition-colors group cursor-pointer" onClick={() => setSelectedTx(t)}>
                     <td className="px-6 py-4">
                        <span className="text-xs font-bold text-text-secondary font-mono tracking-tighter">#{t.id.slice(-6).toUpperCase()}</span>
                     </td>
                     <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-text-primary">{t.product.name}</span>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-sm font-medium text-text-primary">{t.buyerName}</span>
                           <span className="text-[10px] text-text-secondary">{t.buyerEmail}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <MethodIcon method={t.paymentMethod} />
                     </td>
                     <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-text-primary">R$ {(t.amount || 0).toFixed(2)}</span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-success">R$ {(t.netAmount || 0).toFixed(2)}</span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <StatusBadge status={t.status} />
                     </td>
                     <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <Eye className="h-4 w-4" />
                        </Button>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                       <div className="max-w-xs mx-auto space-y-3">
                          <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mx-auto border border-border shadow-inner">
                             <AlertCircle className="h-8 w-8 text-text-secondary" />
                          </div>
                          <h3 className="text-lg font-bold text-text-primary">Nenhuma venda encontrada</h3>
                          <p className="text-sm text-text-secondary leading-relaxed">Não encontramos nenhuma transação com os filtros aplicados.</p>
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
              <span className="text-xs text-text-secondary font-medium">Página {page} de {pagination.pages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
           </div>
        )}
      </div>

      {selectedTx && (
        <TransactionDetailModal 
          orderId={selectedTx.id} 
          onClose={() => setSelectedTx(null)} 
          onRefund={fetchTransactions}
        />
      )}
    </div>
  );
}

function MethodIcon({ method }: { method: string }) {
  const icons: Record<string, JSX.Element> = {
    PIX: <QrCode className="h-4 w-4 text-success" />,
    CREDIT_CARD: <CreditCard className="h-4 w-4 text-primary" />,
    BOLETO: <FileText className="h-4 w-4 text-warning" />
  };
  return <div className="flex justify-center">{icons[method] || <FileText className="h-4 w-4" />}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, class: string }> = {
    PAID: { label: "Aprovada", class: "bg-success/10 text-success border-success/20" },
    PENDING: { label: "Pendente", class: "bg-warning/10 text-warning border-warning/20" },
    FAILED: { label: "Recusada", class: "bg-error/10 text-error border-error/20" },
    REFUNDED: { label: "Estornada", class: "bg-error/5 text-error border-error/10 grayscale opacity-70" },
    ABANDONED: { label: "Abandonada", class: "bg-white/5 text-text-secondary border-white/10" },
  };
  const config = configs[status] || { label: status, class: "bg-hover text-text-secondary" };
  return (
    <span className={cn("inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", config.class)}>
       {config.label}
    </span>
  );
}
