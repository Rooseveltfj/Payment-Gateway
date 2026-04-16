"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: string;
  kycStatus: string;
  createdAt: string;
  platformFeePercent: number;
  productCount: number;
  volume: number;
  avatarUrl?: string;
}

export default function AdminUsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${search}&status=${status}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { pages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Jogadores da Base</h1>
           <p className="text-slate-500 mt-1">Gestão centralizada de todos os players e seus respectivos desempenhos.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Buscar por nome, e-mail ou CPF..." 
                className="pl-10 h-11 bg-slate-900/50 border-slate-800 text-sm rounded-xl focus:ring-primary/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <Button type="submit" className="h-11 px-6 font-bold uppercase italic tracking-widest text-xs">Pesquisar</Button>
        </form>

        <select 
          className="h-11 px-4 bg-slate-900/50 border-slate-800 rounded-xl text-xs font-bold text-slate-400 focus:ring-primary/20 cursor-pointer"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Todos os Status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="SUSPENDED">Suspensos</option>
          <option value="PENDING">Pendentes</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800/50">
                     <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Player</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Status / KYC</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Cadastro</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-center">Produtos</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-right">Volume</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-center">Taxa %</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/30">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-20 bg-slate-900/10"><td colSpan={7} /></tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-primary/5 transition-all group cursor-default">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs">
                                  {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="h-full w-full rounded-xl object-cover" /> : u.name.charAt(0)}
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-white tracking-tight uppercase italic">{u.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono tracking-tighter">{u.email}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                               <div className="flex items-center gap-1.5">
                                  <div className={`h-1.5 w-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{u.status}</span>
                               </div>
                               <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 italic">
                                  {u.kycStatus === 'APPROVED' ? <ShieldCheck className="h-3 w-3 text-primary" /> : <AlertCircle className="h-3 w-3" />}
                                  {u.kycStatus}
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="text-xs font-black text-white">{u.productCount}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-white italic">R$ {u.volume.toFixed(2)}</span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="text-xs font-black text-primary px-2 py-1 bg-primary/10 rounded-md border border-primary/20">{u.platformFeePercent}%</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <Link href={`/admin/usuarios/${u.id}`}>
                               <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-800 hover:bg-primary hover:text-white hover:border-primary transition-all rounded-lg">
                                  <ExternalLink className="h-4 w-4" />
                               </Button>
                            </Link>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={7} className="px-6 py-24 text-center text-slate-600 font-black italic uppercase tracking-widest opacity-30">
                          Nenhum jogador encontrado
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         {pagination.pages > 1 && (
            <div className="px-8 py-5 border-t border-slate-800/50 bg-slate-900/20 flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Página {page} de {pagination.pages}</span>
               <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="h-10 w-10 p-0 border-slate-800 rounded-xl" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-10 w-10 p-0 border-slate-800 rounded-xl" 
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => p + 1)}
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
