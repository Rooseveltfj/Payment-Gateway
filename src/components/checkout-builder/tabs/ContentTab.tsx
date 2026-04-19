"use client";

import { ContentConfig, BenefitItem } from "@/types/checkout-config";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, GripVertical, FileText, CheckCircle2, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  config: ContentConfig;
  onChange: (data: Partial<ContentConfig>) => void;
}

function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      {Icon && <Icon className="h-4 w-4 text-purple-400" />}
      <p className="text-[14px] font-bold text-white tracking-tight">{children}</p>
    </div>
  );
}

export function ContentTab({ config, onChange }: Props) {
  const addBenefit = () => {
    if (config.benefits.length >= 8) return;
    const newItem: BenefitItem = { id: Date.now().toString(), text: "Novo benefício incrível" };
    onChange({ benefits: [...config.benefits, newItem] });
  };

  const updateBenefit = (id: string, text: string) => {
    onChange({ benefits: config.benefits.map(b => b.id === id ? { ...b, text } : b) });
  };

  const removeBenefit = (id: string) => {
    onChange({ benefits: config.benefits.filter(b => b.id !== id) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ─── Textos Principais ─── */}
      <SectionLabel icon={FileText}>Cabeçalho do Checkout</SectionLabel>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Título Principal (Headline)</label>
          <Input
            value={config.headline}
            onChange={e => onChange({ headline: e.target.value })}
            className="h-11 bg-white/[0.02] border-white/5 text-[14px] focus:border-purple-500/50 transition-all rounded-xl"
            placeholder="Ex: Transforme sua vida hoje"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Subtítulo / Chamada Secundária</label>
          <Input
            value={config.subheadline}
            onChange={e => onChange({ subheadline: e.target.value })}
            className="h-11 bg-white/[0.02] border-white/5 text-[14px] focus:border-purple-500/50 transition-all rounded-xl"
            placeholder="Ex: Acesso imediato ao conteúdo completo"
          />
        </div>
      </div>

      {/* ─── Vídeo VSL ─── */}
      <SectionLabel icon={Video}>Vídeo VSL de Vendas</SectionLabel>
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#94a3b8] ml-1">URL do Vídeo (YouTube ou Vimeo)</label>
          <Input
            value={config.videoUrl}
            onChange={e => onChange({ videoUrl: e.target.value })}
            className="h-11 bg-white/[0.02] border-white/5 text-[14px] focus:border-purple-500/50 transition-all rounded-xl"
            placeholder="Ex: https://youtube.com/watch?v=..."
          />
        </div>
        {config.videoUrl && (
          <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-[11px] text-green-400 font-medium">
              Vídeo configurado. O player aparecerá no checkout no lugar do banner.
            </p>
          </div>
        )}
        {!config.videoUrl && (
          <p className="text-[11px] text-[#475569] ml-1">
            Se preenchido, o vídeo substituirá o banner no checkout. Suporte a YouTube e Vimeo.
          </p>
        )}
      </div>


      {/* ─── Lista de Benefícios ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between ml-1">
          <SectionLabel icon={CheckCircle2}>Lista de Benefícios</SectionLabel>
          <span className="text-[10px] font-bold text-[#475569]">{config.benefits.length}/8</span>
        </div>
        
        <div className="space-y-2">
          {config.benefits.map((benefit, idx) => (
            <div key={benefit.id} className="flex items-center gap-3 group bg-white/[0.01] border border-white/5 p-2 rounded-xl hover:border-white/10 transition-all">
              <div className="h-8 w-8 rounded-lg bg-black/40 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0">
                 <GripVertical className="h-4 w-4 text-[#475569]" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                 <span className="text-green-500 font-bold text-[14px]">✓</span>
                 <Input
                   value={benefit.text}
                   onChange={e => updateBenefit(benefit.id, e.target.value)}
                   className="h-8 bg-transparent border-none p-0 focus-visible:ring-0 text-[13px] text-[#f1f5f9]"
                   placeholder={`Benefício ${idx + 1}`}
                 />
              </div>
              <button
                onClick={() => removeBenefit(benefit.id)}
                className="opacity-0 group-hover:opacity-100 transition-all text-[#475569] hover:text-red-400 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {config.benefits.length < 8 && (
            <Button
              variant="ghost"
              className="w-full h-11 border border-dashed border-white/10 bg-transparent text-[#64748b] hover:border-purple-500/30 hover:text-purple-400 transition-all rounded-xl gap-2 mt-2"
              onClick={addBenefit}
            >
              <Plus className="h-4 w-4" /> Adicionar Benefício
            </Button>
          )}
        </div>
      </div>

      {/* ─── Descrição Detalhada ─── */}
      <div className="space-y-4">
         <SectionLabel>Texto de Apoio (Opcional)</SectionLabel>
         <textarea
            rows={4}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[14px] text-white placeholder:text-[#3d5166] focus:outline-none focus:border-purple-500/50 transition-all resize-none leading-relaxed"
            value={config.description}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Este texto aparece logo abaixo do título no checkout..."
          />
      </div>

    </div>
  );
}
