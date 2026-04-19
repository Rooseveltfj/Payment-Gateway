"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  ShoppingBag, 
  DollarSign, 
  Calendar,
  Eye,
  History,
  X,
  User
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ClientData {
  id: string;
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
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

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
    const timeout = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const columns: Column<ClientData>[] = [
    {
      header: "Cliente",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#8b5cf615] flex items-center justify-center text-[#8b5cf6] font-bold text-xs ring-1 ring-[#8b5cf633]">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-[#f1f5f9]">{row.name}</span>
        </div>
      ),
    },
    {
      header: "E-mail",
      accessor: (row) => (
        <div className="flex items-center gap-2 text-[#64748b]">
          <Mail className="w-3.5 h-3.5 opacity-40" />
          {row.email}
        </div>
      ),
    },
    {
      header: "Compras",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5 text-[#8b5cf6]" />
          <span className="font-medium">{row.totalOrders} pedidos</span>
        </div>
      ),
    },
    {
      header: "Total Gasto",
      accessor: (row) => (
        <span className="font-bold text-[#4ade80]">
          R$ {row.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Última Compra",
      accessor: (row) => (
        <div className="flex items-center gap-2 text-[#64748b]">
          <Calendar className="w-3.5 h-3.5 opacity-40" />
          {new Date(row.lastOrderAt).toLocaleDateString("pt-BR")}
        </div>
      ),
    },
    {
      header: "Ação",
      accessor: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedClient(row);
          }}
          className="p-2 rounded-lg text-[#64748b] hover:text-[#8b5cf6] hover:bg-[#8b5cf61a] transition-all"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
      className: "w-[80px] text-center",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold text-[#f1f5f9] tracking-tight">Meus Clientes</h1>
          <Badge status="active" label={`${clients.length} Clientes Únicos`} className="bg-[#8b5cf61a] text-[#a78bfa] border-none px-3 py-1" />
        </div>
      </div>

      {/* Filter */}
      <div className="relative w-full">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748b]" />
         <Input 
           className="pl-12 h-13 bg-[#0f0f1a] border-white/[0.05] focus:border-[#8b5cf666] ring-offset-0 focus:ring-1 focus:ring-[#8b5cf633]" 
           placeholder="Buscar por nome ou e-mail..." 
           value={search}
           onChange={e => setSearch(e.target.value)}
         />
      </div>

      {/* List */}
      <DataTable 
        columns={columns}
        data={clients}
        loading={loading}
        emptyMessage="Nenhum cliente por aqui"
        emptyIcon={<Users className="w-12 h-12 text-[#64748b] opacity-15" />}
      />

      {/* Empty State Custom Styles (via override if needed, but DataTable handles well) */}
      
      {/* Client History Modal */}
      <Modal 
        isOpen={!!selectedClient} 
        onClose={() => setSelectedClient(null)}
        title="Histórico do Cliente"
      >
        {selectedClient && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
               <div className="h-12 w-12 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-lg font-bold">
                  {selectedClient.name.charAt(0).toUpperCase()}
               </div>
               <div>
                  <h3 className="font-bold text-[#f1f5f9]">{selectedClient.name}</h3>
                  <p className="text-xs text-[#64748b]">{selectedClient.email}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-[#64748b] mb-1 font-bold">Total Gasto</p>
                  <p className="text-xl font-bold text-[#4ade80]">R$ {selectedClient.totalSpent.toFixed(2)}</p>
               </div>
               <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-[#64748b] mb-1 font-bold">Pedidos</p>
                  <p className="text-xl font-bold text-[#f1f5f9]">{selectedClient.totalOrders}</p>
               </div>
            </div>

            <div className="space-y-3">
               <h4 className="text-[11px] uppercase tracking-widest text-[#64748b] font-bold flex items-center gap-2">
                  <History className="w-3 h-3" />
                  Atividades Recentes
               </h4>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {/* Mock Activity List since API history might not be implemented yet */}
                  {[1,2].map(i => (
                    <div key={i} className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                             <CheckCircleIcon className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-[#f1f5f9]">Pedido Pago</p>
                             <p className="text-[10px] text-[#64748b]">#{Math.floor(Math.random()*100000)}</p>
                          </div>
                       </div>
                       <span className="text-xs font-medium text-[#64748b]">Há {i * 2} dias</span>
                    </div>
                  ))}
               </div>
            </div>

            <Button onClick={() => setSelectedClient(null)} variant="primary" className="w-full h-12 font-bold mt-4">
               Fechar Detalhes
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
