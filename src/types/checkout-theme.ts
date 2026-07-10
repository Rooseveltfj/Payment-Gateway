// ============================================================
// PulsePay — CheckoutTheme: sistema de tokens dos templates
// FONTE ÚNICA DA VERDADE visual. Preview (builder) e página pública (/c/[slug])
// resolvem o tema por aqui — cores, fontes, formas e efeitos nunca divergem.
// Todos os pares texto/fundo validados em WCAG AA (4.5:1). Ver scripts/contrast.
// ============================================================
import type { TemplateId, AppearanceConfig } from "./checkout-config";

export interface CheckoutTheme {
  id: TemplateId;
  label: string;
  mode: "dark" | "light";

  fonts: {
    /** valor CSS font-family (ref. a var do checkout-fonts) para títulos */
    heading: string;
    /** valor CSS font-family para corpo/UI */
    body: string;
    /** opcional: mono para labels (neon) */
    mono?: string;
    headingWeight: number;
    bodyWeight: number;
    /** peso dos labels de campo/uppercase */
    labelWeight: number;
    headingTransform: "none" | "uppercase";
    headingTracking: string; // letter-spacing
    labelTracking: string;
  };

  colors: {
    /** fundo da página — pode ser gradiente/mesh */
    bg: string;
    /** fundo sólido equivalente (fallback p/ contraste, thumb, mono) */
    bgSolid: string;
    surface: string;
    surfaceBorder: string;
    surfaceElevated: string;
    text: string;
    subtext: string;
    muted: string;
    accent: string;
    accentText: string; // texto sobre accent (AA garantido)
    accentSoft: string; // accent translúcido p/ realces
    fieldBg: string;
    fieldBorder: string;
    fieldText: string;
    label: string;
  };

  radius: {
    card: string;
    field: string;
    button: string;
  };

  button: {
    variant: "solid" | "outline" | "gradient";
    gradient?: string; // usado quando variant = gradient
    glow: boolean;
    animate: "none" | "pulse" | "shimmer";
  };

  shadow: {
    card: string;
    button: string;
  };

  glass: boolean; // backdrop-blur nos cards
  backgroundPattern: "none" | "grid" | "mesh";
  badgeStyle: "pill" | "outline" | "text";
  density: "compact" | "normal" | "spacious";
}

// ── Referências de fonte (resolvem via checkout-fonts.ts) ──
const F = {
  inter: "var(--font-ck-inter), system-ui, sans-serif",
  playfair: "var(--font-ck-playfair), Georgia, serif",
  oswald: "var(--font-ck-oswald), Impact, sans-serif",
  nunito: "var(--font-ck-nunito), system-ui, sans-serif",
  mono: "var(--font-ck-mono), 'Courier New', monospace",
};

