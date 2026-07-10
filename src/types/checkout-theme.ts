// ============================================================
// PulsePay — CheckoutTheme: sistema COMPLETO de design tokens
// FONTE ÚNICA DA VERDADE visual do checkout. Preview (builder) e página pública
// consomem estes tokens EXCLUSIVAMENTE via CSS variables `--checkout-*`
// (ver CheckoutThemeProvider). Zero cores hardcoded nos componentes de render.
// Todos os pares texto/fundo validados em WCAG AA (scripts/contrast-check).
// ============================================================
import type { TemplateId, AppearanceConfig } from "./checkout-config";

// ── Tokens ──────────────────────────────────────────────────
export interface CheckoutThemeColors {
  background: string;        // fundo da página (sólido ou gradient-mesh)
  surface: string;           // card/painel
  surfaceElevated: string;   // realce dentro do card
  textPrimary: string;
  textSecondary: string;
  accent: string;            // marca / realces
  accentForeground: string;  // texto sobre accent
  ctaBackground: string;     // fundo do botão (sólido, "transparent"=outline, ou gradient)
  ctaForeground: string;     // texto do CTA
  ctaHover: string;          // estado hover do CTA
  border: string;
  success: string;
  badgeBackground: string;
  badgeForeground: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
}

export interface CheckoutThemeTypography {
  fontHeading: string;       // valor CSS font-family (ref. checkout-fonts)
  fontBody: string;
  fontMono: string;          // labels/mono (usado por temas técnicos)
  headingWeight: number;
  headingScale: number;      // multiplicador da escala de títulos
  bodySize: string;          // font-size base do corpo
  letterSpacing: string;     // tracking dos títulos
  ctaTextTransform: "none" | "uppercase";
}

export interface CheckoutThemeShape {
  radiusCard: string;
  radiusInput: string;
  radiusCta: string;
  borderWidth: string;
}

export interface CheckoutThemeEffects {
  shadowCard: string;
  gradient?: { direction: string; stops: string[] }; // gradiente opcional (ex.: CTA)
  ctaGlow?: string;          // box-shadow de glow do CTA (opcional)
  backgroundPattern: "none" | "grid" | "noise" | "gradient-mesh";
}

export interface CheckoutThemeLayout {
  density: "compact" | "normal" | "spacious";
  badgeStyle: "pill" | "flat" | "outline";
  previewStyle: "framed" | "fullbleed";
}

export interface CheckoutTheme {
  id: TemplateId;
  label: string;
  mode: "dark" | "light";
  colors: CheckoutThemeColors;
  typography: CheckoutThemeTypography;
  shape: CheckoutThemeShape;
  effects: CheckoutThemeEffects;
  layout: CheckoutThemeLayout;
}

// Overrides granulares persistidos junto do config (JSON). Todos opcionais.
export type ThemeOverrides = Partial<CheckoutThemeColors> & {
  fontHeading?: string;
  fontBody?: string;
};

// ── Fontes (resolvem via checkout-fonts.ts) ──
const F = {
  inter: "var(--font-ck-inter), system-ui, sans-serif",
  playfair: "var(--font-ck-playfair), Georgia, serif",
  oswald: "var(--font-ck-oswald), Impact, sans-serif",
  nunito: "var(--font-ck-nunito), system-ui, sans-serif",
  mono: "var(--font-ck-mono), 'Courier New', monospace",
};

