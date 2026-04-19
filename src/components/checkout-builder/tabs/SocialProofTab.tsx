"use client";

import { SocialProofConfig, Review, PopupInterval } from "@/types/checkout-config";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  Users, Bell, Star, Plus, Trash2, Wand2, 
  ChevronDown, MessageSquare, UserCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  config: SocialProofConfig;
  onChange: (data: Partial<SocialProofConfig>) => void;
}

interface AccordionSectionProps {
  title: string;
  icon: any;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}

function AccordionSection({ title, icon: Icon, enabled, onToggle, children }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(enabled);

  return (
    <div className={cn(
      "border rounded-[20px] transition-all duration-300 overflow-hidden",
      enabled ? "border-purple-500/30 bg-purple-500/[0.02]" : "border-white/5 bg-white/[0.01]"
    )}>
      <div 
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02]",
          isOpen && "border-b border-white/5"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            enabled ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-[#475569]"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[14px] font-bold tracking-tight transition-colors",
            enabled ? "text-white" : "text-[#64748b]"
          )}>{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={enabled} onCheckedChange={(v) => {
              onToggle(v);
              if (v) setIsOpen(true);
            }} />
          </div>
          <ChevronDown className={cn("h-4 w-4 text-[#475569] transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
             <div className={cn("p-5 space-y-6", !enabled && "opacity-50 pointer-events-none")}>
               {children}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BR_NAMES = ["Ana Paula", "Carlos Silva", "Fernanda Lima", "João Souza", "Mariana Costa", "Pedro Alves", "Juliana Rocha", "Rafael Mendes", "Camila Ferreira", "Lucas Oliveira"];
const BR_CITIES = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Porto Alegre, RS", "Curitiba, PR", "Fortaleza, CE", "Salvador, BA", "Recife, PE", "Manaus, AM", "Goiânia, GO"];

const REVIEWS_POOL = [
  "Melhor investimento que fiz este ano! Prático e eficiente.",
  "Estava receosa, mas a qualidade do conteúdo me surpreendeu positivamente.",
  "Suporte incrível, responderam todas as minhas dúvidas em minutos.",
  "Vale cada centavo. Os resultados vieram mais rápido do que eu esperava.",
  "Simplesmente o melhor do mercado. Design limpo e funcional.",
  "Já usei outros, mas o PulsePay é imbatível na conversão.",
  "Indico para todos os meus parceiros. Sensacional!",
  "A facilidade de uso é o ponto forte. Meus clientes adoraram o novo checkout."
];

export function SocialProofTab({ config, onChange }: Props) {
  const updPopup = (d: Partial<typeof config.popup>) => onChange({ popup: { ...config.popup, ...d } });
  const updReviews = (d: Partial<typeof config.reviews>) => onChange({ reviews: { ...config.reviews, ...d } });
  const updBuyerCount = (d: Partial<typeof config.buyerCount>) => onChange({ buyerCount: { ...config.buyerCount, ...d } });

  const addReview = () => {
    const r: Review = {
      id: Date.now().toString(),
      name: "Novo Cliente",
      photoUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      stars: 5,
      text: "Escreva aqui o depoimento...",
    };
    updReviews({ items: [...config.reviews.items, r] });
  };

  const generateAIViaLocal = () => {
    const generated: Review[] = Array.from({ length: 3 }, (_, i) => ({
      id: `ai-${Date.now()}-${i}`,
      name: BR_NAMES[Math.floor(Math.random() * BR_NAMES.length)],
      photoUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
      stars: (Math.random() > 0.1 ? 5 : 4) as 4|5,
      text: REVIEWS_POOL[Math.floor(Math.random() * REVIEWS_POOL.length)],
    }));
    updReviews({ items: [...config.reviews.items, ...generated] });
  };

  const updateReview = (id: string, data: Partial<Review>) => {
    updReviews({ items: config.reviews.items.map(r => r.id === id ? { ...r, ...data } : r) });
  };

  const deleteReview = (id: string) => {
    updReviews({ items: config.reviews.items.filter(r => r.id !== id) });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* ─── Notificações de Venda ─── */}
      <AccordionSection
        title="Notificações de Venda"
        icon={Bell}
        enabled={config.popup.enabled}
        onToggle={v => updPopup({ enabled: v })}
      >
        <div className="space-y-5">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Intervalo (Segundos)</label>
                <div className="relative">
                  <select
                    className="w-full h-10 bg-black/40 border border-white/5 rounded-xl px-4 text-[13px] text-white appearance-none outline-none focus:border-purple-500/50"
                    value={config.popup.interval}
                    onChange={e => updPopup({ interval: Number(e.target.value) as PopupInterval })}
                  >
                    {[5, 10, 15, 30].map(v => (
                      <option key={v} value={v}>{v} segundos</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Simular Nº Vendas</label>
                <Input 
                  type="number" 
                  value={config.popup.purchaseCount}
                  onChange={e => updPopup({ purchaseCount: Number(e.target.value) })}
                  className="h-10 text-[13px] bg-black/40"
                />
              </div>
           </div>

           <div className="space-y-2">
             <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Texto de Apoio</label>
             <Input 
                value={config.popup.purchaseCountText}
                onChange={e => updPopup({ purchaseCountText: e.target.value })}
                placeholder="Ex: pessoas compraram nas últimas 24h"
                className="h-10 text-[13px] bg-black/40"
             />
           </div>

           {/* Preview da Notificação */}
           <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
             <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-3 block">Preview do Popup</span>
             <div className="bg-[#0d0d12] border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-xl max-w-[280px]">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/20">
                   <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                   <p className="text-[12px] font-bold text-white leading-tight">Ana Paula de São Paulo...</p>
                   <p className="text-[10px] text-green-500 font-medium">acabou de comprar!</p>
                </div>
             </div>
           </div>
        </div>
      </AccordionSection>

      {/* ─── Avaliações Reais ─── */}
      <AccordionSection
        title="Avaliações & Estrelas"
        icon={Star}
        enabled={config.reviews.enabled}
        onToggle={v => updReviews({ enabled: v })}
      >
        <div className="space-y-6">
           {/* Display Mode */}
           <div className="space-y-2">
              <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Formato de Exibição</label>
              <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                {[
                  { id: "carousel", label: "Carrossel" },
                  { id: "list", label: "Lista Vertical" }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => updReviews({ display: s.id as any })}
                    className={cn(
                      "flex-1 py-1.5 text-[11px] font-bold transition-all rounded-lg",
                      config.reviews.display === s.id
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-[#64748b] hover:text-white"
                    )}
                  >{s.label}</button>
                ))}
              </div>
           </div>

           {/* Actions */}
           <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 h-10 border-white/5 bg-white/[0.02] text-[#f1f5f9] hover:bg-white/5 text-[12px] gap-2 font-bold rounded-xl"
                onClick={addReview}
              >
                <Plus className="h-4 w-4 text-purple-400" /> Adicionar Avaliação
              </Button>
              <Button 
                variant="outline"
                className="flex-1 h-10 border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 text-[12px] gap-2 font-bold rounded-xl"
                onClick={generateAIViaLocal}
              >
                <Wand2 className="h-4 w-4" /> Gerar com IA
              </Button>
           </div>

           {/* Reviews List */}
           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {config.reviews.items.map((r, idx) => (
                <div key={r.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative group">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                         <img src={r.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <Input 
                            value={r.name} 
                            onChange={e => updateReview(r.id, { name: e.target.value })}
                            className="h-8 bg-transparent border-none p-0 focus-visible:ring-0 text-[13px] font-bold placeholder:text-[#475569]"
                            placeholder="Nome do Cliente"
                         />
                         <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(star => (
                               <Star 
                                  key={star} 
                                  onClick={() => updateReview(r.id, { stars: star as any })}
                                  className={cn(
                                     "h-3.5 w-3.5 cursor-pointer transition-colors",
                                     star <= r.stars ? "fill-yellow-500 text-yellow-500" : "text-[#1e1b4b]"
                                  )}
                               />
                            ))}
                         </div>
                      </div>
                      <button 
                        onClick={() => deleteReview(r.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-[#475569] hover:text-red-400 transition-all absolute top-2 right-2"
                      >
                         <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                   <textarea 
                      value={r.text}
                      onChange={e => updateReview(r.id, { text: e.target.value })}
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-[12px] text-[#94a3b8] placeholder:text-[#3d5166] focus:outline-none focus:border-purple-500/30 transition-all resize-none leading-relaxed"
                      rows={2}
                      placeholder="Depoimento do cliente..."
                   />
                </div>
              ))}
           </div>
        </div>
      </AccordionSection>

      {/* ─── Contador de Alunos ─── */}
      <AccordionSection
        title="Contador de Alunos"
        icon={Users}
        enabled={config.buyerCount.enabled}
        onToggle={v => updBuyerCount({ enabled: v })}
      >
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Nº Compradores</label>
             <Input 
                type="number"
                value={config.buyerCount.count}
                onChange={e => updBuyerCount({ count: Number(e.target.value) })}
                className="h-10 text-[13px] bg-black/40"
             />
           </div>
           <div className="space-y-2">
             <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Termo (Ex: alunos)</label>
             <Input 
                value={config.buyerCount.label}
                onChange={e => updBuyerCount({ label: e.target.value })}
                className="h-10 text-[13px] bg-black/40"
             />
           </div>
        </div>
      </AccordionSection>

    </div>
  );
}
