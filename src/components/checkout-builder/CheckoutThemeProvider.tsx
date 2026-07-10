"use client";

import { createContext, useContext } from "react";
import { CheckoutTheme, themeToCssVars, ctaVariant } from "@/types/checkout-theme";
import { checkoutFontVars } from "@/lib/checkout-fonts";
import { cn } from "@/lib/utils";

// ============================================================
// Provider ÚNICO de tema do checkout.
// Emite TODAS as CSS variables `--checkout-*` num wrapper e expõe o tema
// (para decisões estruturais: densidade, badge, preview, pattern) via contexto.
// Usado IGUALMENTE pelo preview do builder e pela página pública → o tema
// nunca é duplicado. Componentes de render consomem só var(--checkout-*).
// ============================================================

const CheckoutThemeContext = createContext<CheckoutTheme | null>(null);

export function useCheckoutTheme(): CheckoutTheme {
  const t = useContext(CheckoutThemeContext);
  if (!t) throw new Error("useCheckoutTheme deve ser usado dentro de <CheckoutThemeProvider>");
  return t;
}

interface Props {
  theme: CheckoutTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** aplica o background do tema no wrapper (página inteira) */
  applyBackground?: boolean;
}

export function CheckoutThemeProvider({ theme, children, className, style, applyBackground = true }: Props) {
  const pattern = theme.effects.backgroundPattern;
  return (
    <CheckoutThemeContext.Provider value={theme}>
      <div
        data-checkout-root=""
        data-density={theme.layout.density}
        data-cta={ctaVariant(theme)}
        data-pattern={pattern}
        className={cn(checkoutFontVars, className)}
        style={{
          ...themeToCssVars(theme),
          fontFamily: "var(--checkout-font-body)",
          fontSize: "var(--checkout-body-size)",
          color: "var(--checkout-text-primary)",
          ...(applyBackground ? { background: "var(--checkout-background)" } : {}),
          ...style,
        } as React.CSSProperties}
      >
        {/* Camada de padrão de fundo (grid / noise) — sob o conteúdo */}
        {(pattern === "grid" || pattern === "noise") && (
          <div className={cn("pointer-events-none absolute inset-0", pattern === "grid" ? "ck-pattern-grid" : "ck-pattern-noise")} aria-hidden />
        )}
        {children}
      </div>
    </CheckoutThemeContext.Provider>
  );
}