// ============================================================
// OS 8 TEMAS COMPLETOS
// ============================================================
export const THEMES: Record<TemplateId, CheckoutTheme> = {
  // 1 ─── Escuro Clássico ──────────────────────────────────────
  classic: {
    id: "classic", label: "Escuro Clássico", mode: "dark",
    colors: {
      background: "#0A0A0F", surface: "#131318", surfaceElevated: "#1A1A22",
      textPrimary: "#F4F4F5", textSecondary: "#A1A1AA",
      accent: "#7C3AED", accentForeground: "#FFFFFF",
      ctaBackground: "#7C3AED", ctaForeground: "#FFFFFF", ctaHover: "#6D28D9",
      border: "rgba(255,255,255,0.08)", success: "#3FD68C",
      badgeBackground: "rgba(124,58,237,0.14)", badgeForeground: "#C4B5FD",
      inputBackground: "#0E0E13", inputBorder: "rgba(255,255,255,0.10)",
      inputText: "#F4F4F5", inputPlaceholder: "#71717A",
    },
    typography: { fontHeading: F.inter, fontBody: F.inter, fontMono: F.mono, headingWeight: 800, headingScale: 1, bodySize: "15px", letterSpacing: "-0.02em", ctaTextTransform: "uppercase" },
    shape: { radiusCard: "16px", radiusInput: "12px", radiusCta: "12px", borderWidth: "1px" },
    effects: { shadowCard: "0 8px 32px rgba(0,0,0,0.4)", backgroundPattern: "none" },
    layout: { density: "normal", badgeStyle: "pill", previewStyle: "framed" },
  },

  // 2 ─── Minimalista ──────────────────────────────────────────
  minimalist: {
    id: "minimalist", label: "Minimalista", mode: "dark",
    colors: {
      background: "#0B0B0B", surface: "transparent", surfaceElevated: "rgba(255,255,255,0.03)",
      textPrimary: "#EDEDED", textSecondary: "#8F8F8F",
      accent: "#FFFFFF", accentForeground: "#0B0B0B",
      ctaBackground: "transparent", ctaForeground: "#EDEDED", ctaHover: "#FFFFFF",
      border: "rgba(255,255,255,0.12)", success: "#EDEDED",
      badgeBackground: "transparent", badgeForeground: "#8F8F8F",
      inputBackground: "transparent", inputBorder: "rgba(255,255,255,0.14)",
      inputText: "#EDEDED", inputPlaceholder: "#6E6E6E",
    },
    typography: { fontHeading: F.inter, fontBody: F.inter, fontMono: F.mono, headingWeight: 400, headingScale: 1.05, bodySize: "15px", letterSpacing: "-0.01em", ctaTextTransform: "uppercase" },
    shape: { radiusCard: "2px", radiusInput: "2px", radiusCta: "2px", borderWidth: "1px" },
    effects: { shadowCard: "none", backgroundPattern: "none" },
    layout: { density: "spacious", badgeStyle: "flat", previewStyle: "framed" },
  },

  // 3 ─── Gradiente Pro ────────────────────────────────────────
  gradient: {
    id: "gradient", label: "Gradiente Pro", mode: "dark",
    colors: {
      background: "radial-gradient(at 15% 20%, #2A1E5C 0px, transparent 55%), radial-gradient(at 85% 10%, #1E3A8A 0px, transparent 50%), radial-gradient(at 70% 85%, #4C1D95 0px, transparent 55%), #0D0B1E",
      surface: "rgba(255,255,255,0.07)", surfaceElevated: "rgba(255,255,255,0.10)",
      textPrimary: "#FFFFFF", textSecondary: "#C7C3E8",
      accent: "#A78BFA", accentForeground: "#FFFFFF",
      ctaBackground: "linear-gradient(120deg, #6D28D9, #4338CA, #6D28D9)", ctaForeground: "#FFFFFF", ctaHover: "#5B21B6",
      border: "rgba(255,255,255,0.14)", success: "#4ADE80",
      badgeBackground: "rgba(167,139,250,0.16)", badgeForeground: "#DDD6FE",
      inputBackground: "rgba(255,255,255,0.06)", inputBorder: "rgba(255,255,255,0.16)",
      inputText: "#FFFFFF", inputPlaceholder: "#9A94C4",
    },
    typography: { fontHeading: F.inter, fontBody: F.inter, fontMono: F.mono, headingWeight: 800, headingScale: 1, bodySize: "15px", letterSpacing: "-0.025em", ctaTextTransform: "uppercase" },
    shape: { radiusCard: "24px", radiusInput: "14px", radiusCta: "14px", borderWidth: "1px" },
    effects: { shadowCard: "0 16px 48px rgba(76,29,149,0.35)", gradient: { direction: "120deg", stops: ["#6D28D9", "#4338CA", "#6D28D9"] }, backgroundPattern: "gradient-mesh" },
    layout: { density: "normal", badgeStyle: "pill", previewStyle: "framed" },
  },

  // 4 ─── Neon Tech ────────────────────────────────────────────
  neon: {
    id: "neon", label: "Neon Tech", mode: "dark",
    colors: {
      background: "#000000", surface: "rgba(0,255,136,0.03)", surfaceElevated: "rgba(0,255,136,0.06)",
      textPrimary: "#FFFFFF", textSecondary: "#86EFAC",
      accent: "#00FF88", accentForeground: "#001208",
      ctaBackground: "#00FF88", ctaForeground: "#001208", ctaHover: "#33FFA0",
      border: "rgba(0,255,136,0.35)", success: "#00FF88",
      badgeBackground: "rgba(0,255,136,0.10)", badgeForeground: "#86EFAC",
      inputBackground: "rgba(0,255,136,0.04)", inputBorder: "rgba(0,255,136,0.30)",
      inputText: "#FFFFFF", inputPlaceholder: "#4ADE80",
    },
    typography: { fontHeading: F.inter, fontBody: F.inter, fontMono: F.mono, headingWeight: 700, headingScale: 1, bodySize: "15px", letterSpacing: "-0.01em", ctaTextTransform: "uppercase" },
    shape: { radiusCard: "4px", radiusInput: "4px", radiusCta: "4px", borderWidth: "1px" },
    effects: { shadowCard: "0 0 0 1px rgba(0,255,136,0.2)", ctaGlow: "0 0 24px rgba(0,255,136,0.6)", backgroundPattern: "grid" },
    layout: { density: "normal", badgeStyle: "outline", previewStyle: "framed" },
  },

  // 5 ─── Elegante ─────────────────────────────────────────────
  elegant: {
    id: "elegant", label: "Elegante", mode: "dark",
    colors: {
      background: "#141210", surface: "#1C1915", surfaceElevated: "#232019",
      textPrimary: "#F5EFE4", textSecondary: "#B8A98C",
      accent: "#D4B872", accentForeground: "#1A1408",
      ctaBackground: "#D4B872", ctaForeground: "#1A1408", ctaHover: "#C4A85E",
      border: "rgba(212,184,114,0.18)", success: "#8FBF7F",
      badgeBackground: "rgba(212,184,114,0.12)", badgeForeground: "#D4B872",
      inputBackground: "#191611", inputBorder: "rgba(212,184,114,0.22)",
      inputText: "#F5EFE4", inputPlaceholder: "#8A7B5E",
    },
    typography: { fontHeading: F.playfair, fontBody: F.inter, fontMono: F.mono, headingWeight: 600, headingScale: 1.08, bodySize: "15px", letterSpacing: "0em", ctaTextTransform: "none" },
    shape: { radiusCard: "10px", radiusInput: "8px", radiusCta: "8px", borderWidth: "1px" },
    effects: { shadowCard: "0 12px 40px rgba(0,0,0,0.5)", backgroundPattern: "none" },
    layout: { density: "spacious", badgeStyle: "outline", previewStyle: "framed" },
  },

  // 6 ─── Urgência ─────────────────────────────────────────────
  urgency: {
    id: "urgency", label: "Urgência", mode: "dark",
    colors: {
      background: "#0C0A0A", surface: "#17110F", surfaceElevated: "#1F1512",
      textPrimary: "#FAFAFA", textSecondary: "#E5A3A3",
      accent: "#DC2626", accentForeground: "#FFFFFF",
      ctaBackground: "#DC2626", ctaForeground: "#FFFFFF", ctaHover: "#B91C1C",
      border: "rgba(220,38,38,0.28)", success: "#4ADE80",
      badgeBackground: "rgba(220,38,38,0.14)", badgeForeground: "#F87171",
      inputBackground: "#140F0E", inputBorder: "rgba(220,38,38,0.25)",
      inputText: "#FAFAFA", inputPlaceholder: "#B87878",
    },
    typography: { fontHeading: F.oswald, fontBody: F.inter, fontMono: F.mono, headingWeight: 700, headingScale: 1.05, bodySize: "15px", letterSpacing: "0.01em", ctaTextTransform: "uppercase" },
    shape: { radiusCard: "8px", radiusInput: "6px", radiusCta: "8px", borderWidth: "1px" },
    effects: { shadowCard: "0 8px 28px rgba(0,0,0,0.5)", ctaGlow: "0 10px 30px rgba(220,38,38,0.45)", backgroundPattern: "none" },
    layout: { density: "compact", badgeStyle: "pill", previewStyle: "framed" },
  },

  // 7 ─── Claro Profissional ───────────────────────────────────
  clean: {
    id: "clean", label: "Claro Profissional", mode: "light",
    colors: {
      background: "#F5F7FA", surface: "#FFFFFF", surfaceElevated: "#FFFFFF",
      textPrimary: "#0F172A", textSecondary: "#475569",
      accent: "#2563EB", accentForeground: "#FFFFFF",
      ctaBackground: "#2563EB", ctaForeground: "#FFFFFF", ctaHover: "#1D4ED8",
      border: "#E2E8F0", success: "#16A34A",
      badgeBackground: "rgba(37,99,235,0.10)", badgeForeground: "#1D4ED8",
      inputBackground: "#FFFFFF", inputBorder: "#CBD5E1",
      inputText: "#0F172A", inputPlaceholder: "#6B7688",
    },
    typography: { fontHeading: F.inter, fontBody: F.inter, fontMono: F.mono, headingWeight: 700, headingScale: 1, bodySize: "15px", letterSpacing: "-0.02em", ctaTextTransform: "uppercase" },
    shape: { radiusCard: "14px", radiusInput: "10px", radiusCta: "10px", borderWidth: "1px" },
    effects: { shadowCard: "0 4px 24px rgba(15,23,42,0.08)", backgroundPattern: "none" },
    layout: { density: "normal", badgeStyle: "pill", previewStyle: "framed" },
  },

  // 8 ─── Claro Suave ──────────────────────────────────────────
  ocean: {
    id: "ocean", label: "Claro Suave", mode: "light",
    colors: {
      background: "#FAF7F2", surface: "#FFFFFF", surfaceElevated: "#FFFFFF",
      textPrimary: "#2D2A26", textSecondary: "#6B6459",
      accent: "#4A7C59", accentForeground: "#FFFFFF",
      ctaBackground: "#4A7C59", ctaForeground: "#FFFFFF", ctaHover: "#3F6B4F",
      border: "#EDE7DD", success: "#3F6B4F",
      badgeBackground: "rgba(74,124,89,0.12)", badgeForeground: "#3F6B4F",
      inputBackground: "#FBF9F5", inputBorder: "#E5DFD3",
      inputText: "#2D2A26", inputPlaceholder: "#857D6E",
    },
    typography: { fontHeading: F.nunito, fontBody: F.nunito, fontMono: F.mono, headingWeight: 800, headingScale: 1, bodySize: "15px", letterSpacing: "-0.01em", ctaTextTransform: "none" },
    shape: { radiusCard: "24px", radiusInput: "16px", radiusCta: "16px", borderWidth: "1px" },
    effects: { shadowCard: "0 12px 40px rgba(74,124,89,0.10)", backgroundPattern: "none" },
    layout: { density: "spacious", badgeStyle: "pill", previewStyle: "framed" },
  },
};

