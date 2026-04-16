"use client";

import { ContentConfig, BenefitItem } from "@/types/checkout-config";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Props {
  config: ContentConfig;
  onChange: (data: Partial<ContentConfig>) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

export function ContentTab({ config, onChange }: Props) {
  const addBenefit = () => {
    const newItem: BenefitItem = { id: Date.now().toString(), text: "Novo benefício" };
    onChange({ benefits: [...config.benefits, newItem] });
  };

  const updateBenefit = (id: string, text: string) => {
    onChange({ benefits: config.benefits.map(b => b.id === id ? { ...b, text } : b) });
  };

  const removeBenefit = (id: string) => {
    onChange({ benefits: config.benefits.filter(b => b.id !== id) });
  };

  const getVideoEmbed = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    return null;
  };

  return (
    <div className="space-y-1">
      <SectionLabel>Textos Principais</SectionLabel>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Título Principal</label>
          <Input
            value={config.headline}
            onChange={e => onChange({ headline: e.target.value })}
            className="text-sm"
            placeholder="Transforme sua vida hoje"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Subtítulo / Chamada</label>
          <Input
            value={config.subheadline}
            onChange={e => onChange({ subheadline: e.target.value })}
            className="text-sm"
            placeholder="Acesso imediato ao conteúdo"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Descrição do Produto</label>
          <textarea
            rows={3}
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={config.description}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Descreva o produto em detalhes..."
          />
        </div>
      </div>

      <SectionLabel>Lista de Benefícios</SectionLabel>
      <div className="space-y-2">
        {config.benefits.map(benefit => (
          <div key={benefit.id} className="flex items-center gap-2 group">
            <GripVertical className="h-4 w-4 text-text-secondary/40 shrink-0" />
            <span className="text-success text-sm shrink-0">✓</span>
            <Input
              value={benefit.text}
              onChange={e => updateBenefit(benefit.id, e.target.value)}
              className="text-xs flex-1 h-8"
            />
            <button
              onClick={() => removeBenefit(benefit.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-error"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addBenefit} className="w-full text-xs mt-1">
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Benefício
        </Button>
      </div>

      <SectionLabel>Vídeo de Vendas</SectionLabel>
      <div>
        <label className="text-xs text-text-secondary mb-1 block">URL do Vídeo (YouTube ou Vimeo)</label>
        <Input
          value={config.videoUrl}
          onChange={e => onChange({ videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="text-xs"
        />
        {config.videoUrl && (
          <p className="text-[11px] text-success mt-1">
            ✓ {getVideoEmbed(config.videoUrl) === "youtube" ? "YouTube" : getVideoEmbed(config.videoUrl) === "vimeo" ? "Vimeo" : "URL"} detectado — aparecerá na prévia
          </p>
        )}
      </div>
    </div>
  );
}
