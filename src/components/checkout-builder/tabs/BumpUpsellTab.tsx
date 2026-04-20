"use client";

import { BumpUpsellConfig, OrderBumpConfig } from "@/types/checkout-config";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Tag, Layers, RefreshCw } from "lucide-react";

interface Props {
  config: BumpUpsellConfig;
  onChange: (data: Partial<BumpUpsellConfig>) => void;
}

export function BumpUpsellTab({ config, onChange }: Props) {
  const bumps = config.orderBumps || [];

  const addBump = () => {
    const newBump: OrderBumpConfig = {
      id: Math.random().toString(36).substring(7),
      enabled: true,
      productId: null,
      productName: "",
      presentationText: "⚡ Aproveite e leve também!",
      specialPrice: 0,
      imageUrl: null,
    };
    onChange({ orderBumps: [...bumps, newBump] });
  };

  const updateBump = (id: string, data: Partial<OrderBumpConfig>) => {
    onChange({
      orderBumps: bumps.map(b => b.id === id ? { ...b, ...data } : b)
    });
  };

  const removeBump = (id: string) => {
    onChange({
      orderBumps: bumps.filter(b => b.id !== id)
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ─── Order Bumps ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <h3 className="text-[13px] font-bold text-[#f1f5f9] tracking-tight">Order Bumps</h3>
        </div>
        <p className="text-[12px] text-[#94a3b8]">Ofereça produtos complementares no checkout com 1 clique.</p>

        <div className="space-y-4">
          {bumps.map((bump, index) => (
            <div key={bump.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-500/20 text-purple-400 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    BUMP {index + 1}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bump.enabled}
                      onChange={e => updateBump(bump.id, { enabled: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-purple-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-[12px] text-[#94a3b8]">Ativo</span>
                  </label>
                </div>
                <button
                  onClick={() => removeBump(bump.id)}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#94a3b8]">Nome da Oferta</label>
                  <Input 
                    value={bump.productName}
                    onChange={e => updateBump(bump.id, { productName: e.target.value })}
                    placeholder="Ex: Grupo VIP (1 Ano)"
                    className="h-10 text-[13px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#94a3b8]">Texto Retórica (Pitch)</label>
                  <Input 
                    value={bump.presentationText}
                    onChange={e => updateBump(bump.id, { presentationText: e.target.value })}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#94a3b8]">Preço Especial (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-[10px] text-[13px] text-[#64748b]">R$</span>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={bump.specialPrice}
                      onChange={e => updateBump(bump.id, { specialPrice: parseFloat(e.target.value) || 0 })}
                      className="h-10 pl-9 text-[13px]"
                    />
                  </div>
                </div>

                <ImageUpload
                  label="Imagem do Produto (Opcional)"
                  value={bump.imageUrl}
                  onChange={v => updateBump(bump.id, { imageUrl: v })}
                  aspectRatio="1/1"
                  maxSizeMB={1}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addBump}
            className="w-full py-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group flex flex-col items-center justify-center gap-2"
          >
            <div className="h-10 w-10 rounded-full bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center transition-all">
              <Plus className="h-5 w-5 text-[#94a3b8] group-hover:text-purple-400" />
            </div>
            <div className="text-center">
              <span className="block text-[13px] font-bold text-[#e2e8f0]">
                {bumps.length === 0 ? "Criar primeiro order bump" : "Adicionar novo order bump"}
              </span>
              <span className="text-[11px] text-[#64748b] mt-1 block">Clique para adicionar uma nova oferta complementar</span>
            </div>
          </button>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* ─── Upsell (Pós-venda) ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-purple-400" />
          <h3 className="text-[13px] font-bold text-[#f1f5f9] tracking-tight">Upsell (1-Click)</h3>
        </div>
        <p className="text-[12px] text-[#94a3b8]">Oferecido log após a aprovação de uma compra no cartão/pix.</p>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={config.upsell.enabled}
              onChange={e => onChange({ upsell: { ...config.upsell, enabled: e.target.checked } })}
              className="rounded border-white/10 bg-white/5 text-purple-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-[13px] font-medium text-[#f1f5f9]">Ativar Upsell Flow</span>
          </label>

          {config.upsell.enabled && (
            <>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#94a3b8]">URL da Página de Upsell</label>
                <Input 
                  value={config.upsell.url}
                  onChange={e => onChange({ upsell: { ...config.upsell, url: e.target.value } })}
                  placeholder="https://sua-pagina.com/upsell"
                  className="h-10 text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#94a3b8]">Redirecionar após (segundos)</label>
                <Input 
                  type="number"
                  min="0"
                  value={config.upsell.redirectSeconds}
                  onChange={e => onChange({ upsell: { ...config.upsell, redirectSeconds: parseInt(e.target.value) || 0 } })}
                  className="h-10 text-[13px]"
                />
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
