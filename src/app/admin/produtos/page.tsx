"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Package, 
  User, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  status: string;
  salesCount: number;
  revenue: number;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminProductsManagement() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${page}&search=${search}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { pages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    setUpdating(id);
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
         <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Catálogo Global</h1>
         <p className="text-slate-500 mt-1 font-medium">Controle total sobre todos os produtos criados na rede PulsePay.</p>
      </div>

      {/* Global Search */}
      <div className="max-w-xl">
         <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
               <Input 
                 placeholder="Buscar produto ou proprietário..." 
                 className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-sm font-medium rounded-2xl"
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
            </div>
            <Button type="submit" className="h-12 px-8 font-black uppercase italic tracking-widest text-xs">Filtrar</Button>
         </form>
      </div>

      {/* Product List */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800/50">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Produto & Proprietário</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Preço</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Vendas</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Volume Total</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/30">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-24"><td colSpan={6} /></tr>
                    ))
                  ) : products.length > 0 ? (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-all group">
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                               <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 font-black text-sm">
                                  <Package className="h-6 w-6 text-primary opacity-50" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-white uppercase italic tracking-tight">{p.name}</span>
                                  <div className="flex items-center gap-1.5 mt-0.5 opacity-50">
                                     <User className="h-3 w-3" />
                                     <span className="text-[10px] font-bold uppercase">{p.user.name}</span>
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <span className="text-xs font-black text-slate-300">R$ {p.price.toFixed(2)}</span>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-white italic">{p.salesCount}</span>
                               <span className="text-[9px] font-bold text-slate-600 uppercase">Conversões</span>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <span className="text-sm font-black text-primary italic">R$ {p.revenue.toFixed(2)}</span>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                               <div className={`h-1.5 w-1.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-green-400 shadow-[0_0_8px_#22c55e]' : 'bg-red-400'}`} />
                               {p.status}
                            </div>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={`h-10 w-10 p-0 border-slate-800 rounded-xl transition-all ${p.status === 'ACTIVE' ? 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' : 'hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'}`}
                              onClick={() => toggleStatus(p.id, p.status)}
                              disabled={updating === p.id}
                            >
                               {p.status === 'ACTIVE' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-8 py-32 text-center text-slate-700 font-bold italic uppercase tracking-widest opacity-30">Nenhum produto em rede</td></tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Footer / Stats */}
         <div className="px-8 py-6 bg-slate-900/40 border-t border-slate-800/50 flex items-center justify-between font-black italic uppercase tracking-widest text-[10px]">
            <div className="flex gap-8 text-slate-500">
               <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Total Ativos: {products.filter(p => p.status === 'ACTIVE').length}</span>
               <span className="flex items-center gap-2 underline decoration-primary">Volume Acumulado em Rede: R$ {products.reduce((acc, p) => acc + p.revenue, 0).toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" className="h-10 w-10 p-0 border-slate-800 rounded-xl" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
               <Button variant="outline" className="h-10 w-10 p-0 border-slate-800 rounded-xl" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
         </div>
      </div>
    </div>
  );
}
