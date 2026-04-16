"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { KycReviewModal } from "@/components/admin/KycReviewModal";
import { Button } from "@/components/ui/Button";

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Fila de Análise de Contas (KYC)</h1>
        <p className="text-sm text-text-secondary mt-1">Verifique as submissões documentais dos conteudistas.</p>
      </div>

      <div className="bg-card border border-border shadow-md rounded-xl overflow-hidden">
         {loading ? (
           <div className="p-8 text-center text-text-secondary animate-pulse">Carregando fila...</div>
         ) : users.length === 0 ? (
           <div className="p-12 text-center text-text-secondary">Nenhuma submissão pendente no momento 🎉</div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-text-secondary">
               <thead className="bg-background/50 border-b border-border/50 text-xs uppercase text-text-primary">
                 <tr>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Status Atual</th>
                    <th className="px-6 py-4">Data Envio</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                 {users.map((u) => (
                   <tr key={u.id} className="hover:bg-hover/30 transition-colors">
                     <td className="px-6 py-4">
                       <div className="font-semibold text-text-primary">{u.name}</div>
                       <div className="text-xs">{u.email}</div>
                     </td>
                     <td className="px-6 py-4">
                       <Badge variant="warning">Pendente Analise</Badge>
                     </td>
                     <td className="px-6 py-4">
                       {new Date(u.updatedAt).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <Button variant="outline" size="sm" onClick={() => setSelectedUser(u)}>
                         Revisar Anexos
                       </Button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </div>

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