// ============================================================
// OS 8 TEMAS
// ============================================================
export const THEMES: Record<TemplateId, CheckoutTheme> = {
  // 1 ─── Escuro Clássico — o "seguro" ─────────────────────────
  classic: {
    id: "classic",
    label: "Escuro Clássico",
    mode: "dark",
    fonts: {
      heading: F.inter, body: F.inter,
      headingWeight: 800, bodyWeight: 400, labelWeight: 600,
      headingTransform: "none", headingTracking: "-0.02em", labelTracking: "0.04em",
    },
    colors: {
      bg: "#0A0A0F", bgSolid: "#0A0A0F",
      surface: "#131318", surfaceBorder: "rgba(255,255,255,0.08)", surfaceElevated: "#1A1A22",
      text: "#F4F4F5", subtext: "#A1A1AA", muted: "#71717A",
      accent: "#7C3AED", accentText: "#FFFFFF", accentSoft: "rgba(124,58,237,0.14)",
      fieldBg: "#0E0E13", fieldBorder: "rgba(255,255,255,0.10)", fieldText: "#F4F4F5", label: "#A1A1AA",
    },
    radius: { card: "16px", field: "12px", button: "12px" },
    button: { variant: "solid", glow: false, animate: "none" },
    shadow: { card: "0 8px 32px rgba(0,0,0,0.4)", button: "0 8px 24px rgba(124,58,237,0.35)" },
    glass: false, backgroundPattern: "none", badgeStyle: "pill", density: "normal",
  },

  // 2 ─── Minimalista — monocromático, leve, outline ───────────
  minimalist: {
    id: "minimalist",
    label: "Minimalista",
    mode: "dark",
    fonts: {
      heading: F.inter, body: F.inter,
      headingWeight: 400, bodyWeight: 300, labelWeight: 400,
      headingTransform: "none", headingTracking: "-0.01em", labelTracking: "0.18em",
    },
    colors: {
      bg: "#0B0B0B", bgSolid: "#0B0B0B",
      surface: "transparent", surfaceBorder: "rgba(255,255,255,0.10)", surfaceElevated: "rgba(255,255,255,0.02)",
      text: "#EDEDED", subtext: "#8F8F8F", muted: "#5A5A5A",
      accent: "#FFFFFF", accentText: "#0B0B0B", accentSoft: "rgba(255,255,255,0.06)",
      fieldBg: "transparent", fieldBorder: "rgba(255,255,255,0.14)", fieldText: "#EDEDED", label: "#8F8F8F",
    },
    radius: { card: "2px", field: "2px", button: "2px" },
    button: { variant: "outline", glow: false, animate: "none" },
    shadow: { card: "none", button: "none" },
    glass: false, backgroundPattern: "none", badgeStyle: "text", density: "spacious",
  },

  // 3 ─── Gradiente Pro — mesh + glassmorphism ─────────────────
  gradient: {
    id: "gradient",
    label: "Gradiente Pro",
    mode: "dark",
    fonts: {
      heading: F.inter, body: F.inter,
      headingWeight: 800, bodyWeight: 400, labelWeight: 600,
      headingTransform: "none", headingTracking: "-0.025em", labelTracking: "0.05em",
    },
    colors: {
      bg: "radial-gradient(at 15% 20%, #2A1E5C 0px, transparent 55%), radial-gradient(at 85% 10%, #1E3A8A 0px, transparent 50%), radial-gradient(at 70% 85%, #4C1D95 0px, transparent 55%), #0D0B1E",
      bgSolid: "#0D0B1E",
      surface: "rgba(255,255,255,0.07)", surfaceBorder: "rgba(255,255,255,0.14)", surfaceElevated: "rgba(255,255,255,0.10)",
      text: "#FFFFFF", subtext: "#C7C3E8", muted: "#9A94C4",
      accent: "#A78BFA", accentText: "#FFFFFF", accentSoft: "rgba(167,139,250,0.16)",
      fieldBg: "rgba(255,255,255,0.06)", fieldBorder: "rgba(255,255,255,0.16)", fieldText: "#FFFFFF", label: "#C7C3E8",
    },
    radius: { card: "24px", field: "14px", button: "14px" },
    button: {
      variant: "gradient",
      gradient: "linear-gradient(120deg, #6D28D9, #4338CA, #6D28D9)",
      glow: false, animate: "shimmer",
    },
    shadow: { card: "0 16px 48px rgba(76,29,149,0.35)", button: "0 12px 32px rgba(67,56,202,0.5)" },
    glass: true, backgroundPattern: "mesh", badgeStyle: "pill", density: "normal",
  },

  // 4 ─── Neon Tech — preto + verde neon, mono, grid ───────────
  neon: {
    id: "neon",
    label: "Neon Tech",
    mode: "dark",
    fonts: {
      heading: F.inter, body: F.inter, mono: F.mono,
      headingWeight: 700, bodyWeight: 400, labelWeight: 500,
      headingTransform: "none", headingTracking: "-0.01em", labelTracking: "0.14em",
    },
    colors: {
      bg: "#000000", bgSolid: "#000000",
      surface: "rgba(0,255,136,0.03)", surfaceBorder: "rgba(0,255,136,0.35)", surfaceElevated: "rgba(0,255,136,0.06)",
      text: "#FFFFFF", subtext: "#86EFAC", muted: "#4ADE80",
      accent: "#00FF88", accentText: "#001208", accentSoft: "rgba(0,255,136,0.12)",
      fieldBg: "rgba(0,255,136,0.04)", fieldBorder: "rgba(0,255,136,0.30)", fieldText: "#FFFFFF", label: "#86EFAC",
    },
    radius: { card: "4px", field: "4px", button: "4px" },
    button: { variant: "solid", glow: true, animate: "none" },
    shadow: { card: "0 0 0 1px rgba(0,255,136,0.2)", button: "0 0 24px rgba(0,255,136,0.6)" },
    glass: false, backgroundPattern: "grid", badgeStyle: "outline", density: "normal",
  },

  // 5 ─── Elegante — preto quente + dourado, serif ─────────────
  elegant: {
    id: "elegant",
    label: "Elegante",
    mode: "dark",
    fonts: {
      heading: F.playfair, body: F.inter,
      headingWeight: 600, bodyWeight: 400, labelWeight: 500,
      headingTransform: "none", headingTracking: "0em", labelTracking: "0.2em",
    },
    colors: {
      bg: "#141210", bgSolid: "#141210",
      surface: "#1C1915", surfaceBorder: "rgba(212,184,114,0.18)", surfaceElevated: "#232019",
      text: "#F5EFE4", subtext: "#B8A98C", muted: "#8A7B5E",
      accent: "#D4B872", accentText: "#1A1408", accentSoft: "rgba(212,184,114,0.12)",
      fieldBg: "#191611", fieldBorder: "rgba(212,184,114,0.22)", fieldText: "#F5EFE4", label: "#B8A98C",
    },
    radius: { card: "10px", field: "8px", button: "8px" },
    button: { variant: "solid", glow: false, animate: "none" },
    shadow: { card: "0 12px 40px rgba(0,0,0,0.5)", button: "0 8px 24px rgba(212,184,114,0.25)" },
    glass: false, backgroundPattern: "none", badgeStyle: "outline", density: "spacious",
  },

  // 6 ─── Urgência — vermelho, condensada caps, pulse ──────────
  urgency: {
    id: "urgency",
    label: "Urgência",
    mode: "dark",
    fonts: {
      heading: F.oswald, body: F.inter,
      headingWeight: 700, bodyWeight: 400, labelWeight: 600,
      headingTransform: "uppercase", headingTracking: "0.01em", labelTracking: "0.08em",
    },
    colors: {
      bg: "#0C0A0A", bgSolid: "#0C0A0A",
      surface: "#17110F", surfaceBorder: "rgba(220,38,38,0.28)", surfaceElevated: "#1F1512",
      text: "#FAFAFA", subtext: "#E5A3A3", muted: "#B87878",
      accent: "#DC2626", accentText: "#FFFFFF", accentSoft: "rgba(220,38,38,0.14)",
      fieldBg: "#140F0E", fieldBorder: "rgba(220,38,38,0.25)", fieldText: "#FAFAFA", label: "#E5A3A3",
    },
    radius: { card: "8px", field: "6px", button: "8px" },
    button: { variant: "solid", glow: false, animate: "pulse" },
    shadow: { card: "0 8px 28px rgba(0,0,0,0.5)", button: "0 10px 30px rgba(220,38,38,0.45)" },
    glass: false, backgroundPattern: "none", badgeStyle: "pill", density: "compact",
  },

  // 7 ─── Claro Profissional — SaaS azul ───────────────────────
  clean: {
    id: "clean",
    label: "Claro Profissional",
    mode: "light",
    fonts: {
      heading: F.inter, body: F.inter,
      headingWeight: 700, bodyWeight: 400, labelWeight: 600,
      headingTransform: "none", headingTracking: "-0.02em", labelTracking: "0.04em",
    },
    colors: {
      bg: "#F5F7FA", bgSolid: "#F5F7FA",
      surface: "#FFFFFF", surfaceBorder: "#E2E8F0", surfaceElevated: "#FFFFFF",
      text: "#0F172A", subtext: "#475569", muted: "#94A3B8",
      accent: "#2563EB", accentText: "#FFFFFF", accentSoft: "rgba(37,99,235,0.10)",
      fieldBg: "#FFFFFF", fieldBorder: "#CBD5E1", fieldText: "#0F172A", label: "#475569",
    },
    radius: { card: "14px", field: "10px", button: "10px" },
    button: { variant: "solid", glow: false, animate: "none" },
    shadow: { card: "0 4px 24px rgba(15,23,42,0.08)", button: "0 8px 20px rgba(37,99,235,0.25)" },
    glass: false, backgroundPattern: "none", badgeStyle: "pill", density: "normal",
  },

  // 8 ─── Claro Suave — off-white quente + sálvia, arredondado ─
  ocean: {
    id: "ocean",
    label: "Claro Suave",
    mode: "light",
    fonts: {
      heading: F.nunito, body: F.nunito,
      headingWeight: 800, bodyWeight: 400, labelWeight: 700,
      headingTransform: "none", headingTracking: "-0.01em", labelTracking: "0.03em",
    },
    colors: {
      bg: "#FAF7F2", bgSolid: "#FAF7F2",
      surface: "#FFFFFF", surfaceBorder: "#EDE7DD", surfaceElevated: "#FFFFFF",
      text: "#2D2A26", subtext: "#6B6459", muted: "#A39B8D",
      accent: "#4A7C59", accentText: "#FFFFFF", accentSoft: "rgba(74,124,89,0.12)",
      fieldBg: "#FBF9F5", fieldBorder: "#E5DFD3", fieldText: "#2D2A26", label: "#6B6459",
    },
    radius: { card: "24px", field: "16px", button: "16px" },
    button: { variant: "solid", glow: false, animate: "none" },
    shadow: { card: "0 12px 40px rgba(74,124,89,0.10)", button: "0 10px 28px rgba(74,124,89,0.22)" },
    glass: false, backgroundPattern: "none", badgeStyle: "pill", density: "spacious",
  },
};

