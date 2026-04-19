"use client";

import { TriggersConfig, TimerDuration, TimerStyle } from "@/types/checkout-config";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Zap, Clock, Users, ShieldCheck, ChevronDown, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  config: TriggersConfig;
  onChange: (data: Partial<TriggersConfig>) => void;
}

interface AccordionSectionProps {
  title: string;
  icon: any;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}

function AccordionSection({ title, icon: Icon, enabled, onToggle, children }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(enabled);

  return (
    <div className={cn(
      "border rounded-[20px] transition-all duration-300 overflow-hidden",
      enabled ? "border-purple-500/30 bg-purple-500/[0.02]" : "border-white/5 bg-white/[0.01]"
    )}>
      <div 
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02]",
          isOpen && "border-b border-white/5"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            enabled ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-[#475569]"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[14px] font-bold tracking-tight transition-colors",
            enabled ? "text-white" : "text-[#64748b]"
          )}>{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={enabled} onCheckedChange={(v) => {
              onToggle(v);
              if (v) setIsOpen(true);
            }} />
          </div>
          <ChevronDown className={cn("h-4 w-4 text-[#475569] transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
             <div className="p-5 space-y-6">
               {children}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* ─── Timer de Escassez ─── */}
      <AccordionSection
        title="Timer de Escassez"
        icon={Clock}
        enabled={config.scarcity.countdownEnabled}
        onToggle={v => updScarcity({ countdownEnabled: v, countdown: { ...config.scarcity.countdown, enabled: v } })}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Texto acima do timer</label>
            <Input 
              value={config.scarcity.countdown.label} 
              onChange={e => updCountdown({ label: e.target.value })} 
              className="h-10 text-[13px] bg-black/40 border-white/5" 
              placeholder="Ex: Oferta encerra em:"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Duração da Oferta</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => updCountdown({ duration: d.value })}
                  className={cn(
                    "py-2 text-[11px] rounded-xl border font-bold transition-all",
                    config.scarcity.countdown.duration === d.value
                      ? "border-purple-500 bg-purple-500/10 text-white"
                      : "border-white/5 text-[#64748b] hover:border-white/10"
                  )}
                >{d.label}</button>
              ))}
            </div>
            {config.scarcity.countdown.duration === "custom" && (
              <div className="mt-3 flex gap-2">
                <Input
                  type="number"
                  placeholder="Minutos"
                  value={config.scarcity.countdown.customMinutes || ""}
                  onChange={e => updCountdown({ customMinutes: Number(e.target.value) })}
                  className="h-9 text-[12px] bg-black/20"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Estilo Visual</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
              {(["minimal", "urgent"] as TimerStyle[]).map(s => (
                <button
                  key={s}
                  onClick={() => updCountdown({ style: s })}
                  className={cn(
                    "py-2 text-[11px] font-bold rounded-lg transition-all",
                    config.scarcity.countdown.style === s
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-[#64748b] hover:text-white"
                  )}
                >{s === "minimal" ? "Minimalista" : "🔥 Urgente"}</button>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* ─── Vagas Limitadas ─── */}
      <AccordionSection
        title="Vagas Limitadas"
        icon={Users}
        enabled={config.scarcity.vacanciesEnabled}
        onToggle={v => updScarcity({ vacanciesEnabled: v })}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Número de Vagas Restantes</label>
            <Input 
              type="number" 
              value={config.scarcity.vacanciesCount}
              onChange={e => updScarcity({ vacanciesCount: Number(e.target.value) })} 
              className="h-10 text-[13px] bg-black/40 border-white/5" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Frase de Destaque</label>
            <Input 
              value={config.scarcity.vacanciesText}
              onChange={e => updScarcity({ vacanciesText: e.target.value })} 
              placeholder="Ex: Restam apenas {n} vagas!"
              className="h-10 text-[13px] bg-black/40 border-white/5" 
            />
          </div>
        </div>
      </AccordionSection>

      {/* ─── Banner de Urgência ─── */}
      <AccordionSection
        title="Banner de Urgência"
        icon={Flame}
        enabled={config.urgency.enabled}
        onToggle={v => updUrgency({ enabled: v })}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Texto do Banner</label>
            <Input 
              value={config.urgency.text} 
              onChange={e => updUrgency({ text: e.target.value })} 
              placeholder="Ex: 🔥 Promoção encerra em breve!"
              className="h-10 text-[13px] bg-black/40 border-white/5" 
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[#94a3b8]">Cor do Banner</label>
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg border border-white/10 overflow-hidden cursor-pointer">
                <input
                  type="color"
                  value={config.urgency.bgColor}
                  onChange={e => updUrgency({ bgColor: e.target.value })}
                  className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
                />
              </div>
              <input 
                value={config.urgency.bgColor} 
                onChange={e => updUrgency({ bgColor: e.target.value })}
                className="w-20 bg-black/40 border border-white/5 rounded-md px-2 py-1 text-[11px] font-mono text-center focus:border-purple-500 outline-none"
              />
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* ─── Garantia ─── */}
      <AccordionSection
        title="Garantia Incondicional"
        icon={ShieldCheck}
        enabled={config.guarantee.enabled}
        onToggle={v => updGuarantee({ enabled: v })}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Prazo da Garantia</label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map(d => (
                <button 
                  key={d} 
                  onClick={() => updGuarantee({ days: d as 7|14|30 })}
                  className={cn(
                    "py-2 text-[11px] rounded-xl border font-bold transition-all",
                    config.guarantee.days === d
                      ? "border-purple-500 bg-purple-500/10 text-white"
                      : "border-white/5 text-[#64748b] hover:border-white/10"
                  )}
                >{d} dias</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#94a3b8] ml-1">Texto da Garantia</label>
            <textarea 
              rows={3}
              placeholder="Descreva as condições da garantia..."
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[13px] text-white placeholder:text-[#3d5166] focus:outline-none focus:border-purple-500/50 transition-all resize-none"
              value={config.guarantee.text}
              onChange={e => updGuarantee({ text: e.target.value })}
            />
          </div>
        </div>
      </AccordionSection>

      {/* ─── Selos de Autoridade ─── */}
      <div className="p-4 rounded-[20px] border border-white/5 bg-white/[0.01] space-y-4">
        <label className="text-[13px] font-bold text-[#f1f5f9] tracking-tight block ml-1">Selos de Autoridade</label>
        <div className="space-y-3">
          {[
            { key: "sealSecure", label: "🔒 Compra 100% segura", configKey: "sealSecure" },
            { key: "sealSatisfaction", label: "✅ Satisfação garantida", configKey: "sealSatisfaction" },
            { key: "sealProtected", label: "🛡️ Dados protegidos", configKey: "sealProtected" },
            { key: "showPaymentLogos", label: "💳 Bandeiras de Pagamento", configKey: "showPaymentLogos" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between px-2">
              <span className="text-[13px] text-[#94a3b8] font-medium">{item.label}</span>
              <Switch 
                checked={config.authority[item.configKey as keyof typeof config.authority]} 
                onCheckedChange={v => updAuth({ [item.configKey]: v })} 
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
