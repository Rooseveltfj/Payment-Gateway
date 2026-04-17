"use client";

import { PixelsConfig } from "@/types/checkout-config";
import { Input } from "@/components/ui/Input";

interface Props {
  config: PixelsConfig;
  onChange: (data: Partial<PixelsConfig>) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

function PixelField({ label, badge, placeholder, value, onChange }: {
  label: string; badge: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-text-primary">{label}</span>
        <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-text-secondary font-mono">{badge}</span>
      </div>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="text-xs h-8 font-mono" />
    </div>
  );
}

export function PixelsTab({ config, onChange }: Props) {
  return (
    <div className="space-y-1">
      <SectionLabel>Plataformas de Rastreamento</SectionLabel>

      <div className="space-y-3">
        <PixelField
          label="Meta (Facebook) Pixel"
          badge="PageView · Purchase"
          placeholder="123456789012345"
          value={config.metaPixelId}
          onChange={v => onChange({ metaPixelId: v })}
        />
        <PixelField
          label="Google Tag Manager"
          badge="GTM-XXXXXX"
          placeholder="GTM-AB12CD"
          value={config.gtmId}
          onChange={v => onChange({ gtmId: v })}
        />
        <PixelField
          label="TikTok Pixel"
          badge="TikTok Ads"
          placeholder="CXXXXXXXXXXXXXXXX"
          value={config.tiktokPixelId}
          onChange={v => onChange({ tiktokPixelId: v })}
        />
        <PixelField
          label="Google Analytics 4"
          badge="GA4"
          placeholder="G-XXXXXXXXXX"
          value={config.ga4Id}
          onChange={v => onChange({ ga4Id: v })}
        />
      </div>

      <SectionLabel>Código Personalizado</SectionLabel>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Injetar no &lt;head&gt;</label>
          <textarea
            rows={4}
            className="w-full text-xs font-mono rounded border border-border bg-background px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            value={config.customHead}
            onChange={e => onChange({ customHead: e.target.value })}
            placeholder={"<!-- Scripts, meta tags, estilos customizados -->"}
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Injetar no &lt;body&gt;</label>
          <textarea
            rows={4}
            className="w-full text-xs font-mono rounded border border-border bg-background px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            value={config.customBody}
            onChange={e => onChange({ customBody: e.target.value })}
            placeholder={"<!-- Scripts de chat, widgets, eventos customizados -->"}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
        <p className="text-xs text-warning font-semibold mb-1">⚠️ Atenção</p>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Códigos injetados são executados no checkout do comprador. Certifique-se de utilizar apenas scripts confiáveis. A PulsePay não se responsabiliza por scripts de terceiros.
        </p>
      </div>
    </div>
  );
}
