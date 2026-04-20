"use client";

import { CheckoutConfig } from "@/types/checkout-config";
import { Input } from "@/components/ui/Input";
import { Link2, MessageCircle, Undo2 } from "lucide-react";

interface Props {
  config: CheckoutConfig;
  onChange: (data: Partial<CheckoutConfig>) => void;
}

export function AdvancedTab({ config, onChange }: Props) {
  const reds = config.redirects || { backRedirectUrl: "", thankYouPageUrl: "" };
  const widget = config.triggers?.supportWidget || { enabled: false, whatsapp: "", instagram: "" };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ─── Redirecionamentos ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-purple-400" />
          <h3 className="text-[13px] font-bold text-[#f1f5f9] tracking-tight">Redirecionamentos</h3>
        </div>
        <p className="text-[12px] text-[#94a3b8]">Controle para onde o usuário vai antes e depois da venda.</p>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-5">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Undo2 className="h-3.5 w-3.5 text-[#94a3b8]" />
              <label className="text-[12px] font-medium text-[#94a3b8]">Back Redirect URL (Retenção)</label>
            </div>
            <Input 
              value={reds.backRedirectUrl}
              onChange={e => onChange({ redirects: { ...reds, backRedirectUrl: e.target.value } })}
              placeholder="https://sua-pagina.com/desconto"
              className="h-10 text-[13px]"
            />
            <p className="text-[10px] text-[#475569]">Disparado nativamente no pushState se o cliente tentar Voltar / Sair no navegador.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8]">Página de Obrigado (Customizada)</label>
            <Input 
              value={reds.thankYouPageUrl}
              onChange={e => onChange({ redirects: { ...reds, thankYouPageUrl: e.target.value } })}
              placeholder="https://sua-pagina.com/obrigado"
              className="h-10 text-[13px]"
            />
            <p className="text-[10px] text-[#475569]">Se vazia, o PulsePay usará a tela de obrigado padrão.</p>
          </div>

        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* ─── Widget de Suporte ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-purple-400" />
          <h3 className="text-[13px] font-bold text-[#f1f5f9] tracking-tight">Widget de Suporte</h3>
        </div>
        <p className="text-[12px] text-[#94a3b8]">Exiba botões flutuantes para recuperação de vendas.</p>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-5">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={widget.enabled}
              onChange={e => onChange({ triggers: { ...config.triggers, supportWidget: { ...widget, enabled: e.target.checked } } })}
              className="rounded border-white/10 bg-white/5 text-purple-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-[13px] font-medium text-[#f1f5f9]">Ativar Botões Flutuantes</span>
          </label>

          {widget.enabled && (
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#94a3b8]">WhatsApp Número</label>
                <Input 
                  value={widget.whatsapp}
                  onChange={e => onChange({ triggers: { ...config.triggers, supportWidget: { ...widget, whatsapp: e.target.value } } })}
                  placeholder="5511999999999"
                  className="h-10 text-[13px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#94a3b8]">Instagram Handle (Sem @)</label>
                <Input 
                  value={widget.instagram}
                  onChange={e => onChange({ triggers: { ...config.triggers, supportWidget: { ...widget, instagram: e.target.value } } })}
                  placeholder="seuperfil"
                  className="h-10 text-[13px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
