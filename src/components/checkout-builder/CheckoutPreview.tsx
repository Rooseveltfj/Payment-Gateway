"use client";

import { CheckoutConfig } from "@/types/checkout-config";
import { CountdownTimer } from "./preview/CountdownTimer";
import { SocialPopup } from "./preview/SocialPopup";
import { ReviewCarousel } from "./preview/ReviewCarousel";
import { Shield, Lock, BadgeCheck, Users } from "lucide-react";

interface Props {
  config: CheckoutConfig;
}

const FONT_IMPORTS: Record<string, string> = {
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
  Poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
  Montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap",
};

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return null;
}

export function CheckoutPreview({ config }: Props) {
  const { appearance: a, content: c, triggers: t, socialProof: sp, form: f, bumpUpsell: bu } = config;

  const fontFamily = a.fontFamily === "Geist" ? "inherit" : a.fontFamily;
  const isDark = a.themePreset !== "light";

  const textPrimary = isDark ? "#f4f4f5" : "#09090b";
  const textSecondary = isDark ? "#a1a1aa" : "#71717a";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "#d4d4d8";

  const btnRadius = a.buttonStyle === "pill" ? "9999px" : a.buttonStyle === "square" ? "4px" : "8px";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: a.themePreset === "gradient"
          ? `linear-gradient(135deg, #4c1d95, ${a.bgColor})`
          : a.bgColor,
        fontFamily,
        color: textPrimary,
        minHeight: 600,
      }}
    >
      {/* Font loader */}
      {a.fontFamily !== "Geist" && FONT_IMPORTS[a.fontFamily] && (
        // eslint-disable-next-line @next/next/no-head-element
        <link rel="stylesheet" href={FONT_IMPORTS[a.fontFamily]} />
      )}

      {/* Urgency Banner */}
      {t.urgency.enabled && (
        <div
          className="w-full text-center text-sm font-bold py-2 px-4 animate-pulse"
          style={{ background: t.urgency.bgColor, color: "#fff" }}
        >
          {t.urgency.text}
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left Column ── */}
        <div className="space-y-6">
          {/* Logo */}
          {a.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.logoUrl} alt="Logo" className="h-10 object-contain" />
          )}

          {/* Banner / Video */}
          {c.videoUrl && getVideoEmbed(c.videoUrl) ? (
            <div className="relative rounded-xl overflow-hidden aspect-video shadow-lg">
              <iframe
                src={getVideoEmbed(c.videoUrl)!}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          ) : (a.bannerUrl || a.bannerExternal) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.bannerUrl || a.bannerExternal}
              alt="Banner"
              className="w-full rounded-xl object-cover max-h-56 shadow-lg"
            />
          ) : (
            <div className="w-full h-40 rounded-xl flex items-center justify-center"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <span style={{ color: textSecondary }} className="text-sm">Banner / Vídeo do Produto</span>
            </div>
          )}

          {/* Buyer Count */}
          {sp.buyerCount.enabled && (
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: a.primaryColor }}>
              <Users className="h-4 w-4" />
              <span>Mais de <strong>{sp.buyerCount.count.toLocaleString("pt-BR")}</strong> {sp.buyerCount.label}</span>
            </div>
          )}

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight" style={{ color: textPrimary }}>{c.headline}</h1>
            <p className="text-base" style={{ color: textSecondary }}>{c.subheadline}</p>
            {c.description && <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>{c.description}</p>}
          </div>

          {/* Benefits */}
          {c.benefits.length > 0 && (
            <ul className="space-y-2">
              {c.benefits.map(b => (
                <li key={b.id} className="flex items-start gap-2.5 text-sm" style={{ color: textPrimary }}>
                  <span className="mt-0.5 shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: a.primaryColor, color: "#fff" }}>✓</span>
                  {b.text}
                </li>
              ))}
            </ul>
          )}

          {/* Countdown */}
          {t.scarcity.countdownEnabled && (
            <CountdownTimer config={t.scarcity} />
          )}

          {/* Reviews */}
          {sp.reviews.enabled && sp.reviews.items.length > 0 && (
            <ReviewCarousel reviews={sp.reviews.items} display={sp.reviews.display} primaryColor={a.primaryColor} />
          )}
        </div>

        {/* ── Right Column — Checkout Form ── */}
        <div className="space-y-4">
          {/* Card */}
          <div className="rounded-2xl p-6 space-y-4 shadow-xl"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Dados do Comprador</h2>

            {/* Fixed Fields */}
            {["Nome Completo *", "E-mail *"].map(label => (
              <div key={label}>
                <label className="text-xs font-medium mb-1 block" style={{ color: textSecondary }}>{label}</label>
                <input disabled
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, opacity: 0.7 }}
                  placeholder={label.replace(" *", "")}
                />
              </div>
            ))}

            {/* Optional Fields */}
            {Object.entries(f.optionalFields).filter(([, v]) => v).map(([key]) => {
              const labels: Record<string, string> = {
                cpf: "CPF", phone: "Telefone", birthDate: "Nascimento",
                address: "Endereço", zipCode: "CEP", company: "Empresa"
              };
              return (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: textSecondary }}>{labels[key]}</label>
                  <input disabled className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, opacity: 0.7 }}
                    placeholder={labels[key]} />
                </div>
              );
            })}

            {/* Custom Fields */}
            {f.customFields.map(field => (
              <div key={field.id}>
                <label className="text-xs font-medium mb-1 block" style={{ color: textSecondary }}>
                  {field.label}{field.required ? " *" : ""}
                </label>
                <input disabled className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, opacity: 0.7 }}
                  placeholder={field.placeholder || field.label} />
              </div>
            ))}

            {/* Order Bump */}
            {bu.orderBump.enabled && (
              <div className="rounded-xl p-3 space-y-2"
                style={{ background: `${a.primaryColor}15`, border: `2px dashed ${a.primaryColor}50` }}>
                <p className="text-xs font-bold" style={{ color: a.primaryColor }}>⚡ {bu.orderBump.presentationText}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: textPrimary }}>{bu.orderBump.productName}</span>
                  <span className="text-sm font-bold" style={{ color: a.primaryColor }}>
                    + R$ {bu.orderBump.specialPrice.toFixed(2)}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-xs" style={{ color: textSecondary }}>Sim, quero adicionar!</span>
                </label>
              </div>
            )}

            {/* Buy Button */}
            <button
              className="w-full py-4 text-base font-bold transition-opacity hover:opacity-90 active:scale-[0.99]"
              style={{
                background: a.primaryColor,
                color: "#fff",
                borderRadius: btnRadius,
                boxShadow: `0 4px 24px ${a.primaryColor}40`
              }}
            >
              {a.buttonText}
            </button>

            {/* Vacancies */}
            {t.scarcity.vacanciesEnabled && (
              <p className="text-center text-xs font-semibold text-error animate-pulse">
                🔴 {t.scarcity.vacanciesText.replace("{n}", String(t.scarcity.vacanciesCount))}
              </p>
            )}
          </div>

          {/* Authority Seals */}
          {(t.authority.sealSecure || t.authority.sealSatisfaction || t.authority.sealProtected) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {t.authority.sealSecure && (
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: textSecondary }}>
                  <Lock className="h-3.5 w-3.5" style={{ color: a.primaryColor }} /> Compra 100% segura
                </div>
              )}
              {t.authority.sealSatisfaction && (
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: textSecondary }}>
                  <BadgeCheck className="h-3.5 w-3.5" style={{ color: a.primaryColor }} /> Satisfação garantida
                </div>
              )}
              {t.authority.sealProtected && (
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: textSecondary }}>
                  <Shield className="h-3.5 w-3.5" style={{ color: a.primaryColor }} /> Dados protegidos
                </div>
              )}
            </div>
          )}

          {/* Payment Logos */}
          {t.authority.showPaymentLogos && (
            <div className="flex items-center justify-center gap-3 flex-wrap py-2">
              {["Visa", "Mastercard", "Pix", "Elo", "SSL"].map(brand => (
                <span key={brand} className="text-[10px] font-bold px-2 py-1 rounded border"
                  style={{ color: textSecondary, borderColor: cardBorder, background: cardBg }}>
                  {brand}
                </span>
              ))}
            </div>
          )}

          {/* Guarantee */}
          {t.guarantee.enabled && (
            <div className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <Shield className="h-8 w-8 shrink-0 mt-0.5" style={{ color: a.primaryColor }} />
              <div>
                <p className="text-sm font-bold" style={{ color: textPrimary }}>
                  Garantia de {t.guarantee.days} dias
                </p>
                <p className="text-xs mt-1" style={{ color: textSecondary }}>{t.guarantee.text}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social Proof Popup */}
      {sp.popup.enabled && (
        <SocialPopup interval={sp.popup.interval} primaryColor={a.primaryColor} />
      )}
    </div>
  );
}
