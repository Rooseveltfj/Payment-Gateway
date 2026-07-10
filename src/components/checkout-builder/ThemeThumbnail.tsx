"use client";

import { CheckoutTheme } from "@/types/checkout-theme";
import { checkoutFontVars } from "@/lib/checkout-fonts";

/**
 * Miniatura REAL do tema, derivada dos mesmos tokens do CheckoutTheme.
 * Não é imagem estática → nunca diverge do render do checkout.
 * Reproduz em escala: fundo, superfície/card, título, subtítulo, campo e CTA.
 */
export function ThemeThumbnail({ theme }: { theme: CheckoutTheme }) {
  const col = theme.colors;
  return (
    <div
      className={`relative w-full aspect-[4/3] overflow-hidden ${checkoutFontVars}`}
      style={{ background: col.bg }}
    >
      {theme.backgroundPattern === "grid" && (
        <div className="ck-grid-pattern absolute inset-0" aria-hidden />
      )}
      <div className="relative h-full w-full flex flex-col justify-between p-2.5 gap-1.5">
        {/* topo: título + subtítulo */}
        <div className="space-y-1">
          <div
            style={{
              height: 6, width: "72%", background: col.text, borderRadius: 2,
              opacity: theme.fonts.headingWeight >= 700 ? 1 : 0.85,
            }}
          />
          <div style={{ height: 4, width: "50%", background: col.subtext, borderRadius: 2 }} />
        </div>

        {/* card/campo */}
        <div
          className="flex-1 flex flex-col justify-center gap-1.5 px-2"
          style={{
            background: col.surface === "transparent" ? "rgba(255,255,255,0.02)" : col.surface,
            border: `1px solid ${col.surfaceBorder}`,
            borderRadius: Math.min(parseInt(theme.radius.card) || 6, 12),
            backdropFilter: theme.glass ? "blur(6px)" : undefined,
            WebkitBackdropFilter: theme.glass ? "blur(6px)" : undefined,
          }}
        >
          <div style={{ height: 5, width: "85%", background: col.fieldBg === "transparent" ? col.fieldBorder : col.fieldBg, border: `1px solid ${col.fieldBorder}`, borderRadius: 2 }} />
          <div style={{ height: 5, width: "65%", background: col.fieldBg === "transparent" ? col.fieldBorder : col.fieldBg, border: `1px solid ${col.fieldBorder}`, borderRadius: 2 }} />
        </div>

        {/* CTA — respeita variante/forma/cor do tema */}
        <div
          className="w-full flex items-center justify-center"
          style={{
            height: 12,
            borderRadius: Math.min(parseInt(theme.radius.button) || 4, 9),
            background: theme.button.variant === "gradient" ? (theme.button.gradient || col.accent)
              : theme.button.variant === "outline" ? "transparent" : col.accent,
            border: theme.button.variant === "outline" ? `1.5px solid ${col.accent}` : undefined,
            boxShadow: theme.button.glow ? `0 0 10px ${col.accent}` : undefined,
          }}
        >
          <div style={{ height: 3, width: "38%", background: theme.button.variant === "outline" ? col.accent : col.accentText, borderRadius: 2, opacity: 0.9 }} />
        </div>
      </div>

      {/* selo LIGHT/DARK canto */}
      <div
        className="absolute top-1.5 right-1.5 px-1 rounded text-[6px] font-black uppercase tracking-wider"
        style={{
          background: theme.mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
          color: col.subtext,
        }}
      >
        {theme.mode}
      </div>
    </div>
  );
}