export const THEME_LIST = Object.values(THEMES);

/** Deriva a variante do CTA a partir dos tokens (sem campo extra). */
export function ctaVariant(t: CheckoutTheme): "solid" | "outline" | "gradient" {
  if (t.colors.ctaBackground.includes("gradient(")) return "gradient";
  if (t.colors.ctaBackground === "transparent") return "outline";
  return "solid";
}

/**
 * Resolve o tema efetivo: TEMA base + overrides do usuário.
 * Regra (corrige o bug do merge antigo): cores custom só sobrescrevem quando
 * preenchidas (string não-vazia). Campos vazios = herdar 100% do template.
 */
export function resolveTheme(a: AppearanceConfig, overrides?: ThemeOverrides): CheckoutTheme {
  const base = THEMES[(a.templateId as TemplateId) || "classic"] || THEMES.classic;
  const ov = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);

  // Overrides vindos dos 8 campos de cor da aba Aparência (mecanismo atual)
  const fromAppearance: ThemeOverrides = {
    background: ov(a.bgColor),
    surface: ov(a.widgetBgColor),
    textPrimary: ov(a.textColor),
    accent: ov(a.primaryColor),
    ctaBackground: ov(a.buttonColor),
    ctaForeground: ov(a.buttonTextColor),
    inputBackground: ov(a.inputBgColor),
    inputText: ov(a.inputTextColor),
  };
  // Precedência: 8 campos de cor da aba → themeOverrides persistido → param explícito
  const persisted = (a.themeOverrides as ThemeOverrides | undefined) || undefined;
  const merged: ThemeOverrides = { ...fromAppearance, ...(persisted || {}), ...(overrides || {}) };
  const colorKeys = Object.keys(base.colors) as (keyof CheckoutThemeColors)[];
  const colors = { ...base.colors };
  for (const k of colorKeys) {
    const val = merged[k];
    if (val && String(val).trim()) colors[k] = val as string;
  }

  const typography = { ...base.typography };
  if (merged.fontHeading) typography.fontHeading = merged.fontHeading;
  if (merged.fontBody) typography.fontBody = merged.fontBody;

  return { ...base, colors, typography };
}

