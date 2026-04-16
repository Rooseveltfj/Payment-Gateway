"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Ban, 
  CheckCircle,
  FileText,
  DollarSign,
  History,
  TrendingUp,
  Percent,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useParams } from "next/navigation";

interface AdminUserDetailData {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    kycStatus: string;
    createdAt: string;
    document?: string;
    phone?: string;
    pixKey?: string;
    pixKeyType?: string;
    platformFeePercent: number;
    availableBalance: number;
    pendingBalance: number;
    totalWithdrawn: number;
  };
  sales: {
    id: string;
    createdAt: string;
    buyerName: string;
    amount: number;
    status: string;
  }[];
  adminLogs: {
    id: string;
    action: string;
    details: string;
    createdAt: string;
  }[];
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState<AdminUserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformFee, setPlatformFee] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const result = await res.json();
      setData(result);
      setPlatformFee(result.user.platformFeePercent.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (updates: { status?: string, platformFeePercent?: string }) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, note: adminNote })
      });
      await fetchDetail();
      setAdminNote("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!data?.user) return <div>Usuário não encontrado</div>;

  const { user, sales, adminLogs } = data;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
            <Link href="/admin/usuarios">
               <Button variant="outline" className="h-12 w-12 border-slate-800 rounded-2xl hover:bg-slate-800 transition-all">
                  <ArrowLeft className="h-5 w-5" />
               </Button>
            </Link>
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">{user.name}</h1>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     {user.status}
                  </span>
               </div>
               <p className="text-slate-500 text-sm font-medium">{user.email} • <span className="text-slate-400 font-mono">ID: {user.id}</span></p>
            </div>
         </div>

         <div className="flex gap-3">
            {user.status === 'ACTIVE' ? (
              <Button 
                variant="outline" 
                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all font-black gap-2 px-6 uppercase tracking-widest italic"
                onClick={() => handleUpdate({ status: 'SUSPENDED' })}
                disabled={saving}
              >
                <Ban className="h-4 w-4" /> Suspender Conta
              </Button>
            ) : (
              <Button 
                className="bg-green-600 text-white transition-all font-black gap-2 px-6 uppercase tracking-widest italic"
                onClick={() => handleUpdate({ status: 'ACTIVE' })}
                disabled={saving}
              >
                <CheckCircle className="h-4 w-4" /> Ativar Conta
              </Button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Left Column: Data & Stats */}
         <div className="xl:col-span-2 space-y-8">
            {/* Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <BalanceCard label="Disponível" value={user.availableBalance} icon={DollarSign} color="text-green-500" />
               <BalanceCard label="Pendente" value={user.pendingBalance} icon={Clock} color="text-yellow-500" />
               <BalanceCard label="Total Sacado" value={user.totalWithdrawn} icon={TrendingUp} color="text-primary" />
            </div>

            {/* Sales History */}
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-xl overflow-hidden shadow-xl">
               <div className="px-8 py-6 border-b border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <History className="h-5 w-5 text-primary" />
                     <h3 className="font-black text-white uppercase italic tracking-widest">Últimas Vendas</h3>
                  </div>
                  <Link href={`/admin/transacoes?userId=${user.id}`} className="text-xs font-bold text-primary hover:underline uppercase tracking-widest italic">Ver tudo</Link>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-900/50">
                        <tr>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Valor</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/30">
                        {sales.map((sale: AdminUserDetailData['sales'][0]) => (
                          <tr key={sale.id} className="hover:bg-white/5 transition-all">
                             <td className="px-6 py-4 text-xs font-bold text-slate-400">{new Date(sale.createdAt).toLocaleDateString()}</td>
                             <td className="px-6 py-4 text-xs font-black text-white italic">{sale.buyerName}</td>
                             <td className="px-6 py-4 text-right text-xs font-black text-white italic">R$ {sale.amount.toFixed(2)}</td>
                             <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase ${sale.status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                   {sale.status}
                                </span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Admin Logs */}
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-xl p-8 shadow-xl">
               <div className="flex items-center gap-3 mb-8">
                  <FileText className="h-5 w-5 text-red-400" />
                  <h3 className="font-black text-white uppercase italic tracking-widest">Log de Auditoria</h3>
               </div>
               <div className="space-y-6">
                  {adminLogs.map((log: AdminUserDetailData['adminLogs'][0]) => (
                    <div key={log.id} className="flex gap-4 group">
                       <div className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0 shadow-lg shadow-red-500/20 group-hover:scale-125 transition-transform" />
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-red-500/10 px-1.5 rounded">{log.action}</span>
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-400 italic leading-relaxed">{log.details}</p>
                       </div>
                    </div>
                  ))}
                  {adminLogs.length === 0 && <p className="text-center text-slate-700 font-bold italic uppercase tracking-widest py-4">Nenhum evento registrado</p>}
               </div>
            </div>
         </div>

         {/* Right Column: Settings */}
         <div className="space-y-8">
            {/* User Data Card */}
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-xl p-8 shadow-xl">
               <h3 className="text-xs font-black text-white uppercase italic tracking-widest mb-6 border-b border-slate-800 pb-4">Dados Cadastrais</h3>
               <div className="space-y-6">
                  <DataInfo label="CPF / CNPJ" value={user.document || "Não informado"} />
                  <DataInfo label="Telefone" value={user.phone || "Não informado"} />
                  <DataInfo label="Chave PIX" value={user.pixKey || "Não informado"} />
                  <DataInfo label="Tipo PIX" value={user.pixKeyType || "-"} />
                  <DataInfo label="KYC Status" value={user.kycStatus} />
               </div>
            </div>

            {/* Tax Settings Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
               <div className="flex items-center gap-3 mb-6">
                  <Percent className="h-5 w-5 text-primary" />
                  <h3 className="font-black text-white uppercase italic tracking-widest">Configurar Taxa</h3>
               </div>
               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Percentual Platform Fee (%)</label>
                     <Input 
                        type="number" 
                        step="0.01" 
                        className="bg-slate-900/80 border-slate-700 h-12 text-lg font-black text-primary italic"
                        value={platformFee}
                        onChange={e => setPlatformFee(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Nota da Alteração / Observação</label>
                     <textarea 
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-xs text-white focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-none"
                        placeholder="Justifique a mudança ou adicione uma nota administrativa..."
                        value={adminNote}
                        onChange={e => setAdminNote(e.target.value)}
                     />
                  </div>
                  <Button 
                    className="w-full bg-white text-black hover:bg-slate-200 font-black tracking-widest uppercase italic h-12"
                    onClick={() => handleUpdate({ platformFeePercent: platformFee })}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Aplicar Alterações"}
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function BalanceCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: React.ComponentType<{className?: string}>, color: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl group hover:-translate-y-1 transition-all duration-300">
       <div className="flex justify-between items-start mb-6">
          <div className={`h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center ${color} shadow-lg shadow-black/20`}>
             <Icon className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
       </div>
       <h4 className="text-xl font-black text-white italic tracking-tighter">R$ {value.toFixed(2)}</h4>
    </div>
  );
}

function DataInfo({ label, value }: { label: string, value: string }) {
  return (
    <div>
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</span>
       <span className="text-sm font-bold text-white tracking-tight">{value}</span>
    </div>
  );
}
