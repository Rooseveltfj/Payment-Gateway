"use client";

import { Input } from "@/components/ui/Input";
import { Tag, DollarSign, Link2, FileText, CheckCircle2 } from "lucide-react";

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
  return <p className="text-[14px] font-bold text-white tracking-tight mb-4 mt-8 first:mt-0">{children}</p>;
}

export function GeneralTab({ data, onChange }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ─── Informações Principais ─── */}
      <div>
        <SectionLabel>Informações Principais</SectionLabel>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Nome do Produto</label>
            <div className="relative group">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] group-focus-within:text-purple-400 transition-colors" />
              <Input
                value={data.name}
                onChange={e => onChange({ name: e.target.value })}
                className="pl-11 h-11 bg-white/[0.02] border-white/5 text-[14px] focus:border-purple-500/50 transition-all rounded-xl"
                placeholder="Ex: Mentoria VIP 2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Preço de Venda</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#475569] group-focus-within:text-green-500 transition-colors">R$</span>
              <Input
                type="number"
                value={data.price}
                onChange={e => onChange({ price: parseFloat(e.target.value) || 0 })}
                className="pl-12 h-11 bg-white/[0.02] border-white/5 text-[14px] focus:border-green-500/50 transition-all rounded-xl font-bold"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Links & Identificação ─── */}
      <div>
        <SectionLabel>Links & Identificação</SectionLabel>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Slug / URL Personalizada</label>
            <div className="relative group">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] group-focus-within:text-purple-400 transition-colors" />
              <Input
                value={data.slug}
                onChange={e => onChange({ slug: e.target.value })}
                className="pl-11 h-11 bg-white/[0.02] border-white/5 text-[14px] font-mono focus:border-purple-500/50 transition-all rounded-xl"
                placeholder="nome-do-produto"
              />
            </div>
            
            <div className="mt-4 p-4 bg-purple-500/[0.03] border border-purple-500/10 rounded-2xl">
               <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Link de Checkout</span>
               </div>
               <p className="text-[13px] font-mono text-[#94a3b8] break-all">
                 pay.PulsePay.com/c/<span className="text-white font-bold">{data.slug || "..."}</span>
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Descrição Técnica ─── */}
      <div>
        <SectionLabel>Descrição Técnica</SectionLabel>
        <div className="relative group">
          <FileText className="absolute left-3.5 top-4 h-4 w-4 text-[#475569] group-focus-within:text-purple-400 transition-colors" />
          <textarea
            value={data.description || ""}
            onChange={e => onChange({ description: e.target.value })}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#3d5166] focus:outline-none focus:border-purple-500/50 transition-all min-h-[120px] resize-none leading-relaxed"
            placeholder="Descreva seu produto para controle interno (não aparece para o cliente)..."
          />
        </div>
      </div>

    </div>
  );
}
