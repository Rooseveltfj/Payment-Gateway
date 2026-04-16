"use client";

import { TriggersConfig, TimerDuration, TimerStyle } from "@/types/checkout-config";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface Props {
  config: TriggersConfig;
  onChange: (data: Partial<TriggersConfig>) => void;
}

function SectionCard({ title, enabled, onToggle, children }: {
  title: string; enabled: boolean; onToggle: (v: boolean) => void; children: React.ReactNode
}) {
  return (
    <div className={cn(
      "rounded-xl border transition-colors",
      enabled ? "border-primary/40 bg-primary/5" : "border-border bg-card"
    )}>
      <div className="flex items-center justify-between p-3">
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      {enabled && <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-3">{children}</div>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

const DURATIONS: { value: TimerDuration; label: string }[] = [
  { value: "10min", label: "10 min" },
  { value: "30min", label: "30 min" },
  { value: "1h", label: "1 hora" },
  { value: "24h", label: "24 horas" },
  { value: "custom", label: "Custom" },
];

export function TriggersTab({ config, onChange }: Props) {
  const updScarcity = (d: Partial<typeof config.scarcity>) => onChange({ scarcity: { ...config.scarcity, ...d } });
  const updCountdown = (d: Partial<typeof config.scarcity.countdown>) =>
    updScarcity({ countdown: { ...config.scarcity.countdown, ...d } });
  const updUrgency = (d: Partial<typeof config.urgency>) => onChange({ urgency: { ...config.urgency, ...d } });
  const updAuth = (d: Partial<typeof config.authority>) => onChange({ authority: { ...config.authority, ...d } });
  const updGuarantee = (d: Partial<typeof config.guarantee>) => onChange({ guarantee: { ...config.guarantee, ...d } });

  return (
    <div className="space-y-3">
      <SectionLabel>⏳ Escassez</SectionLabel>

      <SectionCard
        title="⏱ Contador Regressivo"
        enabled={config.scarcity.countdownEnabled}
        onToggle={v => updScarcity({ countdownEnabled: v, countdown: { ...config.scarcity.countdown, enabled: v } })}
      >
        <div>
          <label className="text-xs text-text-secondary mb-1.5 block">Texto acima do timer</label>
          <Input value={config.scarcity.countdown.label} onChange={e => updCountdown({ label: e.target.value })} className="text-xs h-8" />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1.5 block">Duração</label>
          <div className="grid grid-cols-3 gap-1.5">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => updCountdown({ duration: d.value })}
                className={cn(
                  "py-1.5 text-[11px] rounded border font-medium transition-all",
                  config.scarcity.countdown.duration === d.value
                    ? "border-primary bg-primary text-white"
                    : "border-border text-text-secondary hover:border-primary/50"
                )}
              >{d.label}</button>
            ))}
          </div>
          {config.scarcity.countdown.duration === "custom" && (
            <div className="mt-2">
              <Input
                type="number"
                min={1}
                placeholder="Minutos"
                value={config.scarcity.countdown.customMinutes || ""}
                onChange={e => updCountdown({ customMinutes: Number(e.target.value) })}
                className="text-xs h-8"
              />
            </div>
          )}
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1.5 block">Estilo do Timer</label>
          <div className="grid grid-cols-2 gap-2">
            {(["minimal", "urgent"] as TimerStyle[]).map(s => (
              <button
                key={s}
                onClick={() => updCountdown({ style: s })}
                className={cn(
                  "py-2 text-xs rounded border capitalize transition-all",
                  config.scarcity.countdown.style === s
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-text-secondary"
                )}
              >{s === "minimal" ? "Minimalista" : "🚨 Urgente"}</button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="🚪 Vagas Limitadas"
        enabled={config.scarcity.vacanciesEnabled}
        onToggle={v => updScarcity({ vacanciesEnabled: v })}
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Quantidade</label>
            <Input type="number" min={1} value={config.scarcity.vacanciesCount}
              onChange={e => updScarcity({ vacanciesCount: Number(e.target.value) })} className="text-xs h-8" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Texto</label>
            <Input value={config.scarcity.vacanciesText}
              onChange={e => updScarcity({ vacanciesText: e.target.value })} className="text-xs h-8"
              placeholder="Restam {n} vagas" />
          </div>
        </div>
      </SectionCard>

      <SectionLabel>🔥 Urgência</SectionLabel>
      <SectionCard title="Banner de Topo" enabled={config.urgency.enabled} onToggle={v => updUrgency({ enabled: v })}>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Texto do Banner</label>
          <Input value={config.urgency.text} onChange={e => updUrgency({ text: e.target.value })} className="text-xs h-8" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary">Cor de Fundo</label>
          <input type="color" value={config.urgency.bgColor}
            onChange={e => updUrgency({ bgColor: e.target.value })}
            className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent" />
        </div>
      </SectionCard>

      <SectionLabel>🔒 Autoridade</SectionLabel>
      <div className="bg-card border border-border rounded-xl p-3 space-y-2.5">
        {([
          ["sealSecure", "🔒 Compra 100% segura"],
          ["sealSatisfaction", "📜 Satisfação garantida"],
          ["sealProtected", "🛡️ Dados protegidos"],
          ["showPaymentLogos", "💳 Logos de pagamento (Visa, Pix...)"],
        ] as [keyof typeof config.authority, string][]).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-text-primary">{label}</span>
            <Switch checked={config.authority[key]} onCheckedChange={v => updAuth({ [key]: v })} />
          </div>
        ))}
      </div>

      <SectionLabel>🛡️ Garantia</SectionLabel>
      <SectionCard title="Garantia de Devolução" enabled={config.guarantee.enabled}
        onToggle={v => updGuarantee({ enabled: v })}>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Dias de Garantia</label>
          <div className="grid grid-cols-3 gap-1.5">
            {([7, 14, 30] as const).map(d => (
              <button key={d} onClick={() => updGuarantee({ days: d })}
                className={cn("py-1.5 text-xs rounded border transition-all",
                  config.guarantee.days === d ? "border-primary bg-primary text-white font-bold" : "border-border text-text-secondary"
                )}
              >{d} dias</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Texto da Garantia</label>
          <textarea rows={2}
            className="w-full text-xs rounded border border-border bg-background px-2 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            value={config.guarantee.text}
            onChange={e => updGuarantee({ text: e.target.value })}
          />
        </div>
      </SectionCard>
    </div>
  );
}
