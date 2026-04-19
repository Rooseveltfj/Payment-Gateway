"use client";

import { TemplateId, AppearanceConfig, ButtonStyle, FontFamily, ThemePreset } from "@/types/checkout-config";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { cn } from "@/lib/utils";
import { Check, Edit2, Layout, Sliders, Type, Image as ImageIcon } from "lucide-react";

const FONTS: FontFamily[] = ["Geist", "Inter", "Poppins", "Montserrat"];
const BUTTON_STYLES: { value: ButtonStyle; label: string; radius: string }[] = [
  { value: "pill", label: "Pílula", radius: "rounded-full" },
  { value: "rounded", label: "Arredondado", radius: "rounded-xl" },
  { value: "square", label: "Quadrado", radius: "rounded-none" },
];

const TEMPLATES: { id: TemplateId; label: string; preview: string; theme: ThemePreset; isLight?: boolean }[] = [
  // Dark Templates
  { id: "classic", label: "Escuro Clássico", theme: "dark", preview: "bg-[#1a1a2e] border-[#8b5cf6]/20" },
  { id: "minimalist", label: "Minimalista", theme: "minimalist", preview: "bg-[#050505] border-white/5" },
  { id: "gradient", label: "Gradiente Pro", theme: "gradient", preview: "bg-gradient-to-br from-[#4c1d95] to-[#1e1b4b]" },
  { id: "neon", label: "Neon Tech", theme: "neon", preview: "bg-black border-[#00ff9f]/30" },
  { id: "elegant", label: "Elegante", theme: "elegant", preview: "bg-[#0d0d10] border-[#d4d4d8]/10" },
  { id: "urgency", label: "Urgência", theme: "urgency", preview: "bg-[#09090b] border-red-500/30" },
  // Light Templates
  { id: "clean", label: "Clean Light", theme: "clean", preview: "bg-white border-gray-200", isLight: true },
  { id: "ocean", label: "Ocean Light", theme: "ocean", preview: "bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border-blue-200", isLight: true },
];

interface Props {
  config: AppearanceConfig;
  onChange: (data: Partial<AppearanceConfig>) => void;
}

function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      {Icon && <Icon className="h-4 w-4 text-purple-400" />}
      <p className="text-[13px] font-bold text-[#f1f5f9] tracking-tight">{children}</p>
    </div>
  );
}

