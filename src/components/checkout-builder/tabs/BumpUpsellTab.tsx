"use client";

import { BumpUpsellConfig } from "@/types/checkout-config";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface Props {
  config: BumpUpsellConfig;
  onChange: (data: Partial<BumpUpsellConfig>) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

function SectionCard({ title, subtitle, enabled, onToggle, children }: {
  title: string; subtitle: string; enabled: boolean; onToggle: (v: boolean) => void; children: React.ReactNode
}) {
  return (
    <div className={cn(
      "rounded-xl border transition-colors",
      enabled ? "border-primary/40 bg-primary/5" : "border-border bg-card"
    )}>
      <div className="flex items-start justify-between p-3 gap-3">
        <div>
          <span className="text-sm font-semibold text-text-primary block">{title}</span>
          <span className="text-[11px] text-text-secondary">{subtitle}</span>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      {enabled && <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-3">{children}</div>}
    </div>
  );
}

export function BumpUpsellTab({ config, onChange }: Props) {
  const updBump = (d: Partial<typeof config.orderBump>) =>
    onChange({ orderBump: { ...config.orderBump, ...d } });
  const updUpsell = (d: Partial<typeof config.upsell>) =>
    onChange({ upsell: { ...config.upsell, ...d } });

  return (
    <div className="space-y-3">
      <SectionLabel>⚡ Order Bump</SectionLabel>
      <SectionCard
        title="Order Bump"
        subtitle="Oferta adicional exibida antes do pagamento"
        enabled={config.orderBump.enabled}
        onToggle={v => updBump({ enabled: v })}
      >
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Nome do Produto no Bump</label>
          <Input value={config.orderBump.productName}
            onChange={e => updBump({ productName: e.target.value })}
            className="text-xs h-8" placeholder="Ex: Bônus Exclusivo — Templates Premium" />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Preço Especial (R$)</label>
          <Input type="number" min={0} step={0.01}
            value={config.orderBump.specialPrice || ""}
            onChange={e => updBump({ specialPrice: parseFloat(e.target.value) })}
            className="text-xs h-8" placeholder="27,00" />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Texto de Apresentação</label>
          <textarea rows={2}
            className="w-full text-xs rounded border border-border bg-background px-2 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            value={config.orderBump.presentationText}
            onChange={e => updBump({ presentationText: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">URL da Imagem do Bump</label>
          <Input value={config.orderBump.imageUrl || ""}
            onChange={e => updBump({ imageUrl: e.target.value })}
            className="text-xs h-8" placeholder="https://..." />
        </div>
      </SectionCard>

      <SectionLabel>🚀 Upsell Pós-Compra</SectionLabel>
      <SectionCard
        title="Upsell"
        subtitle="Oferta exibida na página de obrigado, após pagamento confirmado"
        enabled={config.upsell.enabled}
        onToggle={v => updUpsell({ enabled: v })}
      >
        <div>
          <label className="text-xs text-text-secondary mb-1 block">URL da Página de Upsell</label>
          <Input value={config.upsell.url}
            onChange={e => updUpsell({ url: e.target.value })}
            className="text-xs h-8" placeholder="https://seusite.com/upsell" />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Redirecionar automaticamente após</label>
          <div className="flex items-center gap-2">
            <Input type="number" min={0} max={60}
              value={config.upsell.redirectSeconds}
              onChange={e => updUpsell({ redirectSeconds: Number(e.target.value) })}
              className="text-xs h-8 w-20" />
            <span className="text-xs text-text-secondary">segundos (0 = não redirecionar)</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
