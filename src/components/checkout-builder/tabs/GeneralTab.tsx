"use client";

import { Input } from "@/components/ui/Input";
import { DollarSign, Tag, Link2, FileText, Camera } from "lucide-react";

interface ProductData {
  name: string;
  price: number;
  slug: string;
  description: string | null;
}

interface Props {
  data: ProductData;
  onChange: (data: Partial<ProductData>) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

export function GeneralTab({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Informações Principais</SectionLabel>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Nome do Produto</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
              <Input
                value={data.name}
                onChange={e => onChange({ name: e.target.value })}
                className="pl-9 text-sm"
                placeholder="Ex: Mentoria VIP 2024"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1 block">Preço de Venda (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
              <Input
                type="number"
                value={data.price}
                onChange={e => onChange({ price: parseFloat(e.target.value) || 0 })}
                className="pl-9 text-sm"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Links & Identificação</SectionLabel>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Slug / URL Personalizada</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
              <Input
                value={data.slug}
                onChange={e => onChange({ slug: e.target.value })}
                className="pl-9 text-sm font-mono"
                placeholder="nome-do-produto"
              />
            </div>
            <p className="text-[10px] text-text-secondary mt-1 ml-1">
              Link final: pulsepay.com.br/c/{data.slug || "..."}
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Descrição Técnica</SectionLabel>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-3.5 w-3.5 text-text-secondary" />
          <textarea
            value={data.description || ""}
            onChange={e => onChange({ description: e.target.value })}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-none text-text-primary"
            placeholder="Descreva seu produto para controle interno..."
          />
        </div>
      </div>
    </div>
  );
}
