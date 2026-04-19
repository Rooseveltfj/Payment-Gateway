"use client";

import { useState } from "react";
import { 
  Zap, Clock, CheckCircle2, 
  ArrowRight, Copy, Share2, DollarSign,
  TrendingUp, Users, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

interface Props {
  offer: any;
}

export function MarketplaceProductCard({ offer }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [affiliationStatus, setAffiliationStatus] = useState<string | null>(
    offer.affiliations?.[0]?.status || null
  );
  const [affiliateLink, setAffiliateLink] = useState<string | null>(
    offer.affiliations?.[0]?.affiliateLink || null
  );

  const isAffiliated = affiliationStatus === "APPROVED";
  const isPending = affiliationStatus === "PENDING";

  const handleAffiliate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/affiliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao solicitar afiliação");

      setAffiliationStatus(data.status);
      setAffiliateLink(data.affiliateLink);
      
      if (data.status === "APPROVED") {
        toast.success("Afiliação aprovada com sucesso!");
      } else {
        toast.success("Solicitação enviada ao produtor!");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!affiliateLink) return;
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative flex flex-col bg-[#0f0f1a] border border-white/5 rounded-[24px] overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:border-purple-500/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] cursor-pointer"
      >
        {/* Imagem Cover */}
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={offer.imageUrl || offer.product.imageUrl || "/assets/placeholder-product.png"} 
            alt={offer.title} 
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent opacity-60" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4">
             <span className="px-2.5 py-1 bg-[#8b5cf6]/20 backdrop-blur-md border border-[#8b5cf6]/30 text-[#a78bfa] text-[10px] font-bold rounded-lg uppercase tracking-wider">
               {offer.category || "Geral"}
             </span>
          </div>

          <div className="absolute top-4 right-4">
            {offer.requiresApproval ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                <Clock className="h-3 w-3" /> Manual
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 backdrop-blur-md border border-green-500/20 text-green-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                <Zap className="h-3 w-3" /> Automática
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5 flex-1 flex flex-col">
           <div className="space-y-1 mb-4">
              <h3 className="text-[15px] font-bold text-white leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-purple-400 transition-colors">
                {offer.title}
              </h3>
              <p className="text-[11px] text-[#475569] font-medium">por <span className="text-[#64748b]">{offer.owner.name}</span></p>
           </div>

           <div className="h-px bg-white/[0.04] w-full mb-5" />

           {/* Métricas */}
           <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
              <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[14px] font-black text-green-500">
                      {offer.commissionType === "PERCENTAGE" ? `${offer.commissionValue}%` : `R$ ${offer.commissionValue.toFixed(2)}`}
                    </span>
                 </div>
                 <span className="text-[9px] font-bold text-[#475569] uppercase tracking-widest pl-5">Comissão</span>
              </div>

              <div className="flex flex-col text-right">
                 <div className="flex items-center gap-1.5 justify-end mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-[#f1f5f9]" />
                    <span className="text-[14px] font-black text-[#f1f5f9]">{offer.conversionRate.toFixed(1)}%</span>
                 </div>
                 <span className="text-[9px] font-bold text-[#475569] uppercase tracking-widest">Conversão</span>
              </div>

              <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-[#64748b]" />
                    <span className="text-[13px] font-bold text-[#f1f5f9]">{offer.totalAffiliates}</span>
                 </div>
                 <span className="text-[9px] font-bold text-[#475569] uppercase tracking-widest pl-5">Afiliados</span>
              </div>

              <div className="flex flex-col text-right">
                 <div className="flex items-center gap-1.5 justify-end mb-1">
                    <ShoppingCart className="h-3.5 w-3.5 text-[#64748b]" />
                    <span className="text-[13px] font-bold text-[#f1f5f9]">{offer.totalSales}</span>
                 </div>
                 <span className="text-[9px] font-bold text-[#475569] uppercase tracking-widest">Vendas</span>
              </div>
           </div>

           {/* Botão de Ação */}
           <div className="mt-auto">
              {isAffiliated ? (
                <Button variant="ghost" className="w-full h-10 bg-purple-500/5 text-purple-400 font-bold text-[12px] gap-2 rounded-xl border border-purple-500/20">
                  Ver meu link <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : isPending ? (
                <Button disabled className="w-full h-10 bg-yellow-500/10 text-yellow-500 opacity-80 cursor-not-allowed font-bold text-[12px] gap-2 rounded-xl border border-yellow-500/20">
                  Aguardando Aprovação <Clock className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button className="w-full h-10 bg-green-600 hover:bg-green-500 text-white font-bold text-[12px] gap-2 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  Me Afiliar <Zap className="h-3.5 w-3.5" />
                </Button>
              )}
           </div>
        </div>
      </div>

      {/* Modal de Afiliação */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Afiliar-se ao Produto"
      >
        <div className="space-y-6">
           <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
                 <img src={offer.imageUrl || offer.product.imageUrl || "/assets/placeholder-product.png"} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                 <h4 className="text-[14px] font-bold text-white line-clamp-1">{offer.product.name}</h4>
                 <p className="text-[11px] text-[#64748b]">por <span className="text-white font-semibold">{offer.owner.name}</span></p>
              </div>
           </div>

           {isAffiliated ? (
             <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-1">
                   <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                     <CheckCircle2 className="h-6 w-6 text-green-500" />
                   </div>
                   <h5 className="text-[16px] font-black text-white uppercase tracking-tight">Você é um afiliado! 🎉</h5>
                   <p className="text-[12px] text-[#64748b]">Aproveite para divulgar seu link agora mesmo.</p>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#475569] uppercase tracking-widest ml-1">Seu Link de Afiliado</label>
                   <div className="relative flex gap-2">
                      <div className="flex-1 h-11 bg-black/40 border border-white/5 rounded-xl px-4 flex items-center overflow-hidden">
                         <span className="text-[12px] font-mono text-purple-400 truncate">{affiliateLink}</span>
                      </div>
                      <Button onClick={copyLink} className="h-11 w-11 p-0 rounded-xl bg-purple-600 hover:bg-purple-500 shrink-0">
                         <Copy className="h-4 w-4" />
                      </Button>
                   </div>
                </div>

                <Button variant="outline" className="w-full h-11 border-white/5 bg-white/[0.02] text-[#64748b] hover:text-white rounded-xl gap-2 font-bold text-[12px]">
                   <Share2 className="h-4 w-4" /> Compartilhar Link
                </Button>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-green-500/[0.03] border border-green-500/10 rounded-2xl flex flex-col gap-1 items-center justify-center text-center">
                      <span className="text-[18px] font-black text-green-500 leading-none">
                        {offer.commissionType === "PERCENTAGE" ? `${offer.commissionValue}%` : `R$ ${offer.commissionValue}`}
                      </span>
                      <span className="text-[9px] font-bold text-green-500/60 uppercase tracking-widest">Comissão</span>
                   </div>
                   <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col gap-1 items-center justify-center text-center">
                      <span className="text-[18px] font-black text-[#f1f5f9] leading-none">{offer.cookieDays}d</span>
                      <span className="text-[9px] font-bold text-[#475569] uppercase tracking-widest">Cookie</span>
                   </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-500/[0.03] border border-purple-500/10 rounded-2xl">
                   <Zap className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                   <div>
                      <h6 className="text-[13px] font-bold text-white">
                        {offer.requiresApproval ? "Aprovação Requerida" : "Aprovação Instantânea"}
                      </h6>
                      <p className="text-[11px] text-[#64748b] leading-tight mt-0.5">
                        {offer.requiresApproval 
                          ? "O produtor analisará seu perfil em até 48 horas." 
                          : "Você se torna afiliado e já ganha seu link em 1 segundo."}
                      </p>
                   </div>
                </div>

                <Button 
                  onClick={handleAffiliate} 
                  disabled={loading || isPending}
                  className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-black text-[14px] uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.3)] transition-all"
                >
                  {loading ? "Processando..." : isPending ? "Aguardando Aprovação" : "Confirmar Afiliação"}
                </Button>
             </div>
           )}
        </div>
      </Modal>
    </>
  );
}
