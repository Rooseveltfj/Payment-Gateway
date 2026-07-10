"use client";

import { CheckoutConfig } from "@/types/checkout-config";
import { resolveTheme } from "@/types/checkout-theme";
import { CheckoutThemeProvider } from "./CheckoutThemeProvider";
import { CountdownTimer } from "./preview/CountdownTimer";
import { SocialPopup } from "./preview/SocialPopup";
import { ReviewCarousel } from "./preview/ReviewCarousel";
import { Shield, Lock, BadgeCheck, PlayCircle, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  config: CheckoutConfig;
  isMobile?: boolean;
}

// Tudo consumido via var(--checkout-*) — zero cor hardcoded.
const V = {
  bg: "var(--checkout-background)",
  surface: "var(--checkout-surface)",
  surfaceEl: "var(--checkout-surface-elevated)",
  text: "var(--checkout-text-primary)",
  sub: "var(--checkout-text-secondary)",
  accent: "var(--checkout-accent)",
  accentFg: "var(--checkout-accent-foreground)",
  border: "var(--checkout-border)",
  badgeBg: "var(--checkout-badge-background)",
  badgeFg: "var(--checkout-badge-foreground)",
  inputBg: "var(--checkout-input-background)",
  inputBorder: "var(--checkout-input-border)",
  inputText: "var(--checkout-input-text)",
  inputPh: "var(--checkout-input-placeholder)",
  fontHeading: "var(--checkout-font-heading)",
  fontBody: "var(--checkout-font-body)",
  fontMono: "var(--checkout-font-mono)",
  hWeight: "var(--checkout-heading-weight)",
  hScale: "var(--checkout-heading-scale)",
  tracking: "var(--checkout-letter-spacing)",
  rCard: "var(--checkout-radius-card)",
  rInput: "var(--checkout-radius-input)",
  shadowCard: "var(--checkout-shadow-card)",
  gap: "var(--checkout-gap)",
};

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

  const isLongForm = a.layoutType === "longform";
  const isMultiStep = a.layoutType === "multistep";
  const framed = theme.layout.previewStyle === "framed";
  const badge = theme.layout.badgeStyle;

  const headingStyle: React.CSSProperties = {
    fontFamily: V.fontHeading, fontWeight: V.hWeight as unknown as number,
    letterSpacing: V.tracking, color: V.text,
    textTransform: theme.typography.ctaTextTransform === "uppercase" && theme.id === "urgency" ? "uppercase" : "none",
  };
  const heroSize: React.CSSProperties = { fontSize: `calc(clamp(1.875rem, 4.5vw, 3rem) * ${V.hScale})`, lineHeight: 1.1 };
  const labelStyle: React.CSSProperties = { fontFamily: theme.typography.fontMono ? V.fontMono : V.fontBody, color: V.inputPh, letterSpacing: "0.12em" };
  const fieldStyle: React.CSSProperties = { background: V.inputBg, border: `var(--checkout-border-width) solid ${V.inputBorder}`, color: V.inputText, borderRadius: V.rInput };
  const cardStyle: React.CSSProperties = {
    background: V.surface, border: `var(--checkout-border-width) solid ${V.border}`,
    borderRadius: V.rCard, boxShadow: V.shadowCard,
    backdropFilter: theme.id === "gradient" ? "blur(16px)" : undefined,
    WebkitBackdropFilter: theme.id === "gradient" ? "blur(16px)" : undefined,
  };
  const btnClass = cn("ck-btn w-full py-4 sm:py-5 text-base sm:text-lg relative overflow-hidden group",
    theme.effects.ctaGlow && "ck-btn--glow", theme.id === "urgency" && "ck-btn--pulse");

  const badgeShell = (children: React.ReactNode) => {
    if (badge === "flat") return <div className="flex items-center gap-2" style={{ color: V.badgeFg, fontFamily: V.fontMono }}>{children}</div>;
    if (badge === "outline") return <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2" style={{ border: `1px solid ${V.accent}`, borderRadius: V.rInput, color: V.badgeFg }}>{children}</div>;
    return <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md" style={{ background: V.badgeBg, border: `1px solid ${V.border}` }}>{children}</div>;
  };

  return (
    <CheckoutThemeProvider theme={theme} className="relative w-full min-h-full overflow-x-hidden transition-colors duration-500">
      {/* Urgency Banner */}
      {t.urgency.enabled && (
        <div className={cn("relative z-30 w-full text-center text-[13px] py-3 px-4", theme.id === "urgency" && "animate-pulse")}
          style={{ background: t.urgency.bgColor || V.accent, color: V.accentFg, fontFamily: V.fontHeading, fontWeight: 800, letterSpacing: "0.06em", textTransform: theme.id === "urgency" ? "uppercase" : "none" }}>
          {t.urgency.text}
        </div>
      )}

      <div className={cn("relative w-full mx-auto px-4 sm:px-6 py-8 sm:py-12", isLongForm ? "max-w-3xl" : "max-w-6xl")}>
        <div className={cn("flex flex-col", !isMobile && !isLongForm && "lg:grid lg:grid-cols-12 lg:gap-12")} style={{ gap: V.gap }}>

          {/* LEFT: Hero */}
          <div className={cn(!isMobile && !isLongForm && "lg:col-span-7")} style={{ display: "flex", flexDirection: "column", gap: V.gap }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              {a.logoUrl && <img src={a.logoUrl} alt="Logo" className="h-8 sm:h-10 object-contain" />}
              {sp.buyerCount.enabled && badgeShell(
                <>
                  {badge === "pill" && (
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold"
                          style={{ borderColor: V.bg, background: V.accent, color: V.accentFg }}>{String.fromCharCode(64 + i)}</div>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] sm:text-[11px] font-bold" style={{ color: V.badgeFg }}>
                    +{sp.buyerCount.count.toLocaleString("pt-BR")} {sp.buyerCount.label}
                  </span>
                </>
              )}
            </div>

            {/* Media */}
            <div className="relative w-full">
              {c.videoUrl && getVideoEmbed(c.videoUrl) ? (
                <div className="relative overflow-hidden aspect-video" style={{ borderRadius: framed ? V.rCard : 0, border: framed ? `1px solid ${V.border}` : "none", background: V.surfaceEl }}>
                  <iframe src={getVideoEmbed(c.videoUrl)!} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                </div>
              ) : (a.bannerUrl || a.bannerExternal) ? (
                <div className="relative overflow-hidden" style={{ borderRadius: framed ? V.rCard : 0, border: framed ? `1px solid ${V.border}` : "none", boxShadow: framed ? V.shadowCard : "none" }}>
                  <img src={a.bannerUrl || a.bannerExternal} alt="Banner" className="w-full object-cover max-h-[320px] sm:max-h-[420px]" />
                </div>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 border-2 border-dashed"
                  style={{ background: V.inputBg, borderColor: V.inputBorder, borderRadius: framed ? V.rCard : 0 }}>
                  <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: V.inputPh }} />
                  <span className="text-xs sm:text-sm uppercase tracking-widest" style={{ color: V.inputPh, fontFamily: V.fontMono }}>Preview de Vídeo / Imagem</span>
                </div>
              )}
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 style={{ ...headingStyle, ...heroSize }}>{c.headline}</h1>
              <p className="text-base sm:text-lg md:text-xl" style={{ color: V.sub, fontFamily: V.fontBody }}>{c.subheadline}</p>
              {c.description && <p className="text-[14px] sm:text-[15px] leading-relaxed border-l-2 pl-4" style={{ color: V.sub, borderColor: V.accent, opacity: 0.9 }}>{c.description}</p>}
            </div>

            {/* Benefits */}
            {c.benefits.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {c.benefits.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 sm:p-4" style={{ background: V.inputBg, border: `1px solid ${V.inputBorder}`, borderRadius: V.rInput }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: V.accent }}>
                      <CheckCircle2 className="h-3.5 w-3.5" style={{ color: V.accentFg }} />
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: V.text }}>{b.text}</span>
                  </div>
                ))}
              </div>
            )}

            {sp.reviews.enabled && sp.reviews.items.length > 0 && (
              <div className="pt-6 sm:pt-8" style={{ borderTop: `1px solid ${V.border}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4" style={{ fill: V.accent, color: V.accent }} />)}</div>
                  <span className="text-sm uppercase tracking-widest" style={{ color: V.sub, opacity: 0.7, fontFamily: V.fontMono }}>Avaliações</span>
                </div>
                <ReviewCarousel reviews={sp.reviews.items} display={sp.reviews.display} />
              </div>
            )}
          </div>

          {/* RIGHT: Form */}
          <div className={cn("w-full", !isMobile && !isLongForm && "lg:col-span-5")}>
            {isMultiStep && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: V.border }}>
                  <div className="h-full w-1/3" style={{ background: V.accent }} />
                </div>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: V.sub, fontFamily: V.fontMono }}>Etapa 1 de 3</span>
              </div>
            )}
            <div className={cn("w-full p-5 sm:p-8", !isMobile && !isLongForm && "lg:sticky lg:top-8")} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: V.gap }}>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl" style={{ ...headingStyle }}>{isMultiStep ? "Identificação" : theme.id === "urgency" ? "COMPLETE SEU PEDIDO" : "Dados do Pagamento"}</h2>
                <p className="text-xs uppercase" style={{ ...labelStyle }}>{isMultiStep ? "Etapa 1 · Dados Básicos" : "Informações Pessoais Seguras"}</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {[{ label: "Nome Completo", ph: "Seu nome aqui" }, { label: "E-mail Principal", ph: "seu@email.com" }].map(field => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="block text-[10px] sm:text-[11px] uppercase ml-0.5" style={labelStyle}>{field.label}</label>
                    <div className="h-11 sm:h-12 px-4 flex items-center" style={fieldStyle}><span className="text-sm" style={{ color: V.inputPh }}>{field.ph}</span></div>
                  </div>
                ))}
                {Object.entries(f.optionalFields).filter(([, v]) => v).map(([key]) => {
                  const labels: Record<string, string> = { cpf: "CPF / CNPJ", phone: "Telefone / WhatsApp", birthDate: "Nascimento", address: "Endereço", zipCode: "CEP", company: "Empresa" };
                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="block text-[10px] sm:text-[11px] uppercase ml-0.5" style={labelStyle}>{labels[key]}</label>
                      <div className="h-11 sm:h-12 px-4 flex items-center" style={fieldStyle}><span className="text-sm" style={{ color: V.inputPh }}>Campo configurado</span></div>
                    </div>
                  );
                })}
                {bu.orderBumps?.filter(b => b.enabled).map(bump => (
                  <div key={bump.id} className="p-4 border-2 border-dashed relative overflow-hidden" style={{ background: V.badgeBg, borderColor: V.accent, borderRadius: V.rInput }}>
                    <div className="absolute top-0 right-0 text-[8px] font-black uppercase px-2 py-0.5" style={{ background: V.accent, color: V.accentFg, borderBottomLeftRadius: V.rInput }}>Oferta Única</div>
                    <div className="flex items-start gap-3 mt-2">
                      {bump.imageUrl ? <img src={bump.imageUrl} alt="Bump" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        : <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1" style={{ borderColor: V.accent }}><CheckCircle2 className="h-3.5 w-3.5" style={{ color: V.accent }} /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black" style={{ color: V.accent }}>⚡ {bump.presentationText}</p>
                        <h4 className="text-[13px] sm:text-[14px] font-bold mt-1 leading-tight" style={{ color: V.text }}>{bump.productName}</h4>
                        <p className="text-[13px] font-black mt-1" style={{ color: V.text }}>Por Apenas: <span style={{ color: V.accent }}>R$ {bump.specialPrice.toFixed(2).replace(".", ",")}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button className={btnClass}><span className="relative z-10 select-none uppercase tracking-widest text-[15px]">{isMultiStep ? "Próxima Etapa →" : a.buttonText}</span></button>
                {(t.authority.sealSecure || t.authority.sealSatisfaction || t.authority.sealProtected) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-2">
                    {t.authority.sealSecure && <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: V.sub }}><Lock className="h-3 w-3" style={{ color: V.accent }} /> Compra Segura</div>}
                    {t.authority.sealSatisfaction && <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: V.sub }}><BadgeCheck className="h-3 w-3" style={{ color: V.accent }} /> Garantia</div>}
                    {t.authority.sealProtected && <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: V.sub }}><Shield className="h-3 w-3" style={{ color: V.accent }} /> Blindado</div>}
                  </div>
                )}
                {t.scarcity.vacanciesEnabled && (
                  <div className="text-center"><span className="text-[11px] font-black uppercase tracking-[0.2em] animate-pulse" style={{ color: V.accent }}>🚨 {t.scarcity.vacanciesText.replace("{n}", String(t.scarcity.vacanciesCount))}</span></div>
                )}
              </div>

              {t.guarantee.enabled && (
                <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4" style={{ background: V.badgeBg, border: `1px solid ${V.border}`, borderRadius: V.rInput }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: V.surfaceEl, border: `1px solid ${V.border}` }}>
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: V.accent }} />
                  </div>
                  <div>
                    <h5 className="text-[12px] sm:text-[13px] uppercase font-bold" style={{ color: V.accent, fontFamily: V.fontHeading }}>Garantia de {t.guarantee.days} Dias</h5>
                    <p className="text-[11px] sm:text-[12px] leading-relaxed mt-1" style={{ color: V.sub }}>{t.guarantee.text}</p>
                  </div>
                </div>
              )}

              {t.authority.showPaymentLogos && (
                <div className="flex items-center justify-center gap-2 sm:gap-4 opacity-50 py-2 flex-wrap">
                  {["Visa", "Mastercard", "Pix", "Elo", "SSL"].map(brand => (
                    <span key={brand} className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded" style={{ border: `1px solid ${V.inputBorder}`, color: V.text }}>{brand}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {sp.popup.enabled && <SocialPopup interval={sp.popup.interval} />}
      {t.scarcity.countdownEnabled && <CountdownTimer config={t.scarcity} />}
    </CheckoutThemeProvider>
  );
}