/** Mapa completo de CSS variables `--checkout-*` (consumido pelo Provider). */
export function themeToCssVars(t: CheckoutTheme): Record<string, string> {
  const c = t.colors;
  const gapByDensity = { compact: "1rem", normal: "1.5rem", spacious: "2.25rem" }[t.layout.density];
  return {
    "--checkout-background": c.background,
    "--checkout-surface": c.surface === "transparent" ? "transparent" : c.surface,
    "--checkout-surface-elevated": c.surfaceElevated,
    "--checkout-text-primary": c.textPrimary,
    "--checkout-text-secondary": c.textSecondary,
    "--checkout-accent": c.accent,
    "--checkout-accent-foreground": c.accentForeground,
    "--checkout-cta-background": c.ctaBackground,
    "--checkout-cta-foreground": c.ctaForeground,
    "--checkout-cta-hover": c.ctaHover,
    "--checkout-border": c.border,
    "--checkout-success": c.success,
    "--checkout-badge-background": c.badgeBackground,
    "--checkout-badge-foreground": c.badgeForeground,
    "--checkout-input-background": c.inputBackground,
    "--checkout-input-border": c.inputBorder,
    "--checkout-input-text": c.inputText,
    "--checkout-input-placeholder": c.inputPlaceholder,
    // typography
    "--checkout-font-heading": t.typography.fontHeading,
    "--checkout-font-body": t.typography.fontBody,
    "--checkout-font-mono": t.typography.fontMono,
    "--checkout-heading-weight": String(t.typography.headingWeight),
    "--checkout-heading-scale": String(t.typography.headingScale),
    "--checkout-body-size": t.typography.bodySize,
    "--checkout-letter-spacing": t.typography.letterSpacing,
    "--checkout-cta-transform": t.typography.ctaTextTransform,
    // shape
    "--checkout-radius-card": t.shape.radiusCard,
    "--checkout-radius-input": t.shape.radiusInput,
    "--checkout-radius-cta": t.shape.radiusCta,
    "--checkout-border-width": t.shape.borderWidth,
    // effects
    "--checkout-shadow-card": t.effects.shadowCard,
    "--checkout-cta-glow": t.effects.ctaGlow || "none",
    // layout
    "--checkout-gap": gapByDensity,
  };
}
