"use client";

import { useState } from "react";
import { 
  Plus, Megaphone, Users, DollarSign, 
  ChevronRight, Zap, Clock, Check, X, 
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface Props {
  initialAds: any[];
  availableProducts: any[];
  stats: {
    totalAds: number;
    totalAffiliates: number;
    totalRevenue: number;
    pendingRequests: number;
  };
}

export function MyAdsClient({ initialAds, availableProducts, stats }: Props) {
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);
  
  // States for new Ad form
  const [newAdData, setNewAdData] = useState({
    productId: "",
    title: "",
    commissionType: "PERCENTAGE",
    commissionValue: 50,
    cookieDays: 30,
    requiresApproval: false,
    category: "Marketing Digital"
  });

  const handleCreateAd = async () => {
    try {
      if (!newAdData.productId || !newAdData.title) {
        toast.error("Preencha todos os campos obrigatórios.");
        return;
      }

      const res = await fetch("/api/marketplace/my-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdData)
      });

      if (!res.ok) throw new Error("Erro ao criar anúncio");
      
      toast.success("Produto anunciado no Marketplace!");
      setIsNewAdModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleApproveAffiliate = async (affiliationId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/marketplace/affiliations/${affiliationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: approve ? "APPROVED" : "REJECTED" })
      });

      if (!res.ok) throw new Error("Erro ao processar solicitação");
      
      toast.success(approve ? "Afiliado aprovado!" : "Afiliado rejeitado.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Resumo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Meus Anúncios</h1>
          <p className="text-[#64748b] text-base font-medium">Gerencie seus produtos no Marketplace e parceiros afiliados.</p>
        </div>
        <Button 
          onClick={() => setIsNewAdModalOpen(true)}
          className="h-12 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl gap-2 shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all"
        >
          <Plus className="h-5 w-5" /> Anunciar Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Anúncios Ativos", value: stats.totalAds, icon: Megaphone, color: "text-blue-400" },
          { label: "Total Afiliados", value: stats.totalAffiliates, icon: Users, color: "text-purple-400" },
          { label: "Receita via Afiliados", value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
          { label: "Solicitações Pendentes", value: stats.pendingRequests, icon: Clock, color: "text-yellow-500" },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#0f0f1a] border border-white/5 p-6 rounded-[24px] group">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl group-hover:border-white/10 transition-colors">
                  <item.icon className={cn("h-5 w-5", item.color)} />
               </div>
               {item.label === "Solicitações Pendentes" && stats.pendingRequests > 0 && (
                 <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
               )}
            </div>
            <p className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Lista de Anúncios */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white px-1">Seus Produtos no Marketplace</h2>
        {initialAds.length > 0 ? (
          initialAds.map((ad) => (
            <div key={ad.id} className="bg-[#0f0f1a] border border-white/5 rounded-[24px] p-4 flex flex-col lg:flex-row lg:items-center gap-6 group hover:border-purple-500/20 transition-all">
               <div className="flex items-center gap-4 lg:w-[320px]">
                  <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/5 shrink-0">
                    <img src={ad.imageUrl || ad.product.imageUrl || "/assets/placeholder-product.png"} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[15px] font-bold text-white truncate">{ad.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                        ad.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-white/5 text-[#64748b]"
                       )}>{ad.status}</span>
                       <span className="text-[11px] text-[#475569]">{ad.category}</span>
                    </div>
                  </div>
               </div>

               <div className="hidden lg:block w-px h-10 bg-white/5" />

               <div className="grid grid-cols-2 md:grid-cols-3 flex-1 gap-6">
                  <div className="flex flex-col gap-1">
                     <span className="text-[14px] font-bold text-white">
                        {ad.commissionType === "PERCENTAGE" ? `${ad.commissionValue}%` : `R$ ${ad.commissionValue}`}
                     </span>
                     <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Comissão</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[14px] font-bold text-white">{ad.totalAffiliates}</span>
                     <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Afiliados</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[14px] font-bold text-white">R$ {ad.totalRevenue.toFixed(2)}</span>
                     <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Receita</span>
                  </div>
               </div>

               <Button 
                onClick={() => setSelectedOffer(ad)}
                variant="outline" 
                className="h-12 border-white/5 bg-white/[0.02] text-[#64748b] hover:text-white rounded-xl gap-2 font-bold px-6"
               >
                  Gerenciar 
                  {ad.affiliations.filter((a: any) => a.status === "PENDING").length > 0 && (
                    <span className="ml-1 w-5 h-5 bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                      {ad.affiliations.filter((a: any) => a.status === "PENDING").length}
                    </span>
                  )}
               </Button>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-[#0f0f1a] border border-white/5 rounded-[32px] space-y-4">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="h-10 w-10 text-[#2a2a3d]" />
             </div>
             <h3 className="text-xl font-bold text-white">Você ainda não anunciou produtos</h3>
             <Button onClick={() => setIsNewAdModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 rounded-xl px-8 h-12 font-bold mt-4">
               Começar a Anunciar
             </Button>
          </div>
        )}
      </div>

      {/* Modal: Novo Anúncio */}
      <Modal 
        isOpen={isNewAdModalOpen} 
        onClose={() => setIsNewAdModalOpen(false)}
        title="Anunciar no Marketplace"
        description="Aumente suas vendas permitindo que afiliados divulguem seu produto."
      >
           <div className="space-y-6 mt-4">
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest ml-1">Produto para Anunciar</label>
                 <select 
                   value={newAdData.productId}
                   onChange={e => setNewAdData(prev => ({ ...prev, productId: e.target.value }))}
                   className="w-full h-12 bg-black/40 border border-white/5 rounded-2xl px-4 text-white hover:border-white/10 transition-all outline-none"
                 >
                    <option value="">Selecione um produto...</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>)}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest ml-1">Título do Anúncio</label>
                 <Input 
                   placeholder="Ex: [Ganhando 50%] - Produto X VSL que Converte" 
                   value={newAdData.title}
                   onChange={e => setNewAdData(prev => ({ ...prev, title: e.target.value }))}
                   className="h-12 bg-black/40 border-white/5 rounded-2xl"
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest ml-1">Comissão (%)</label>
                    <Input 
                      type="number" 
                      value={newAdData.commissionValue}
                      onChange={e => setNewAdData(prev => ({ ...prev, commissionValue: Number(e.target.value) }))}
                      className="h-12 bg-black/40 border-white/5 rounded-2xl"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest ml-1">Cookie (Dias)</label>
                    <Input 
                      type="number" 
                      value={newAdData.cookieDays}
                      onChange={e => setNewAdData(prev => ({ ...prev, cookieDays: Number(e.target.value) }))}
                      className="h-12 bg-black/40 border-white/5 rounded-2xl"
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                       <Clock className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-white leading-tight">Aprovação Manual</p>
                       <p className="text-[11px] text-[#475569]">Analise cada parceiro.</p>
                    </div>
                 </div>
                 <input 
                   type="checkbox" 
                   checked={newAdData.requiresApproval}
                   onChange={e => setNewAdData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                   className="w-5 h-5 accent-purple-500" 
                 />
              </div>

              <Button onClick={handleCreateAd} className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-black text-[14px] uppercase tracking-widest rounded-3xl transition-all">
                Publicar Agora
              </Button>
           </div>
      </Modal>

      {/* Modal: Gerenciar Afiliados */}
      <Modal 
        isOpen={!!selectedOffer} 
        onClose={() => setSelectedOffer(null)}
        title="Solicitações de Afiliação"
        description={`Produto: ${selectedOffer?.product.name}`}
      >
           <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4 no-scrollbar max-h-[400px]">
              {selectedOffer?.affiliations.filter((a: any) => a.status === "PENDING").length > 0 ? (
                selectedOffer.affiliations.filter((a: any) => a.status === "PENDING").map((af: any) => (
                  <div key={af.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-[20px] flex items-center justify-between transition-all hover:bg-white/[0.05]">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">
                           {af.affiliate.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                           <h5 className="text-[15px] font-bold text-white truncate">{af.affiliate.name}</h5>
                           <p className="text-[11px] text-[#475569] truncate">{af.affiliate.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApproveAffiliate(af.id, false)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/10"
                        >
                           <X className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleApproveAffiliate(af.id, true)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all border border-green-500/10"
                        >
                           <Check className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[#64748b] bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                   Nenhuma solicitação pendente.
                </div>
              )}
           </div>

           <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <Button onClick={() => setSelectedOffer(null)} className="h-11 px-8 rounded-xl bg-white/5 text-[#64748b] hover:text-white font-bold">
                 Fechar
              </Button>
           </div>
      </Modal>
    </div>
  );
}
