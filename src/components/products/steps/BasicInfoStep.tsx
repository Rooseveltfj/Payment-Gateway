"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Sparkles, Check, X, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";

interface BasicInfoStepProps {
  data: any;
  updateData: (d: any) => void;
}

export function BasicInfoStep({ data, updateData }: BasicInfoStepProps) {
  const [slugStatus, setSlugStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [formattedPrice, setFormattedPrice] = useState("");

  // Initial Price Formatting
  useEffect(() => {
    if (data.price) {
      setFormattedPrice(formatCurrency(data.price.toString()));
    }
  }, []);

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const amount = parseInt(digits || "0") / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(value || "0") / 100;
    setFormattedPrice(formatCurrency(value));
    updateData({ price: numericValue });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.slice(0, 80);
    const newSlug = slugify(name);
    updateData({ 
      name, 
      slug: name ? newSlug : data.slug 
    });
    if (name) setSlugStatus("valid");
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    updateData({ slug: rawVal });
    setSlugStatus(rawVal.length > 0 ? "valid" : "invalid");
  };

  const regenerateSlug = () => {
    const newSlug = slugify(data.name || "produto");
    updateData({ slug: newSlug });
    setSlugStatus("valid");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* ─── Left Column (7/12) ─── */}
      <div className="lg:col-span-7 space-y-8">
        {/* Nome do Produto */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[14px] font-semibold text-[#f1f5f9]">Nome do Produto *</label>
            <span className={cn(
              "text-[11px] font-medium transition-colors",
              data.name?.length >= 80 ? "text-red-400" : "text-[#3d5166]"
            )}>
              {data.name?.length || 0}/80
            </span>
          </div>
          <Input
            placeholder="Ex: Mentoria VIP 2024"
            className={cn(
              "h-12 bg-black/40 border-white/[0.05] focus:border-accent text-[15px] rounded-[14px]",
              !data.name && "border-red-500/10"
            )}
            value={data.name}
            onChange={handleNameChange}
            required
          />
        </div>

        {/* Preço e Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#f1f5f9] ml-1">Preço (R$) *</label>
            <div className="relative group">
              <Input
                placeholder="0,00"
                className="h-12 bg-[#09090b] border-white/5 pl-10 font-bold text-white placeholder:text-[#1e293b]"
                value={formattedPrice}
                onChange={handlePriceChange}
                prefix={<span className="text-[#3d5166] font-bold text-sm">R$</span>}
              />
            </div>
            {data.price > 0 && (
              <p className="text-[12px] text-green-400 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
                R$ {data.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#f1f5f9] ml-1">Tipo de Cobrança</label>
            <Select
              value={data.type}
              onChange={(val) => updateData({ type: val })}
              options={[
                { label: "💳 Pagamento Único", value: "SINGLE" },
                { label: "🔁 Assinatura Recorrente", value: "SUBSCRIPTION" },
                { label: "📦 Parcelado", value: "INSTALLMENT", disabled: true },
              ]}
            />
            {data.type === "INSTALLMENT" && (
              <span className="inline-flex px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-bold text-accent uppercase tracking-tighter">Em breve</span>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between px-1">
            <label className="text-[13px] font-medium text-[#94a3b8]">Descrição (Opcional)</label>
            <span className="text-[11px] font-medium text-[#3d5166]">
              {data.description?.length || 0}/500
            </span>
          </div>
          <textarea
            placeholder="Explique o que o cliente receberá ao adquirir este produto..."
            className="w-full min-h-[140px] bg-[#09090b] border border-white/5 rounded-[12px] p-4 text-[14px] text-white placeholder:text-[#3d5166] focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all resize-y"
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value.slice(0, 500) })}
          />
        </div>

        {/* Slug URL */}
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-[#94a3b8] ml-1">Slug URL</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#3d5166] text-[14px] font-bold select-none pointer-events-none">
              pay.PulsePay.com/
            </div>
            <Input
              className={cn(
                "h-12 bg-[#09090b] border-white/5 pl-[135px] pr-10 text-white font-medium",
                slugStatus === "valid" && "border-green-500/20",
                slugStatus === "invalid" && "border-red-500/20"
              )}
              value={data.slug}
              onChange={handleSlugChange}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {slugStatus === "valid" ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : slugStatus === "invalid" ? (
                <X className="w-4 h-4 text-red-500" />
              ) : null}
              <button
                type="button"
                onClick={regenerateSlug}
                className="p-1.5 text-[#3d5166] hover:text-accent hover:rotate-180 transition-all duration-500"
                title="Regenerar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          {data.slug && (
            <p className="text-[11px] text-[#3d5166] font-medium ml-1">
              Visualização: <span className="text-accent underline cursor-pointer">pay.PulsePay.com/{data.slug}</span>
            </p>
          )}
        </div>
      </div>

      {/* ─── Right Column (5/12) ─── */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-4">
          <ImageUpload
            label="Capa do Produto"
            value={data.imageUrl}
            onChange={(url) => updateData({ imageUrl: url })}
            aspectRatio="16/9"
            hint="Recomendamos imagens 1280x720 para melhor visualização."
          />

          {/* Dica de Conversão */}
          <div className="p-5 rounded-2xl bg-accent/[0.04] border border-accent/10 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-white leading-tight">
                  Aumente suas vendas em até <span className="text-green-400">35%</span>
                </p>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  Produtos com capas de alta qualidade transmitem mais autoridade e segurança aos compradores.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dica Adicional de Preço */}
        <div className="p-4 rounded-xl bg-[#1e293b10] border border-white/5 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#3d5166] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#64748b] leading-relaxed italic">
            O preço final exibido ao cliente incluirá as taxas configuradas se você optar por repassar os custos.
          </p>
        </div>
      </div>
    </div>
  );
}
