"use client";

import { useEffect, useState } from "react";
import { 
  BarChart4, 
  TrendingUp, 
  ShieldCheck, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface AdminOrder {
  id: string;
  createdAt: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  status: string;
  product: { name: string };
  user: { name: string; email: string };
}

interface AdminStats {
  volumeToday: number;
  transactionsToday: number;
  platformRevenueToday: number;
  totalVolume: number;
  totalFees: number;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions?page=${page}&search=${search}`);
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
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/overview-stats");
        const data: AdminStats = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 bg-background min-h-screen">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-primary/20">Monitoramento Global</span>
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" title="Live Connection" />
           </div>
           <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic">Oversight Financeiro</h1>
           <p className="text-text-secondary mt-1">Visão completa de todos os fluxos de capital da plataforma.</p>
        </div>
        <Button size="lg" className="bg-white text-black hover:bg-zinc-200 font-black gap-2 px-8 uppercase tracking-widest italic" onClick={() => {}}>
           <Download className="h-5 w-5" /> Exportar Global
        </Button>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard 
           label="Volume Hoje" 
           value={stats ? formatCurrency(stats.volumeToday) : "..."} 
           icon={TrendingUp}
           sub={stats ? `${stats.transactionsToday} transações hoje` : ""}
         />
         <StatsCard 
           label="Receita Plataforma" 
           value={stats ? formatCurrency(stats.platformRevenueToday) : "..."} 
           icon={ShieldCheck}
           sub="Hoje, pós-comissão"
           highlight
         />
         <StatsCard 
           label="Volume Total" 
           value={stats ? formatCurrency(stats.totalVolume) : "..."} 
           icon={BarChart4}
           sub="Histórico bruto"
         />
         <StatsCard 
           label="Lucro Acumulado" 
           value={stats ? formatCurrency(stats.totalFees) : "..."} 
           icon={DollarSign}
           sub="Total de taxas retidas"
         />
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl bg-card border border-border p-2 rounded-2xl shadow-xl">
           <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <Input 
                placeholder="Buscar por nome, e-mail do comprador ou do player..." 
                className="pl-11 h-12 bg-transparent border-none focus:ring-0" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <Button type="submit" size="lg" className="px-8 font-bold">Pesquisar</Button>
        </form>

        {/* Global Transactions Table */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
                   <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Data</th>
                   <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Player (Usuário)</th>
                   <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Comprador</th>
                   <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Produto</th>
                   <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">Bruto</th>
                   <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">Taxa (App)</th>
                   <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-center">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                 {loading ? (
                   [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse h-20 bg-card/40"><td colSpan={7} /></tr>)
                 ) : transactions.length > 0 ? (
                   transactions.map((t: AdminOrder) => (
                     <tr key={t.id} className="hover:bg-primary/5 transition-all group">
                       <td className="px-6 py-4">
                          <span className="text-xs font-bold text-text-secondary">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</span>
                          <span className="block text-[10px] opacity-40">{new Date(t.createdAt).toLocaleTimeString("pt-BR")}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold border border-white/5">
                                {t.user.name.charAt(0)}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-text-primary uppercase tracking-tight">{t.user.name}</span>
                                <span className="text-[10px] text-text-secondary opacity-50">{t.user.email}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-text-primary">{t.buyerName}</span>
                             <span className="text-[10px] text-text-secondary font-mono">{t.buyerEmail}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-xs font-bold text-text-secondary border border-border px-2 py-1 rounded bg-background">{t.product.name}</span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-text-primary">R$ {t.amount.toFixed(2)}</span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-primary">R$ {t.platformFee.toFixed(2)}</span>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <StatusBadge status={t.status} />
                       </td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                      <td colSpan={7} className="px-6 py-32 text-center">
                         <h3 className="text-xl font-bold text-text-secondary opacity-30 italic">No Global Transactions Found</h3>
                      </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
             <div className="px-6 py-4 border-t border-border bg-background/50 flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest leading-none">Página {page} de {pagination.pages}</span>
                <div className="flex gap-3">
                   <Button variant="outline" className="h-10 w-10 p-0 rounded-full border-border/60" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-5 w-5" />
                   </Button>
                   <Button variant="outline" className="h-10 w-10 p-0 rounded-full border-border/60" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-5 w-5" />
                   </Button>
                </div>
             </div>
          )}

          {/* Background Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[120px] -z-10" />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, sub, highlight }: { label: string, value: string, icon: React.ComponentType<{className?: string}>, sub: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "bg-card border p-8 rounded-[2rem] flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
      highlight ? "border-primary/30 ring-1 ring-primary/20 shadow-primary/5" : "border-border"
    )}>
       <div className="flex justify-between items-start relative z-10">
          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-12", highlight ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-background border-border text-text-secondary")}>
             <Icon className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">{label}</p>
       </div>
       <div className="pt-8 relative z-10">
          <span className="text-3xl font-black text-text-primary tracking-tighter italic">
             {value}
          </span>
          <p className="text-[10px] text-text-secondary mt-2 font-bold uppercase tracking-widest h-4">{sub}</p>
       </div>

       {/* Decorative Gradient Background */}
       <div className={cn(
         "absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity",
         highlight ? "bg-primary" : "bg-text-secondary"
       )} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, class: string }> = {
    PAID: { label: "Success", class: "bg-success text-white shadow-lg shadow-success/10" },
    PENDING: { label: "Inactive", class: "bg-zinc-800 text-zinc-400 border border-white/5" },
    FAILED: { label: "Rejected", class: "bg-error text-white shadow-lg shadow-error/10" },
    REFUNDED: { label: "Refund", class: "bg-warning text-black" },
  };
  const config = configs[status] || { label: status, class: "bg-zinc-800 text-zinc-400" };
  return (
    <span className={cn("inline-flex px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest", config.class)}>
       {config.label}
    </span>
  );
}
