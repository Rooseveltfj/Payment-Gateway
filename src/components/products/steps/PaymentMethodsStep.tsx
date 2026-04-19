"use client";

import { QrCode, CreditCard, Receipt, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PaymentMethodsStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const methods = data.paymentMethods;

  const toggleMethod = (key: string) => {
    updateData({ 
      paymentMethods: { ...methods, [key]: !methods[key] } 
    });
  };

  const paymentOptions = [
    {
      id: "pix",
      title: "PIX",
      description: "Aprovação imediata com as menores taxas do mercado.",
      icon: QrCode,
      color: "text-[#22c55e]",
      bgColor: "bg-[#22c55e14]",
      borderColor: "border-[#22c55e33]"
    },
    {
      id: "credit_card",
      title: "Cartão de Crédito",
      description: "Alta conversão e parcelamentos em até 12 vezes.",
      icon: CreditCard,
      color: "text-[#3b82f6]",
      bgColor: "bg-[#3b82f614]",
      borderColor: "border-[#3b82f633]"
    },
    {
      id: "boleto",
      title: "Boleto Bancário",
      description: "Compensação em até 3 dias úteis. Taxa fixa reduzida.",
      icon: Receipt,
      color: "text-[#eab308]",
      bgColor: "bg-[#eab30814]",
      borderColor: "border-[#eab30833]"
    }
  ];

  return (
    <div className="max-w-[720px] mx-auto space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 py-4">
      <div className="space-y-4 text-center">
        <h3 className="text-xl font-bold text-[#f1f5f9]">Habilitar Meios de Pagamento</h3>
        <p className="text-[#64748b] text-[15px]">Selecione os métodos que estarão disponíveis no seu checkout.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paymentOptions.map((opt) => {
          const isSelected = methods[opt.id];
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              onClick={() => toggleMethod(opt.id)}
              className={cn(
                "group relative flex items-center gap-6 p-6 rounded-[20px] text-left transition-all duration-300 border",
                isSelected 
                  ? "border-[#8b5cf666] bg-[#8b5cf60a] shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                  : "border-white/[0.05] bg-[#0f0f1a] hover:border-white/[0.1] hover:bg-white/[0.02]"
              )}
            >
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300",
                isSelected ? "bg-[#8b5cf61a] border-[#8b5cf633] text-[#8b5cf6]" : cn(opt.bgColor, opt.borderColor, opt.color)
              )}>
                <Icon className="h-7 w-7" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "font-bold transition-colors",
                    isSelected ? "text-[#f1f5f9]" : "text-[#f1f5f9]/80"
                  )}>
                    {opt.title}
                  </h4>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b5cf61a] text-[#8b5cf6] uppercase tracking-wider">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#64748b] leading-relaxed group-hover:text-[#64748b]/80">
                  {opt.description}
                </p>
              </div>

              <div className={cn(
                "h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-300",
                isSelected 
                  ? "bg-[#8b5cf6] border-[#8b5cf6] text-white" 
                  : "bg-transparent border-white/[0.1]"
              )}>
                {isSelected && <CheckCircle2 className="h-4 w-4" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Conditional: Installments for Credit Card */}
      {methods.credit_card && (
        <div className="p-6 rounded-[20px] bg-white/[0.02] border border-white/[0.05] space-y-4 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[14px] font-bold text-[#f1f5f9]">Parcelamento Máximo</h4>
                <p className="text-[12px] text-[#64748b] mt-0.5">Defina em até quantas vezes seu cliente poderá parcelar.</p>
              </div>
              <div className="w-32">
                <select 
                  className="w-full h-11 rounded-xl border border-white/[0.1] bg-[#0d0d1c] px-3 text-sm text-[#f1f5f9] focus:ring-2 focus:ring-[#8b5cf633] outline-none transition-all cursor-pointer"
                  value={data.maxInstallments}
                  onChange={e => updateData({ maxInstallments: Number(e.target.value) })}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i+1}>{i+1}x sem juros</option>
                  ))}
                </select>
              </div>
           </div>
        </div>
      )}

      {/* Conditional: PIX Discount */}
      {methods.pix && (
        <div className="p-6 rounded-[20px] bg-white/[0.02] border border-white/[0.05] space-y-4 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between">
              <div className="flex-1 pr-8">
                <h4 className="text-[14px] font-bold text-[#f1f5f9]">Desconto no PIX</h4>
                <p className="text-[12px] text-[#64748b] mt-0.5">Incentive o pagamento à vista oferecendo um percentual de redução no valor final.</p>
              </div>
              <div className="relative w-24">
                <input 
                  type="number" 
                  min="0" max="100" 
                  className="w-full h-11 rounded-xl border border-white/[0.1] bg-[#0d0d1c] pl-3 pr-8 text-center text-sm font-bold text-[#f1f5f9] focus:ring-2 focus:ring-[#8b5cf633] outline-none transition-all"
                  value={data.pixDiscount || ""}
                  onChange={e => updateData({ pixDiscount: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#64748b]">%</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
