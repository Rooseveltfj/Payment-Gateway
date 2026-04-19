"use client";

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { KycReviewModal } from "@/components/admin/KycReviewModal";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function AdminKycPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const columns = useMemo<Column<any>[]>(() => [
    {
      header: "Usuário",
      accessor: (u) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[#f1f5f9]">{u.name}</span>
          <span className="text-[12px] text-[#64748b]">{u.email}</span>
        </div>
      )
    },
    {
      header: "Status Atual",
      accessor: () => <Badge status="pending" label="Pendente Análise" />
    },
    {
      header: "Data Envio",
      accessor: (u) => (
        <span className="text-[#64748b]">
          {new Date(u.updatedAt).toLocaleDateString("pt-BR")}
        </span>
      )
    },
    {
      header: "Ação",
      className: "text-right",
      accessor: (u) => (
        <Button variant="secondary" size="sm" onClick={() => setSelectedUser(u)}>
          Revisar Anexos
        </Button>
      )
    }
  ], []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="px-4 lg:px-0">
        <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Fila de Análise de Contas (KYC)</h1>
        <p className="text-sm text-[#64748b] mt-1">Verifique as submissões documentais dos usuários pendentes.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading}
        emptyMessage="Nenhuma submissão pendente no momento 🎉"
      />

      {selectedUser && (
        <KycReviewModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onRefresh={fetchQueue}
        />
      )}
    </div>
  );
}
