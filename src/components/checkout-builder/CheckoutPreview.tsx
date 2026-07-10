"use client";

import { CheckoutConfig } from "@/types/checkout-config";
import { resolveTheme, themeCssVars } from "@/types/checkout-theme";
import { checkoutFontVars } from "@/lib/checkout-fonts";
import { CountdownTimer } from "./preview/CountdownTimer";
import { SocialPopup } from "./preview/SocialPopup";
import { ReviewCarousel } from "./preview/ReviewCarousel";
import { Shield, Lock, BadgeCheck, PlayCircle, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  config: CheckoutConfig;
  isMobile?: boolean;
}

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0&controls=1&rel=0`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return null;
}

export function CheckoutPreview({ config, isMobile }: Props) {
  const { appearance: a, content: c, triggers: t, socialProof: sp, form: f, bumpUpsell: bu } = config;
  const theme = resolveTheme(a);
  const col = theme.colors;

  // Espaçamento por densidade
  const gap = theme.density === "compact" ? "gap-5" : theme.density === "spacious" ? "gap-10" : "gap-8";
  const cardPad = theme.density === "compact" ? "p-5" : theme.density === "spacious" ? "p-8 sm:p-10" : "p-5 sm:p-8";
  const stack = theme.density === "compact" ? "space-y-4" : theme.density === "spacious" ? "space-y-6 sm:space-y-8" : "space-y-5 sm:space-y-6";

  const isLongForm = a.layoutType === "longform";
  const isMultiStep = a.layoutType === "multistep";

  // Fonte do usuário (aba Aparência) tem prioridade sobre a fonte do tema
  const userFont = a.fontFamily && a.fontFamily !== "Geist" ? a.fontFamily : null;
  const headingFont = userFont || theme.fonts.heading;
  const bodyFont = userFont || theme.fonts.body;
  const labelFont = theme.fonts.mono || bodyFont;

  const headingStyle: React.CSSProperties = {
    fontFamily: headingFont,
    fontWeight: theme.fonts.headingWeight,
    letterSpacing: theme.fonts.headingTracking,
    textTransform: theme.fonts.headingTransform,
    color: col.text,
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: labelFont,
    fontWeight: theme.fonts.labelWeight,
    letterSpacing: theme.fonts.labelTracking,
    color: col.label,
  };
  const fieldStyle: React.CSSProperties = {
    background: col.fieldBg,
    border: `1px solid ${col.fieldBorder}`,
    color: col.fieldText,
    borderRadius: theme.radius.field,
  };
  const cardStyle: React.CSSProperties = {
    background: col.surface,
    border: `1px solid ${col.surfaceBorder}`,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.card,
    backdropFilter: theme.glass ? "blur(16px)" : undefined,
    WebkitBackdropFilter: theme.glass ? "blur(16px)" : undefined,
  };

  const btnClass = cn(
    "ck-btn w-full py-4 sm:py-5 text-base sm:text-lg relative overflow-hidden group",
    `ck-btn--${theme.button.variant}`,
    theme.button.glow && "ck-btn--glow",
    theme.button.animate === "pulse" && "ck-btn--pulse",
    theme.button.animate === "shimmer" && "ck-btn--gradient"
  );
  const btnStyle: React.CSSProperties = {
    borderRadius: theme.radius.button,
    fontFamily: bodyFont,
    fontWeight: 800,
    boxShadow: theme.button.variant === "solid" ? theme.shadow.button : undefined,
  };

  // Badge de contexto (buyerCount) segundo badgeStyle
  const renderBadgeShell = (children: React.ReactNode) => {
    if (theme.badgeStyle === "text") {
      return <div className="flex items-center gap-2" style={{ color: col.accent, fontFamily: labelFont }}>{children}</div>;
    }
    if (theme.badgeStyle === "outline") {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2" style={{ border: `1px solid ${col.accent}`, borderRadius: theme.radius.field }}>
          {children}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md"
        style={{ background: col.accentSoft, border: `1px solid ${col.surfaceBorder}` }}>
        {children}
      </div>
    );
  };

  return (
    <div
      className={cn("relative w-full min-h-full overflow-x-hidden transition-colors duration-500", checkoutFontVars)}
      style={{ background: col.bg, color: col.text, fontFamily: bodyFont, fontWeight: theme.fonts.bodyWeight, ...themeCssVars(theme) } as React.CSSProperties}
    >
      {/* Background pattern (Neon grid) */}
      {theme.backgroundPattern === "grid" && (
        <div className="ck-grid-pattern absolute inset-0 pointer-events-none" aria-hidden />
      )}

      {/* Urgency Banner */}
      {t.urgency.enabled && (
        <div
          className={cn("relative z-30 w-full text-center text-[13px] py-3 px-4", theme.button.animate === "pulse" && "animate-pulse")}
          style={{ background: t.urgency.bgColor || col.accent, color: "#fff", fontFamily: headingFont, fontWeight: 800, letterSpacing: theme.fonts.labelTracking, textTransform: theme.fonts.headingTransform }}
        >
          {t.urgency.text}
        </div>
      )}

      <div className={cn("relative w-full mx-auto px-4 sm:px-6 py-8 sm:py-12", isLongForm ? "max-w-3xl" : "max-w-6xl")}>
        <div className={cn("flex flex-col", gap, !isMobile && !isLongForm && "lg:grid lg:grid-cols-12 lg:gap-12")}>

          {/* ─── LEFT: Hero ─── */}
          <div className={cn(stack, !isMobile && !isLongForm && "lg:col-span-7")}>
            {/* Brand row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {a.logoUrl && <img src={a.logoUrl} alt="Logo" className="h-8 sm:h-10 object-contain" />}
              {sp.buyerCount.enabled && renderBadgeShell(
                <>
                  {theme.badgeStyle === "pill" && (
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold"
                          style={{ borderColor: col.bgSolid, background: col.accent, color: col.accentText }}>
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] sm:text-[11px] font-bold" style={{ color: col.accent }}>
                    +{sp.buyerCount.count.toLocaleString("pt-BR")} {sp.buyerCount.label}
                  </span>
                </>
              )}
            </div>

            {/* Media */}
            <div className="relative w-full">
              {c.videoUrl && getVideoEmbed(c.videoUrl) ? (
                <div className="relative overflow-hidden aspect-video bg-black" style={{ borderRadius: theme.radius.card, border: `1px solid ${col.surfaceBorder}` }}>
                  <iframe src={getVideoEmbed(c.videoUrl)!} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                </div>
              ) : (a.bannerUrl || a.bannerExternal) ? (
                <div className="relative overflow-hidden" style={{ borderRadius: theme.radius.card, border: `1px solid ${col.surfaceBorder}`, boxShadow: theme.shadow.card }}>
                  <img src={a.bannerUrl || a.bannerExternal} alt="Banner" className="w-full object-cover max-h-[320px] sm:max-h-[420px]" />
                </div>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 border-2 border-dashed"
                  style={{ background: col.fieldBg, borderColor: col.fieldBorder, borderRadius: theme.radius.card }}>
                  <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: col.muted }} />
                  <span className="text-xs sm:text-sm uppercase tracking-widest" style={{ ...labelStyle, color: col.muted }}>
                    Preview de Vídeo / Imagem
                  </span>
                </div>
              )}
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[1.1]" style={headingStyle}>{c.headline}</h1>
              <p className="text-base sm:text-lg md:text-xl" style={{ color: col.subtext, fontFamily: bodyFont, fontWeight: theme.fonts.bodyWeight }}>{c.subheadline}</p>
              {c.description && (
                <p className="text-[14px] sm:text-[15px] leading-relaxed border-l-2 pl-4" style={{ color: col.subtext, borderColor: col.accent, opacity: 0.9 }}>
                  {c.description}
                </p>
              )}
            </div>

            {/* Benefits */}
            {c.benefits.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {c.benefits.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 sm:p-4" style={{ background: col.fieldBg, border: `1px solid ${col.fieldBorder}`, borderRadius: theme.radius.field }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: col.accent }}>
                      <CheckCircle2 className="h-3.5 w-3.5" style={{ color: col.accentText }} />
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: col.text }}>{b.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {sp.reviews.enabled && sp.reviews.items.length > 0 && (
              <div className="pt-6 sm:pt-8" style={{ borderTop: `1px solid ${col.surfaceBorder}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}</div>
                  <span className="text-sm uppercase tracking-widest" style={{ ...labelStyle, opacity: 0.7 }}>Avaliações</span>
                </div>
                <ReviewCarousel reviews={sp.reviews.items} display={sp.reviews.display} primaryColor={col.accent} />
              </div>
            )}
          </div>

          {/* ─── RIGHT: Form ─── */}
          <div className={cn("w-full", !isMobile && !isLongForm && "lg:col-span-5")}>
            {isMultiStep && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: col.surfaceBorder }}>
                  <div className="h-full w-1/3" style={{ background: col.accent }} />
                </div>
                <span className="text-[10px] uppercase tracking-widest" style={{ ...labelStyle }}>Etapa 1 de 3</span>
              </div>
            )}
            <div className={cn("w-full", cardPad, stack, !isMobile && !isLongForm && "lg:sticky lg:top-8")} style={cardStyle}>
              {/* Form header */}
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl" style={{ ...headingStyle }}>
                  {isMultiStep ? "Identificação" : theme.id === "urgency" ? "COMPLETE SEU PEDIDO" : "Dados do Pagamento"}
                </h2>
                <p className="text-xs uppercase" style={{ ...labelStyle }}>
                  {isMultiStep ? "Etapa 1 · Dados Básicos" : "Informações Pessoais Seguras"}
                </p>
              </div>

              {/* Fields */}
              <div className={theme.density === "compact" ? "space-y-3" : "space-y-3 sm:space-y-4"}>
                {[{ label: "Nome Completo", ph: "Seu nome aqui" }, { label: "E-mail Principal", ph: "seu@email.com" }].map(field => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="block text-[10px] sm:text-[11px] uppercase ml-0.5" style={labelStyle}>{field.label}</label>
                    <div className="h-11 sm:h-12 px-4 flex items-center" style={fieldStyle}>
                      <span className="text-sm" style={{ color: col.muted }}>{field.ph}</span>
                    </div>
                  </div>
                ))}

                {Object.entries(f.optionalFields).filter(([, v]) => v).map(([key]) => {
                  const labels: Record<string, string> = { cpf: "CPF / CNPJ", phone: "Telefone / WhatsApp", birthDate: "Nascimento", address: "Endereço", zipCode: "CEP", company: "Empresa" };
                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="block text-[10px] sm:text-[11px] uppercase ml-0.5" style={labelStyle}>{labels[key]}</label>
                      <div className="h-11 sm:h-12 px-4 flex items-center" style={fieldStyle}>
                        <span className="text-sm" style={{ color: col.muted }}>Campo configurado</span>
                      </div>
                    </div>
                  );
                })}

                {/* Order bumps */}
                {bu.orderBumps?.filter(b => b.enabled).map(bump => (
                  <div key={bump.id} className="p-4 border-2 border-dashed relative overflow-hidden" style={{ background: col.accentSoft, borderColor: col.accent, borderRadius: theme.radius.field }}>
                    <div className="absolute top-0 right-0 text-[8px] font-black uppercase px-2 py-0.5" style={{ background: col.accent, color: col.accentText, borderBottomLeftRadius: theme.radius.field }}>Oferta Única</div>
                    <div className="flex items-start gap-3 mt-2">
                      {bump.imageUrl ? (
                        <img src={bump.imageUrl} alt="Bump" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1" style={{ borderColor: col.accent }}>
                          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: col.accent }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black" style={{ color: col.accent }}>⚡ {bump.presentationText}</p>
                        <h4 className="text-[13px] sm:text-[14px] font-bold mt-1 leading-tight" style={{ color: col.text }}>{bump.productName}</h4>
                        <p className="text-[13px] font-black mt-1" style={{ color: col.text }}>Por Apenas: <span style={{ color: col.accent }}>R$ {bump.specialPrice.toFixed(2).replace(".", ",")}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <button className={btnClass} style={btnStyle}>
                  <span className="relative z-10 select-none uppercase tracking-widest text-[15px]">
                    {isMultiStep ? "Próxima Etapa →" : a.buttonText}
                  </span>
                </button>

                {/* Seals */}
                {(t.authority.sealSecure || t.authority.sealSatisfaction || t.authority.sealProtected) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-2">
                    {t.authority.sealSecure && <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: col.subtext }}><Lock className="h-3 w-3" style={{ color: col.accent }} /> Compra Segura</div>}
                    {t.authority.sealSatisfaction && <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: col.subtext }}><BadgeCheck className="h-3 w-3" style={{ color: col.accent }} /> Garantia</div>}
                    {t.authority.sealProtected && <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: col.subtext }}><Shield className="h-3 w-3" style={{ color: col.accent }} /> Blindado</div>}
                  </div>
                )}

                {t.scarcity.vacanciesEnabled && (
                  <div className="text-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-pulse" style={{ color: col.accent }}>
                      🚨 {t.scarcity.vacanciesText.replace("{n}", String(t.scarcity.vacanciesCount))}
                    </span>
                  </div>
                )}
              </div>

              {/* Guarantee */}
              {t.guarantee.enabled && (
                <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4" style={{ background: col.accentSoft, border: `1px solid ${col.surfaceBorder}`, borderRadius: theme.radius.field }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: col.surfaceElevated, border: `1px solid ${col.surfaceBorder}` }}>
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: col.accent }} />
                  </div>
                  <div>
                    <h5 className="text-[12px] sm:text-[13px] uppercase" style={{ ...headingStyle, color: col.accent, fontSize: undefined }}>Garantia de {t.guarantee.days} Dias</h5>
                    <p className="text-[11px] sm:text-[12px] leading-relaxed mt-1" style={{ color: col.subtext }}>{t.guarantee.text}</p>
                  </div>
                </div>
              )}

              {/* Payment logos */}
              {t.authority.showPaymentLogos && (
                <div className="flex items-center justify-center gap-2 sm:gap-4 opacity-50 py-2 flex-wrap">
                  {["Visa", "Mastercard", "Pix", "Elo", "SSL"].map(brand => (
                    <span key={brand} className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded" style={{ border: `1px solid ${col.fieldBorder}`, color: col.text }}>{brand}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {sp.popup.enabled && <SocialPopup interval={sp.popup.interval} primaryColor={col.accent} />}
      {t.scarcity.countdownEnabled && <CountdownTimer config={t.scarcity} />}
    </div>
  );
}
