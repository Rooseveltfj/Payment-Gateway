"use client";

import { AppearanceConfig, ButtonStyle, FontFamily, ThemePreset } from "@/types/checkout-config";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const FONTS: FontFamily[] = ["Geist", "Inter", "Poppins", "Montserrat"];
const BUTTON_STYLES: { value: ButtonStyle; label: string; preview: string }[] = [
  { value: "rounded", label: "Arredondado", preview: "rounded-md" },
  { value: "square", label: "Quadrado", preview: "rounded-none" },
  { value: "pill", label: "Pílula", preview: "rounded-full" },
];
const THEMES: { value: ThemePreset; label: string; colors: string }[] = [
  { value: "dark", label: "Escuro", colors: "bg-zinc-900 border-zinc-700" },
  { value: "light", label: "Claro", colors: "bg-white border-zinc-200" },
  { value: "gradient", label: "Gradiente", colors: "bg-gradient-to-br from-violet-900 to-zinc-900 border-violet-700" },
];

interface Props {
  config: AppearanceConfig;
  onChange: (data: Partial<AppearanceConfig>) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

export function AppearanceTab({ config, onChange }: Props) {
  return (
    <div className="space-y-1">
      <SectionLabel>Cores</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Cor Principal</label>
          <div className="flex items-center gap-2 border border-border rounded-md p-2 bg-background">
            <input
              type="color"
              value={config.primaryColor}
              onChange={e => onChange({ primaryColor: e.target.value })}
              className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs font-mono text-text-primary">{config.primaryColor}</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Cor de Fundo</label>
          <div className="flex items-center gap-2 border border-border rounded-md p-2 bg-background">
            <input
              type="color"
              value={config.bgColor}
              onChange={e => onChange({ bgColor: e.target.value })}
              className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs font-mono text-text-primary">{config.bgColor}</span>
          </div>
        </div>
      </div>

      <SectionLabel>Tema Preset</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map(t => (
          <button
            key={t.value}
            onClick={() => onChange({ themePreset: t.value })}
            className={cn(
              "h-12 rounded-lg border-2 transition-all text-[10px] font-medium",
              t.colors,
              config.themePreset === t.value ? "border-primary ring-1 ring-primary" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SectionLabel>Logo & Banner</SectionLabel>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-text-secondary mb-1 block">URL do Banner / Capa</label>
          <Input
            placeholder="https://..."
            value={config.bannerExternal}
            onChange={e => onChange({ bannerExternal: e.target.value })}
            className="text-xs"
          />
        </div>
      </div>

      <SectionLabel>Tipografia</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {FONTS.map(f => (
          <button
            key={f}
            onClick={() => onChange({ fontFamily: f })}
            style={{ fontFamily: f === "Geist" ? "inherit" : f }}
            className={cn(
              "py-2 px-3 rounded-lg border text-sm transition-all",
              config.fontFamily === f
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border text-text-secondary hover:border-border/80"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <SectionLabel>Botão de Compra</SectionLabel>
      <div>
        <label className="text-xs text-text-secondary mb-1 block">Texto do Botão</label>
        <Input
          value={config.buttonText}
          onChange={e => onChange({ buttonText: e.target.value })}
          className="text-sm"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {BUTTON_STYLES.map(s => (
          <button
            key={s.value}
            onClick={() => onChange({ buttonStyle: s.value })}
            className={cn(
              "py-2 border text-xs transition-all font-medium",
              s.preview,
              config.buttonStyle === s.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-text-secondary hover:border-border/80"
            )}
            style={{ background: config.buttonStyle === s.value ? undefined : "transparent" }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
