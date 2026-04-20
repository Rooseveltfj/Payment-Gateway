"use client";

import { CheckoutConfig, TemplateId } from "@/types/checkout-config";
import { CountdownTimer } from "./preview/CountdownTimer";
import { SocialPopup } from "./preview/SocialPopup";
import { ReviewCarousel } from "./preview/ReviewCarousel";
import { Shield, Lock, BadgeCheck, Users, PlayCircle, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  config: CheckoutConfig;
  isMobile?: boolean;
}

const FONT_IMPORTS: Record<string, string> = {
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap",
  Poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap",
  Montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap",
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

  // @ts-ignore
  const templateId: TemplateId = a.templateId || "classic";
  const fontFamily = a.fontFamily === "Geist" ? "inherit" : a.fontFamily;

  // ─── Template Styles — user's primaryColor always respected as accent ───
  const getTemplateStyles = () => {
    const userAccent = a.primaryColor || "#7c3aed";
    switch (templateId) {
      case "minimalist":
        return {
          bg: "#050505",
          cardBg: "rgba(255,255,255,0.02)",
          cardBorder: "rgba(255,255,255,0.05)",
          text: "#ffffff",
          subtext: "#71717a",
          accent: userAccent,
          fieldBg: "rgba(255,255,255,0.03)",
          fieldBorder: "rgba(255,255,255,0.07)",
          labelColor: "rgba(255,255,255,0.4)",
          isDark: true,
        };
      case "neon":
        return {
          bg: "#000000",
          cardBg: "rgba(0,255,159,0.02)",
          cardBorder: "rgba(0,255,159,0.1)",
          text: "#ffffff",
          subtext: "#00ff9f90",
          accent: "#00ff9f",
          fieldBg: "rgba(0,255,159,0.03)",
          fieldBorder: "rgba(0,255,159,0.08)",
          labelColor: "rgba(255,255,255,0.4)",
          isDark: true,
        };
      case "gradient":
        return {
          bg: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
          cardBg: "rgba(255,255,255,0.07)",
          cardBorder: "rgba(255,255,255,0.12)",
          text: "#ffffff",
          subtext: "#c4b5fd",
          accent: userAccent,
          fieldBg: "rgba(255,255,255,0.05)",
          fieldBorder: "rgba(255,255,255,0.1)",
          labelColor: "rgba(255,255,255,0.5)",
          isDark: true,
        };
      case "elegant":
        return {
          bg: "#0d0d10",
          cardBg: "#16161a",
          cardBorder: "rgba(255,255,255,0.04)",
          text: "#ffffff",
          subtext: "#94a3b8",
          accent: userAccent,
          fieldBg: "rgba(255,255,255,0.03)",
          fieldBorder: "rgba(255,255,255,0.06)",
          labelColor: "rgba(255,255,255,0.4)",
          isDark: true,
        };
      case "urgency":
        return {
          bg: "#09090b",
          cardBg: "rgba(239,68,68,0.04)",
          cardBorder: "rgba(239,68,68,0.2)",
          text: "#ffffff",
          subtext: "#f87171",
          accent: "#ef4444",
          fieldBg: "rgba(255,255,255,0.03)",
          fieldBorder: "rgba(239,68,68,0.15)",
          labelColor: "rgba(255,255,255,0.4)",
          isDark: true,
        };
      // ─── LIGHT TEMPLATES ───
      case "clean":
        return {
          bg: "#ffffff",
          cardBg: "#f8fafc",
          cardBorder: "#e2e8f0",
          text: "#0f172a",
          subtext: "#64748b",
          accent: userAccent,
          fieldBg: "#ffffff",
          fieldBorder: "#e2e8f0",
          labelColor: "#475569",
          isDark: false,
        };
      case "ocean":
        return {
          bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          cardBg: "#ffffff",
          cardBorder: "#bfdbfe",
          text: "#1e3a5f",
          subtext: "#3b82f6",
          accent: "#2563eb",
          fieldBg: "#f0f7ff",
          fieldBorder: "#bfdbfe",
          labelColor: "#475569",
          isDark: false,
        };
      default: // classic — uses user's bgColor and primaryColor fully
        return {
          bg: a.bgColor,
          cardBg: "rgba(255,255,255,0.03)",
          cardBorder: "rgba(255,255,255,0.06)",
          text: "#f8fafc",
          subtext: "#64748b",
          accent: userAccent,
          fieldBg: "rgba(255,255,255,0.03)",
          fieldBorder: "rgba(255,255,255,0.06)",
          labelColor: "rgba(255,255,255,0.4)",
          isDark: true,
        };
    }
  };

  const ts = getTemplateStyles();
  const btnRadius = a.buttonStyle === "pill" ? "9999px" : a.buttonStyle === "square" ? "4px" : "12px";

  // ─── Shared field styles ───
  const fieldStyle = {
    background: ts.fieldBg,
    border: `1px solid ${ts.fieldBorder}`,
    color: ts.text,
  };

  return (
    <div
      className="relative w-full min-h-full transition-all duration-500 ease-in-out overflow-x-hidden"
      style={{
        background: ts.bg,
        fontFamily,
        color: ts.text,
      }}
    >
      {/* Font loader */}
      {a.fontFamily !== "Geist" && FONT_IMPORTS[a.fontFamily] && (
        <link rel="stylesheet" href={FONT_IMPORTS[a.fontFamily]} />
      )}

      {/* Urgency Banner */}
      {t.urgency.enabled && (
        <div
          className={cn(
            "w-full text-center text-[13px] font-black py-3 px-4 z-30 relative",
            templateId === "urgency" ? "animate-pulse" : ""
          )}
          style={{
            background: t.urgency.bgColor,
            color: "#fff",
          }}
        >
          {t.urgency.text.toUpperCase()}
        </div>
      )}

      {/* ─── MOBILE: Single Column Layout ─── */}
      {/* ─── DESKTOP: Two Column Layout ─── */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Mobile: Stack vertically. Desktop: Side by side */}
        <div className={cn("flex flex-col gap-8", !isMobile && "lg:grid lg:grid-cols-12 lg:gap-12")}>
          
          {/* ─── LEFT: Hero Content ─── */}
          <div className={cn("space-y-6 sm:space-y-8", !isMobile && "lg:col-span-7")}>

            {/* Brand & Social Context */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {a.logoUrl && (
                <img src={a.logoUrl} alt="Logo" className="h-8 sm:h-10 object-contain drop-shadow-lg" />
              )}
              {sp.buyerCount.enabled && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md"
                  style={{ background: ts.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)", border: `1px solid ${ts.fieldBorder}` }}
                >
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold text-white"
                        style={{ borderColor: ts.isDark ? "#09090b" : "#fff", background: ts.accent }}>
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold" style={{ color: ts.accent }}>
                    +{sp.buyerCount.count.toLocaleString("pt-BR")} {sp.buyerCount.label}
                  </span>
                </div>
              )}
            </div>

            {/* Banner / Media */}
            <div className="relative w-full">
              {c.videoUrl && getVideoEmbed(c.videoUrl) ? (
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-video shadow-2xl bg-black" style={{ border: `1px solid ${ts.fieldBorder}` }}>
                  <iframe
                    src={getVideoEmbed(c.videoUrl)!}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : (a.bannerUrl || a.bannerExternal) ? (
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl" style={{ border: `1px solid ${ts.fieldBorder}` }}>
                  <img
                    src={a.bannerUrl || a.bannerExternal}
                    alt="Banner"
                    className="w-full object-cover max-h-[320px] sm:max-h-[420px]"
                  />
                </div>
              ) : (
                <div
                  className="w-full aspect-video rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-dashed"
                  style={{ background: ts.fieldBg, borderColor: ts.fieldBorder }}
                >
                  <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: ts.isDark ? "#475569" : "#94a3b8" }} />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-widest" style={{ color: ts.isDark ? "#475569" : "#94a3b8" }}>
                    Preview de Vídeo / Imagem
                  </span>
                </div>
              )}
            </div>

            {/* Headline & Subheadline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight" style={{ color: ts.text }}>
                {c.headline}
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-medium" style={{ color: ts.subtext }}>
                {c.subheadline}
              </p>
              {c.description && (
                <p
                  className="text-[14px] sm:text-[15px] leading-relaxed border-l-2 pl-4 sm:pl-5"
                  style={{ color: ts.subtext, borderColor: ts.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", opacity: 0.8 }}
                >
                  {c.description}
                </p>
              )}
            </div>

            {/* Benefits Grid */}
            {c.benefits.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {c.benefits.map(b => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl transition-all"
                    style={{ background: ts.fieldBg, border: `1px solid ${ts.fieldBorder}` }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: ts.accent }}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: ts.text }}>{b.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Section */}
            {sp.reviews.enabled && sp.reviews.items.length > 0 && (
              <div className="pt-6 sm:pt-8" style={{ borderTop: `1px solid ${ts.fieldBorder}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: ts.subtext, opacity: 0.6 }}>
                    Avaliações
                  </span>
                </div>
                <ReviewCarousel reviews={sp.reviews.items} display={sp.reviews.display} primaryColor={ts.accent} />
              </div>
            )}
          </div>

          {/* ─── RIGHT: Payment Form ─── */}
          <div className={cn("w-full", !isMobile && "lg:col-span-5")}>
            <div
              className={cn(
                "w-full rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl transition-all duration-500",
                !isMobile && "lg:sticky lg:top-8"
              )}
              style={{
                background: ts.cardBg,
                border: `1px solid ${ts.cardBorder}`,
                boxShadow: templateId === "neon" ? `0 0 50px ${ts.accent}20` : undefined,
              }}
            >
              {/* Form Header */}
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black" style={{ color: ts.text }}>
                  {templateId === "urgency" ? "⚡ COMPLETE SEU PEDIDO" : "Dados do Pagamento"}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ts.labelColor }}>
                  Informações Pessoais Seguras
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 sm:space-y-4">
                {/* Standard Fields — always shown */}
                {[
                  { label: "Nome Completo", placeholder: "Seu nome aqui" },
                  { label: "E-mail Principal", placeholder: "seu@email.com" }
                ].map(field => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1" style={{ color: ts.labelColor }}>
                      {field.label}
                    </label>
                    <div
                      className="h-11 sm:h-12 rounded-xl px-4 flex items-center"
                      style={fieldStyle}
                    >
                      <span className="text-sm" style={{ color: ts.isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                        {field.placeholder}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Optional Fields */}
                {Object.entries(f.optionalFields).filter(([, v]) => v).map(([key]) => {
                  const labels: Record<string, string> = {
                    cpf: "CPF / CNPJ", phone: "Telefone / WhatsApp", birthDate: "Nascimento",
                    address: "Endereço", zipCode: "CEP", company: "Empresa"
                  };
                  return (
                    <div key={key} className="space-y-1.5 animate-in fade-in zoom-in-95">
                      <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1" style={{ color: ts.labelColor }}>
                        {labels[key]}
                      </label>
                      <div className="h-11 sm:h-12 rounded-xl px-4 flex items-center" style={fieldStyle}>
                        <span className="text-sm" style={{ color: ts.isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                          Campo configurado
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Fields */}
                {f.customFields.map(field => (
                  <div key={field.id} className="space-y-1.5 animate-in fade-in zoom-in-95">
                    <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1" style={{ color: ts.labelColor }}>
                      {field.label}{field.required ? " *" : ""}
                    </label>
                    <div className="h-11 sm:h-12 rounded-xl px-4 flex items-center" style={fieldStyle}>
                      <span className="text-sm" style={{ color: ts.isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                        {field.placeholder || "Campo customizado"}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Order Bump */}
                {bu.orderBump.enabled && (
                  <div
                    className="p-4 rounded-2xl border-2 border-dashed"
                    style={{ background: `${ts.accent}10`, borderColor: `${ts.accent}30` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1" style={{ borderColor: ts.accent }}>
                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: ts.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black" style={{ color: ts.accent }}>
                          ⚡ {bu.orderBump.presentationText}
                        </p>
                        <h4 className="text-[13px] sm:text-[14px] font-bold mt-1 truncate" style={{ color: ts.text }}>
                          {bu.orderBump.productName}
                        </h4>
                        <p className="text-[13px] font-black mt-1" style={{ color: ts.accent }}>
                          + R$ {bu.orderBump.specialPrice.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="space-y-4">
                <button
                  className="w-full py-4 sm:py-5 text-base sm:text-lg font-black transition-all relative overflow-hidden group"
                  style={{
                    background: ts.accent,
                    color: templateId === "minimalist" || !ts.isDark ? "#fff" : "#fff",
                    borderRadius: btnRadius,
                    boxShadow: `0 16px 32px ${ts.accent}40`,
                  }}
                >
                  <span className="relative z-10 select-none uppercase tracking-widest">
                    {a.buttonText}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>

                {/* Trust Seals */}
                {(t.authority.sealSecure || t.authority.sealSatisfaction || t.authority.sealProtected) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-2">
                    {t.authority.sealSecure && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: ts.subtext, opacity: 0.6 }}>
                        <Lock className="h-3 w-3" style={{ color: ts.accent }} /> Compra Segura
                      </div>
                    )}
                    {t.authority.sealSatisfaction && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: ts.subtext, opacity: 0.6 }}>
                        <BadgeCheck className="h-3 w-3" style={{ color: ts.accent }} /> Garantia
                      </div>
                    )}
                    {t.authority.sealProtected && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: ts.subtext, opacity: 0.6 }}>
                        <Shield className="h-3 w-3" style={{ color: ts.accent }} /> Blindado
                      </div>
                    )}
                  </div>
                )}

                {/* Scarcity — Vacancies */}
                {t.scarcity.vacanciesEnabled && (
                  <div className="text-center">
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">
                      🚨 {t.scarcity.vacanciesText.replace("{n}", String(t.scarcity.vacanciesCount))}
                    </span>
                  </div>
                )}
              </div>

              {/* Guarantee Card */}
              {t.guarantee.enabled && (
                <div
                  className="p-4 sm:p-5 rounded-2xl flex items-start gap-3 sm:gap-4"
                  style={{
                    background: templateId === "urgency" ? "rgba(239,68,68,0.1)" : ts.fieldBg,
                    border: `1px solid ${templateId === "urgency" ? "rgba(239,68,68,0.2)" : ts.fieldBorder}`
                  }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ts.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${ts.fieldBorder}` }}>
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: ts.accent }} />
                  </div>
                  <div>
                    <h5 className="text-[12px] sm:text-[13px] font-black uppercase tracking-tight" style={{ color: ts.accent }}>
                      Garantia de {t.guarantee.days} Dias
                    </h5>
                    <p className="text-[11px] sm:text-[12px] font-bold leading-relaxed mt-1" style={{ color: ts.subtext, opacity: 0.8 }}>
                      {t.guarantee.text}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Logos */}
              {t.authority.showPaymentLogos && (
                <div className="flex items-center justify-center gap-2 sm:gap-4 opacity-40 py-2 flex-wrap">
                  {["Visa", "Mastercard", "Pix", "Elo", "SSL"].map(brand => (
                    <span
                      key={brand}
                      className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded"
                      style={{
                        border: `1px solid ${ts.isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`,
                        color: ts.text
                      }}
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Persistence Triggers */}
      {sp.popup.enabled && <SocialPopup interval={sp.popup.interval} primaryColor={ts.accent} />}
      {t.scarcity.countdownEnabled && <CountdownTimer config={t.scarcity} />}
    </div>
  );
}