export function AppearanceTab({ config, onChange }: Props) {
  // @ts-ignore
  const activeTemplate = config.templateId || "classic";
  const darkTemplates = TEMPLATES.filter(t => !t.isLight);
  const lightTemplates = TEMPLATES.filter(t => t.isLight);

  const renderTemplateGrid = (templates: typeof TEMPLATES) => (
    <div className="grid grid-cols-2 gap-3">
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => onChange({
            themePreset: t.theme,
            // @ts-ignore
            templateId: t.id
          })}
          className={cn(
            "group relative flex flex-col gap-2 transition-all",
            activeTemplate === t.id ? "scale-[1.02]" : "hover:scale-[1.01]"
          )}
        >
          <div className={cn(
            "w-full aspect-[4/3] rounded-xl border-2 transition-all flex flex-col p-2 gap-1 overflow-hidden",
            t.preview,
            activeTemplate === t.id
              ? "border-purple-500 ring-4 ring-purple-500/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              : "border-white/5 hover:border-white/10"
          )}>
            {/* Template preview elements */}
            <div className={cn("w-full h-1 rounded-full", t.isLight ? "bg-black/10" : "bg-white/10")} />
            <div className={cn("w-2/3 h-1 rounded-full", t.isLight ? "bg-black/10" : "bg-white/10")} />
            <div className="flex-1" />
            {/* CTA button preview */}
            <div className={cn(
              "w-full h-3 rounded-md",
              t.theme === "neon" ? "bg-[#00ff9f]/40" :
              t.theme === "urgency" ? "bg-red-500/40" :
              t.isLight ? "bg-blue-500/40" :
              "bg-purple-500/40"
            )} />

            {activeTemplate === t.id && (
              <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 shadow-lg">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            
            {t.isLight && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white rounded-md text-[8px] font-black text-gray-600 uppercase tracking-wide border border-gray-200">
                LIGHT
              </div>
            )}
          </div>
          <span className={cn(
            "text-[11px] font-bold transition-colors",
            activeTemplate === t.id ? "text-purple-400" : "text-[#94a3b8] group-hover:text-white"
          )}>{t.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-1 animate-in fade-in duration-500">

      {/* ─── Dark Templates ─── */}
      <SectionLabel icon={Layout}>Templates Escuros</SectionLabel>
      {renderTemplateGrid(darkTemplates)}

      {/* ─── Light Templates ─── */}
      <SectionLabel icon={Layout}>Templates Claros</SectionLabel>
      {renderTemplateGrid(lightTemplates)}

      {/* ─── Colors ─── */}
      <SectionLabel icon={Sliders}>Cores Globais</SectionLabel>
      <div className="space-y-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-[12px] font-medium text-[#94a3b8]">Cor Principal (Accent)</label>
            <p className="text-[10px] text-[#475569] mt-0.5">Botão, destaques e links</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg border border-white/10 overflow-hidden cursor-pointer">
              <input
                type="color"
                value={config.primaryColor}
                onChange={e => onChange({ primaryColor: e.target.value })}
                className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
              />
            </div>
            <input
              value={config.primaryColor}
              onChange={e => onChange({ primaryColor: e.target.value })}
              className="w-20 bg-black/40 border border-white/5 rounded-md px-2 py-1 text-[11px] font-mono text-center focus:border-purple-500 outline-none text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-[12px] font-medium text-[#94a3b8]">Fundo da Página</label>
            <p className="text-[10px] text-[#475569] mt-0.5">Disponível no template Clássico</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg border border-white/10 overflow-hidden cursor-pointer">
              <input
                type="color"
                value={config.bgColor}
                onChange={e => onChange({ bgColor: e.target.value })}
                className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
              />
            </div>
            <input
              value={config.bgColor}
              onChange={e => onChange({ bgColor: e.target.value })}
              className="w-20 bg-black/40 border border-white/5 rounded-md px-2 py-1 text-[11px] font-mono text-center focus:border-purple-500 outline-none text-white"
            />
          </div>
        </div>
      </div>

      {/* ─── Logo & Banner ─── */}
      <SectionLabel icon={ImageIcon}>Logo & Banner</SectionLabel>
      <div className="space-y-6">
        {/* Logo Upload */}
        <ImageUpload
          label="Logo do Checkout (Header)"
          value={config.logoUrl}
          onChange={url => onChange({ logoUrl: url })}
          aspectRatio="1/1"
          maxSizeMB={1}
          hint="PNG transparente recomendado (aparece no topo do checkout)"
        />

        <div className="h-px bg-white/5" />

        {/* Banner Upload */}
        <ImageUpload
          label="Banner / Capa do Produto"
          value={config.bannerUrl}
          onChange={url => onChange({ bannerUrl: url })}
          aspectRatio="16/9"
          maxSizeMB={3}
          hint="Aparece como hero image. O vídeo VSL tem prioridade se configurado."
        />

        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#94a3b8] ml-1">
            Ou use URL externa do Banner
          </label>
          <Input
            placeholder="https://imagem.com/banner.jpg"
            value={config.bannerExternal}
            onChange={e => onChange({ bannerExternal: e.target.value })}
            className="h-11 bg-white/[0.02] border-white/5 text-[13px]"
          />
          <p className="text-[10px] text-[#475569] ml-1">
            Se preenchida, esta URL substitui o upload acima.
          </p>
        </div>
      </div>

      {/* ─── Typography ─── */}
      <SectionLabel icon={Type}>Tipografia</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {FONTS.map(f => (
          <button
            key={f}
            onClick={() => onChange({ fontFamily: f })}
            style={{ fontFamily: f === "Geist" ? "inherit" : f }}
            className={cn(
              "py-3 px-4 rounded-xl border text-[13px] transition-all flex items-center justify-between",
              config.fontFamily === f
                ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold"
                : "border-white/5 text-[#64748b] hover:border-white/10 hover:text-white"
            )}
          >
            {f}
            {config.fontFamily === f && <Check className="h-4 w-4" />}
          </button>
        ))}
      </div>

      {/* ─── Purchase Button ─── */}
      <SectionLabel icon={Edit2}>Botão de Compra</SectionLabel>
      <div className="space-y-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#94a3b8]">Texto do Botão</label>
          <Input
            value={config.buttonText}
            onChange={e => onChange({ buttonText: e.target.value })}
            className="h-10 text-[13px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#94a3b8]">Formato do Botão</label>
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
            {BUTTON_STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => onChange({ buttonStyle: s.value })}
                className={cn(
                  "flex-1 py-2 text-[11px] font-bold transition-all rounded-lg",
                  config.buttonStyle === s.value
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-[#64748b] hover:text-white"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
