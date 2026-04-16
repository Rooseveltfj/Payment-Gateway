"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  User as UserIcon,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminWithdrawal {
  id: string;
  amount: number;
  createdAt: string;
  pixKey: string;
  pixKeyType: string;
  user: {
    name: string;
    email: string;
  }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/withdrawals");
    const data = await res.json();
    setWithdrawals(data.withdrawals || []);
    setLoading(false);
  };

  const handleProcess = async (id: string, status: "COMPLETED" | "FAILED") => {
    if (!confirm(`Deseja marcar este saque como ${status === "COMPLETED" ? 'REALIZADO' : 'FALHO'}?`)) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/process`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) fetchWithdrawals();
      else alert("Erro ao processar");
    } catch {
      alert("Erro de rede");
    }
  };

  const filtered = withdrawals.filter((w: AdminWithdrawal) => 
    w.user.name.toLowerCase().includes(search.toLowerCase()) || 
    w.pixKey.includes(search)
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Gestão de Saques</h1>
          <p className="text-text-secondary mt-1 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Filas de pagamento pendentes para aprovação admin.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-xl">
           <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold text-sm tracking-widest border border-primary/20 animate-pulse">
             LIVE OPS
           </div>
        </div>
      </div>

      <div className="relative max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Buscar por nome ou chave PIX..." 
          className="pl-11 h-12 bg-card border-border/60 focus:border-primary shadow-sm" 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse" />)
        ) : filtered.length > 0 ? (
          filtered.map((w: AdminWithdrawal) => (
            <div key={w.id} className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/50 transition-all group overflow-hidden relative shadow-lg hover:shadow-primary/5">
              
              <div className="flex items-center gap-5 relative z-10">
                 <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                    <UserIcon className="h-7 w-7" />
                 </div>
                 <div className="min-w-0">
                    <h3 className="text-lg font-bold text-text-primary truncate">{w.user.name}</h3>
                    <p className="text-sm text-text-secondary truncate">{w.user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black bg-background border border-border px-1.5 py-0.5 rounded text-text-secondary uppercase">{w.pixKeyType}</span>
                       <span className="text-xs font-medium text-text-primary truncate">{w.pixKey}</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col md:items-end gap-1 relative z-10">
                 <p className="text-2xl font-black text-text-primary tracking-tighter">
                   {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(w.amount)}
                 </p>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Solicitado {new Date(w.createdAt).toLocaleString("pt-BR")}</span>
                 </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                 <Button 
                   variant="outline" 
                   className="h-12 border-error/50 text-error hover:bg-error/10 flex-1 md:flex-none font-bold"
                   onClick={() => handleProcess(w.id, "FAILED")}
                 >
                   <XCircle className="h-4 w-4 mr-2" />
                   Reprovar
                 </Button>
                 <Button 
                   variant="default" 
                   className="h-12 bg-success hover:bg-success/90 text-white flex-1 md:flex-none font-extrabold px-8 shadow-xl shadow-success/10"
                   onClick={() => handleProcess(w.id, "COMPLETED")}
                 >
                   <CheckCircle2 className="h-4 w-4 mr-2" />
                   Efetuar Pagamento
                 </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-card border border-border rounded-3xl">
             <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-border shadow-inner">
                <Filter className="h-10 w-10 text-text-secondary opacity-30" />
             </div>
             <h3 className="text-xl font-bold text-text-primary tracking-tight">Nenhuma solicitação pendente</h3>
             <p className="text-text-secondary max-w-xs mx-auto mt-2">
               Tudo limpo por aqui! Nenhuma solicitação de saque aguarda processamento no momento.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
