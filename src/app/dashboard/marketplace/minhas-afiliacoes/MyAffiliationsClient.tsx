"use client";

import { useState } from "react";
import { 
  ChevronRight, Copy, ExternalLink, 
  TrendingUp, MousePointer2, ShoppingCart, 
  DollarSign, Clock, AlertCircle, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

interface Props {
  initialAffiliations: any[];
  stats: {
    totalEarned: number;
    pendingBalance: number;
    activeCount: number;
    avgConversion: number;
  };
}

export function MyAffiliationsClient({ initialAffiliations, stats }: Props) {
  const [activeTab, setActiveTab] = useState("APPROVED");
  const [selectedAffiliation, setSelectedAffiliation] = useState<any>(null);

  const filtered = initialAffiliations.filter(a => a.status === activeTab);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link de afiliado copiado!");
  };

  const tabs = [
    { value: "APPROVED", label: "Ativas" },
    { value: "PENDING", label: "Pendentes" },
    { value: "REJECTED", label: "Rejeitadas" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Ganho", value: `R$ ${stats.totalEarned.toFixed(2)}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Saldo Pendente", value: `R$ ${stats.pendingBalance.toFixed(2)}`, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Afiliações Ativas", value: stats.activeCount, icon: CheckCircle2, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Conversão Média", value: `${stats.avgConversion.toFixed(1)}%`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#0f0f1a] border border-white/5 p-6 rounded-[24px] space-y-2">
            <div className={cn("p-2 rounded-xl w-fit mb-2", item.bg)}>
              <item.icon className={cn("h-5 w-5", item.color)} />
            </div>
            <p className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Tabs Interface */}
        <div className="flex gap-2 p-1 bg-[#0f0f1a] border border-white/5 rounded-2xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-6 py-2.5 rounded-[12px] text-[13px] font-bold transition-all",
                activeTab === tab.value
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-[#64748b] hover:text-[#f1f5f9] hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listagem */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div key={item.id} className="group bg-[#0f0f1a] border border-white/5 rounded-[24px] p-4 flex flex-col lg:flex-row lg:items-center gap-6 transition-all hover:border-purple-500/20">
                <div className="flex items-center gap-4 lg:w-[320px]">
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-white/5">
                    <img src={item.offer.imageUrl || item.offer.product.imageUrl || "/assets/placeholder-product.png"} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[14px] font-bold text-white truncate">{item.offer.product.name}</h4>
                    <p className="text-[12px] text-[#475569]">por {item.offer.owner.name}</p>
                  </div>
                </div>

                <div className="hidden lg:block w-px h-10 bg-white/5" />

                {/* Métricas Individuais */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <MousePointer2 className="h-4 w-4 text-[#475569]" />
                        <span className="text-[14px] font-black text-white">{item.totalClicks}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#475569] tracking-wider">Cliques</span>
                   </div>
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-[#475569]" />
                        <span className="text-[14px] font-black text-white">{item.totalSales}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#475569] tracking-wider">Vendas</span>
                   </div>
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-[14px] font-black text-green-500">R$ {item.totalEarned.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#475569] tracking-wider">Ganhos</span>
                   </div>
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <span className="text-[14px] font-black text-purple-400">
                          {((item.totalSales / (item.totalClicks || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#475569] tracking-wider">Conv.</span>
                   </div>
                </div>

                <div className="hidden lg:block w-px h-10 bg-white/5" />

                {/* Link & Detalhes */}
                <div className="flex items-center gap-2">
                   {item.status === "APPROVED" && (
                     <div className="flex-1 lg:max-w-[200px] h-10 bg-black/40 border border-white/5 rounded-xl px-3 flex items-center gap-2 overflow-hidden group/link">
                        <span className="text-[11px] font-mono text-[#64748b] truncate">{item.affiliateLink}</span>
                        <button onClick={() => copyLink(item.affiliateLink)} className="p-1.5 hover:text-purple-400 transition-colors">
                           <Copy className="h-3.5 w-3.5" />
                        </button>
                     </div>
                   )}
                   <Button 
                    onClick={() => setSelectedAffiliation(item)}
                    variant="ghost" 
                    className="h-10 px-3 rounded-xl hover:bg-white/5 text-[#64748b] hover:text-white"
                   >
                     <ChevronRight className="h-5 w-5" />
                   </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-[#0f0f1a] border border-white/5 rounded-[32px] space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                 <AlertCircle className="h-8 w-8 text-[#2a2a3d]" />
               </div>
               <p className="text-[#64748b] font-medium">Nenhuma afiliação com o status selecionado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalhes */}
      <Modal 
        isOpen={!!selectedAffiliation} 
        onClose={() => setSelectedAffiliation(null)}
        title="Desempenho da Afiliação"
      >
           {selectedAffiliation && (
             <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 border border-white/5 bg-white/[0.02] rounded-2xl">
                   <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/5">
                      <img src={selectedAffiliation.offer.imageUrl || "/assets/placeholder-product.png"} alt="P" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h4 className="text-lg font-bold text-white leading-tight">{selectedAffiliation.offer.product.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                            selectedAffiliation.status === "APPROVED" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                         )}>{selectedAffiliation.status}</span>
                         <span className="text-[11px] text-[#64748b]">Produtor: {selectedAffiliation.offer.owner.name}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Disponível</p>
                      <h3 className="text-xl font-black text-white">R$ {selectedAffiliation.availableBalance.toFixed(2)}</h3>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Pendente</p>
                      <h3 className="text-xl font-black text-yellow-500">R$ {selectedAffiliation.pendingBalance.toFixed(2)}</h3>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Total</p>
                      <h3 className="text-xl font-black text-green-500">R$ {selectedAffiliation.totalEarned.toFixed(2)}</h3>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest ml-1">Configuração da Oferta</label>
                   <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl grid grid-cols-2 gap-4">
                      <div>
                         <p className="text-[11px] text-[#64748b]">Comissão</p>
                         <p className="text-[14px] font-bold text-white">
                           {selectedAffiliation.offer.commissionType === "PERCENTAGE" 
                             ? `${selectedAffiliation.offer.commissionValue}%` 
                             : `R$ ${selectedAffiliation.offer.commissionValue}`}
                         </p>
                      </div>
                      <div>
                         <p className="text-[11px] text-[#64748b]">Cookie</p>
                         <p className="text-[14px] font-bold text-white">{selectedAffiliation.offer.cookieDays} dias</p>
                      </div>
                   </div>
                </div>

                <Button className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl gap-2">
                   Divulgar meu link <ExternalLink className="h-4 w-4" />
                </Button>
             </div>
           )}
      </Modal>
    </div>
  );
}
