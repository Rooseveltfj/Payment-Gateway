"use client";

import { QrCode, CreditCard, Receipt } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PaymentMethodsStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const methods = data.paymentMethods;

  const toggleMethod = (key: string, val: boolean) => {
    updateData({ paymentMethods: { ...methods, [key]: val } });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 py-4">
      
      <div className="space-y-4">
        {/* PIX */}
        <div className="p-4 border border-border rounded-xl flex items-center justify-between bg-card shrink-0 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                PIX
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded uppercase font-bold tracking-wider">Aprovação Instantânea</span>
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">Dinheiro direto na conta com as menores taxas.</p>
            </div>
          </div>
          <Switch checked={methods.pix} onCheckedChange={v => toggleMethod("pix", v)} />
        </div>

        {/* CREDIT CARD */}
        <div className="p-4 border border-border rounded-xl flex items-center justify-between bg-card shrink-0 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Cartão de Crédito</h4>
              <p className="text-xs text-text-secondary mt-0.5">Permite alta conversão com parcelamentos estendidos.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {methods.credit_card && (
               <div className="w-24">
                  <select 
                    className="w-full text-xs h-8 rounded-md border border-border bg-background px-2 focus:ring-primary focus:border-primary"
                    value={data.maxInstallments}
                    onChange={e => updateData({ maxInstallments: Number(e.target.value) })}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i+1}>Ate {i+1}x</option>
                    ))}
                  </select>
               </div>
             )}
             <Switch checked={methods.credit_card} onCheckedChange={v => toggleMethod("credit_card", v)} />
          </div>
        </div>

        {/* BOLETO */}
        <div className="p-4 border border-border rounded-xl flex items-center justify-between bg-card shrink-0 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Boleto Bancário</h4>
              <p className="text-xs text-text-secondary mt-0.5">Compensação em até 3 dias úteis. Taxa fixa aplicável.</p>
            </div>
          </div>
          <Switch checked={methods.boleto} onCheckedChange={v => toggleMethod("boleto", v)} />
        </div>
      </div>

       {methods.pix && (
         <div className="mt-8 pt-6 border-t border-border">
           <h3 className="text-sm font-semibold text-text-primary mb-1">Desconto no PIX</h3>
           <p className="text-xs text-text-secondary mb-4">Incentive o pagamento à vista oferecendo um percentual de redução.</p>
           
           <div className="flex items-center gap-3">
              <Input 
                 type="number" 
                 min="0" max="100" 
                 placeholder="0" 
                 className="w-24 text-center" 
                 value={data.pixDiscount || ""}
                 onChange={e => updateData({ pixDiscount: Number(e.target.value) })}
              />
              <span className="text-sm font-medium text-text-primary">% de desconto na conversão PIX</span>
           </div>
         </div>
       )}
    </div>
  );
}