export const THEME_LIST = Object.values(THEMES);

/**
 * Resolve o tema efetivo a partir da AppearanceConfig.
 * Regra (corrige o bug do merge): o TEMA é a fonte da verdade; cores custom só
 * sobrescrevem quando o usuário realmente preencheu (string não-vazia).
 * Campos vazios ("") = "herdar do template".
 */
export function resolveTheme(a: AppearanceConfig): CheckoutTheme {
  const base = THEMES[(a.templateId as TemplateId) || "classic"] || THEMES.classic;
  const ov = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);

  return {
    ...base,
    colors: {
      ...base.colors,
      bg: ov(a.bgColor) ?? base.colors.bg,
      bgSolid: ov(a.bgColor) ?? base.colors.bgSolid,
      surface: ov(a.widgetBgColor) ?? base.colors.surface,
      text: ov(a.textColor) ?? base.colors.text,
      accent: ov(a.primaryColor) ?? ov(a.buttonColor) ?? base.colors.accent,
      accentText: ov(a.buttonTextColor) ?? base.colors.accentText,
      fieldBg: ov(a.inputBgColor) ?? base.colors.fieldBg,
      fieldText: ov(a.inputTextColor) ?? base.colors.fieldText,
    },
    // botão custom sobrescreve accent, mas mantém variante do tema
    button: {
      ...base.button,
      ...(ov(a.buttonColor) ? { variant: base.button.variant === "gradient" ? "gradient" : "solid" } : {}),
    },
  };
}

/** CSS custom properties do tema, para aplicar no root do checkout. */
export function themeCssVars(t: CheckoutTheme): Record<string, string> {
  return {
    "--ck-bg": t.colors.bg,
    "--ck-surface": t.colors.surface,
    "--ck-accent": t.colors.accent,
    "--ck-accent-text": t.colors.accentText,
    "--ck-cta-gradient": t.button.gradient || t.colors.accent,
  };
}
