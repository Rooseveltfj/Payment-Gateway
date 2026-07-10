"use client";

import { CheckoutTheme, ctaVariant } from "@/types/checkout-theme";
import { checkoutFontVars } from "@/lib/checkout-fonts";

/**
 * Miniatura REAL do tema, derivada exclusivamente dos tokens do CheckoutTheme.
 * Não é imagem estática → nunca diverge do render do checkout.
 */
export function ThemeThumbnail({ theme }: { theme: CheckoutTheme }) {
  const c = theme.colors;
  const variant = ctaVariant(theme);
  const rCard = Math.min(parseInt(theme.shape.radiusCard) || 6, 12);
  const rCta = Math.min(parseInt(theme.shape.radiusCta) || 4, 9);
  const surface = c.surface === "transparent" ? c.surfaceElevated : c.surface;
  const field = c.inputBackground === "transparent" ? c.inputBorder : c.inputBackground;

  return (
    <div className={`relative w-full aspect-[4/3] overflow-hidden ${checkoutFontVars}`} style={{ background: c.background }}>
      {theme.effects.backgroundPattern === "grid" && (
        <div className="ck-pattern-grid absolute inset-0" style={{ "--checkout-border": c.border } as React.CSSProperties} aria-hidden />
      )}
      <div className="relative h-full w-full flex flex-col justify-between p-2.5 gap-1.5">
        {/* título + subtítulo */}
        <div className="space-y-1">
          <div style={{ height: 6, width: "72%", background: c.textPrimary, borderRadius: 2, opacity: theme.typography.headingWeight >= 700 ? 1 : 0.85 }} />
          <div style={{ height: 4, width: "50%", background: c.textSecondary, borderRadius: 2 }} />
        </div>

        {/* card + campos */}
        <div className="flex-1 flex flex-col justify-center gap-1.5 px-2"
          style={{ background: surface, border: `1px solid ${c.border}`, borderRadius: rCard, backdropFilter: theme.id === "gradient" ? "blur(6px)" : undefined, WebkitBackdropFilter: theme.id === "gradient" ? "blur(6px)" : undefined }}>
          <div style={{ height: 5, width: "85%", background: field, border: `1px solid ${c.inputBorder}`, borderRadius: 2 }} />
          <div style={{ height: 5, width: "65%", background: field, border: `1px solid ${c.inputBorder}`, borderRadius: 2 }} />
        </div>

        {/* CTA — variante/forma/cor do tema */}
        <div className="w-full flex items-center justify-center"
          style={{
            height: 12, borderRadius: rCta,
            background: variant === "outline" ? "transparent" : c.ctaBackground,
            border: variant === "outline" ? `1.5px solid ${c.ctaForeground}` : undefined,
            boxShadow: theme.effects.ctaGlow ? `0 0 10px ${c.accent}` : undefined,
          }}>
          <div style={{ height: 3, width: "38%", background: variant === "outline" ? c.ctaForeground : c.ctaForeground, borderRadius: 2, opacity: 0.9 }} />
        </div>
      </div>

      <div className="absolute top-1.5 right-1.5 px-1 rounded text-[6px] font-black uppercase tracking-wider"
        style={{ background: c.badgeBackground, color: c.textSecondary }}>
        {theme.mode}
      </div>
    </div>
  );
}
