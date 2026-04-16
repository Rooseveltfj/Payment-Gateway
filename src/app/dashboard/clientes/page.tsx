"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  ShoppingBag, 
  DollarSign, 
  Calendar,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ClientData {
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/clients?search=${search}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Meus Clientes</h1>
          <p className="text-sm text-text-secondary mt-1">Veja quem são as pessoas que confiam no seu trabalho.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
           <Users className="h-5 w-5" />
           <span className="font-bold">{clients.length} Clientes Únicos</span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
        <Input 
          className="pl-11 h-12 bg-card border-border shadow-sm focus:border-primary" 
          placeholder="Pesquisar por nome ou e-mail..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </form>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-card border border-border rounded-3xl animate-pulse" />
          ))
        ) : clients.length > 0 ? (
          clients.map((c: ClientData) => (
            <div key={c.email} className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5">
              
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                 <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                    <UserIcon name={c.name} />
                 </div>
                 <Button variant="ghost" size="sm" className="rounded-full">
                    <ExternalLink className="h-4 w-4" />
                 </Button>
              </div>

              {/* Info */}
              <div className="space-y-1">
                 <h3 className="text-lg font-bold text-text-primary truncate">{c.name}</h3>
                 <p className="text-sm text-text-secondary flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 opacity-50" />
                    {c.email}
                 </p>
              </div>

              <div className="h-px bg-border/50 my-6" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Compras</span>
                    <div className="flex items-center gap-1 text-text-primary font-bold">
                       <ShoppingBag className="h-4 w-4 text-primary" />
                       {c.totalOrders}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Valor Gasto</span>
                    <div className="flex items-center gap-1 text-text-primary font-bold">
                       <DollarSign className="h-4 w-4 text-success" />
                       R$ {c.totalSpent.toFixed(2)}
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                 <div className="flex items-center gap-1.5 text-[10px] text-text-secondary font-medium">
                    <Calendar className="h-3 w-3" />
                    Última compra: {new Date(c.lastOrderAt).toLocaleDateString("pt-BR")}
                 </div>
                 <span className="text-primary opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-xs font-bold translate-x-4 group-hover:translate-x-0">
                    Histórico <ArrowRight className="h-3 w-3" />
                 </span>
              </div>

              {/* Decorative Background */}
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-card border border-border rounded-3xl">
             <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-border shadow-inner">
                <Users className="h-10 w-10 text-text-secondary opacity-30" />
             </div>
             <h3 className="text-xl font-bold text-text-primary">Nenhum cliente por aqui</h3>
             <p className="text-text-secondary max-w-xs mx-auto mt-2">
               Quando você realizar suas primeiras vendas, seus clientes aparecerão aqui automaticamente.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserIcon({ name }: { name: string }) {
  const initial = name?.charAt(0).toUpperCase() || "U";
  return <span className="text-xl font-black">{initial}</span>;
}
