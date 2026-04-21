"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Select } from "@/components/ui/Select";
import { Badge, BadgeStatus } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import Link from "next/link";
import { toast } from "sonner";

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
      toast.error("Falha ao carregar lista de usuários");
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

  const columns = useMemo<Column<AdminUser>[]>(() => [
    {
      header: "Player",
      accessor: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-bold text-xs overflow-hidden">
            {u.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : u.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[#f1f5f9] tracking-tight">{u.name}</span>
            <span className="text-[11px] text-[#64748b] font-mono">{u.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Status / KYC",
      accessor: (u) => (
        <div className="flex flex-col gap-1.5">
          <Badge 
            status={u.status === 'ACTIVE' ? 'active' : u.status === 'PENDING' ? 'pending' : 'inactive'} 
          />
          <div className="flex items-center gap-1 text-[10px] font-medium text-[#64748b]">
            {u.kycStatus === 'APPROVED' ? (
              <ShieldCheck className="w-3 h-3 text-[#4ade80]" />
            ) : (
              <AlertCircle className="w-3 h-3 text-[#facc15]" />
            )}
            {u.kycStatus}
          </div>
        </div>
      )
    },
    {
      header: "Cadastro",
      accessor: (u) => (
        <span className="text-[#64748b]">
          {new Date(u.createdAt).toLocaleDateString("pt-BR")}
        </span>
      )
    },
    {
      header: "Produtos",
      className: "text-center",
      accessor: (u) => <span className="font-medium">{u.productCount}</span>
    },
    {
      header: "Volume",
      className: "text-right",
      accessor: (u) => (
        <span className="font-bold text-[#f1f5f9]">
          R$ {u.volume.toFixed(2)}
        </span>
      )
    },
    {
      header: "Taxa %",
      className: "text-center",
      accessor: (u) => (
        <span className="px-2 py-0.5 rounded-md bg-[#8b5cf614] border border-[#8b5cf633] text-[#a78bfa] text-xs font-bold">
          {u.platformFeePercent}%
        </span>
      )
    },
    {
      header: "Ação",
      className: "text-right",
      accessor: (u) => (
        <Link href={`/admin/usuarios/${u.id}`} className="inline-block">
          <Button variant="secondary" size="icon">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      )
    }
  ], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="px-4 lg:px-0">
        <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Gestão de Players</h1>
        <p className="text-sm text-[#64748b] mt-1">Gerencie todos os usuários da plataforma e seus desempenhos.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-[#0f0f1a] border border-white/[0.05] p-5 rounded-[20px] shadow-lg">
        <form onSubmit={handleSearch} className="flex-1">
           <Input 
             placeholder="Buscar por nome, e-mail ou CPF..." 
             prefix={<Search className="h-4 w-4" />}
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </form>
        <div className="flex gap-4 lg:w-[320px]">
           <Select 
             value={status}
             onChange={(val) => { setStatus(val); setPage(1); }}
             options={[
               { label: "Todos os Status", value: "" },
               { label: "Ativos", value: "ACTIVE" },
               { label: "Suspensos", value: "SUSPENDED" },
               { label: "Pendentes", value: "PENDING" },
             ]}
           />
           <Button onClick={fetchUsers} isLoading={loading}>
             Filtrar
           </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading}
        emptyMessage="Nenhum jogador encontrado"
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-[#64748b] font-medium">Página {page} de {pagination.pages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
