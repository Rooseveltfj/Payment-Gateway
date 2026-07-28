"use client";

import { CheckoutConfig } from "@/types/checkout-config";
import { resolveTheme } from "@/types/checkout-theme";
import { isVideoUrl } from "@/lib/checkout-assets";
import { PAYMENTS_ENABLED } from "@/lib/features";
import { CheckoutThemeProvider } from "@/components/checkout-builder/CheckoutThemeProvider";
import { CountdownTimer } from "@/components/checkout-builder/preview/CountdownTimer";
import { SocialPopup } from "@/components/checkout-builder/preview/SocialPopup";
import { ReviewCarousel } from "@/components/checkout-builder/preview/ReviewCarousel";
import { Shield, Lock, BadgeCheck, PlayCircle, Star, CheckCircle2, QrCode, CreditCard, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// CheckoutRenderer — COMPONENTE ÚNICO de render do checkout.
// Usado pelo preview do builder (mode="preview") e pela página pública
// (mode="live"). Mesmo tema, mesmo layout, mesmos breakpoints (via container
// queries) → paridade WYSIWYG. A lógica de pagamento vive na página pública
// e entra aqui pela `form` API; o renderer só desenha.
// ============================================================

export interface CheckoutFormApi {
  values: { buyerName: string; buyerEmail: string; buyerCpf: string; buyerPhone: string; buyerData: Record<string, string> };
  setValue: (patch: Partial<CheckoutFormApi["values"]>) => void;
  setBuyerData: (key: string, value: string) => void;
  paymentMethod: "PIX" | "CREDIT_CARD" | "BOLETO";
  setPaymentMethod: (m: "PIX" | "CREDIT_CARD" | "BOLETO") => void;
  selectedBumps: string[];
  toggleBump: (id: string, on: boolean) => void;
  step: number;
  setStep: (n: number) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  pixData: { qrCode: string; copyPaste: string } | null;
  totalPrice: number;
}

interface Props {
  config: CheckoutConfig;
  /** Produto (nome/preço). O preço alimenta form.totalPrice na página pública. */
  product?: { name: string; price: number };
  mode: "preview" | "live";
  form?: CheckoutFormApi;
  className?: string;
}

const V = {
  bg: "var(--checkout-background)", surface: "var(--checkout-surface)", surfaceEl: "var(--checkout-surface-elevated)",
  text: "var(--checkout-text-primary)", sub: "var(--checkout-text-secondary)",
  accent: "var(--checkout-accent)", accentFg: "var(--checkout-accent-foreground)",
  border: "var(--checkout-border)", badgeBg: "var(--checkout-badge-background)", badgeFg: "var(--checkout-badge-foreground)",
  inputBg: "var(--checkout-input-background)", inputBorder: "var(--checkout-input-border)", inputText: "var(--checkout-input-text)", inputPh: "var(--checkout-input-placeholder)",
  fontHeading: "var(--checkout-font-heading)", fontBody: "var(--checkout-font-body)", fontMono: "var(--checkout-font-mono)",
  hWeight: "var(--checkout-heading-weight)", hScale: "var(--checkout-heading-scale)", tracking: "var(--checkout-letter-spacing)",
  rCard: "var(--checkout-radius-card)", rInput: "var(--checkout-radius-input)", shadowCard: "var(--checkout-shadow-card)", gap: "var(--checkout-gap)",
};

function getVideoEmbed(url: string): string | null {
  if (!url) return null;
  // YouTube: watch?v= / youtu.be/ / shorts/ / embed/ / live/ (com ou sem www, -nocookie, m.)
  const yt = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0&controls=1&rel=0`;
  // Vimeo: vimeo.com/123 ou vimeo.com/video/123
  const vi = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return null;
}

const money = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

// Campo em MÓDULO (identidade estável) — se ficar dentro do render, o React
// remonta o <input> a cada tecla e perde o foco (bug do mobile). Mesmo visual
// em preview (placeholder) e live (input controlado).
function CheckoutField({ live, labelStyle, fieldStyle, inputPh, label, ph, value, onChange, type = "text", required }: {
  live: boolean; labelStyle: React.CSSProperties; fieldStyle: React.CSSProperties; inputPh: string;
  label: string; ph?: string; value?: string; onChange?: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] @md:text-[11px] uppercase ml-0.5" style={labelStyle}>{label}{required ? " *" : ""}</label>
      {live ? (
        <input
          type={type} required={required} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} placeholder={ph}
          className="w-full h-11 @md:h-12 px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--checkout-accent)] transition"
          style={fieldStyle}
        />
      ) : (
        <div className="h-11 @md:h-12 px-4 flex items-center" style={fieldStyle}><span className="text-sm" style={{ color: inputPh }}>{ph}</span></div>
      )}
    </div>
  );
}

export function CheckoutRenderer({ config, mode, form, className }: Props) {
  const { appearance: a, content: c, triggers: t, socialProof: sp, form: f, bumpUpsell: bu } = config;
  const theme = resolveTheme(a);
  const live = mode === "live" && !!form;

  const isLongForm = a.layoutType === "longform";
  const isMultiStep = a.layoutType === "multistep";
  const framed = theme.layout.previewStyle === "framed";
  const badge = theme.layout.badgeStyle;
  const step = live ? form!.step : 1;
  const showFields = !isMultiStep || step === 1;
  const showPayment = !isMultiStep || step === 2;

  const headingStyle: React.CSSProperties = {
    fontFamily: V.fontHeading, fontWeight: V.hWeight as unknown as number, letterSpacing: V.tracking, color: V.text,
    textTransform: theme.id === "urgency" ? "uppercase" : "none",
  };
  const heroSize: React.CSSProperties = { fontSize: `calc(clamp(1.875rem, 6cqw, 3rem) * ${V.hScale})`, lineHeight: 1.1 };
  const labelStyle: React.CSSProperties = { fontFamily: theme.typography.fontMono ? V.fontMono : V.fontBody, color: V.inputPh, letterSpacing: "0.12em" };
  const fieldStyle: React.CSSProperties = { background: V.inputBg, border: `var(--checkout-border-width) solid ${V.inputBorder}`, color: V.inputText, borderRadius: V.rInput };
  const cardStyle: React.CSSProperties = {
    background: V.surface, border: `var(--checkout-border-width) solid ${V.border}`, borderRadius: V.rCard, boxShadow: V.shadowCard,
    backdropFilter: theme.id === "gradient" ? "blur(16px)" : undefined, WebkitBackdropFilter: theme.id === "gradient" ? "blur(16px)" : undefined,
  };
  const btnClass = cn("ck-btn w-full py-4 @md:py-5 text-base @md:text-lg relative overflow-hidden group",
    theme.effects.ctaGlow && "ck-btn--glow", theme.id === "urgency" && "ck-btn--pulse");

  const badgeShell = (children: React.ReactNode) => {
    if (badge === "flat") return <div className="flex items-center gap-2" style={{ color: V.badgeFg, fontFamily: V.fontMono }}>{children}</div>;
    if (badge === "outline") return <div className="flex items-center gap-2 px-3 py-1.5 @md:px-4 @md:py-2" style={{ border: `1px solid ${V.accent}`, borderRadius: V.rInput, color: V.badgeFg }}>{children}</div>;
    return <div className="flex items-center gap-2 px-3 py-1.5 @md:px-4 @md:py-2 rounded-full backdrop-blur-md" style={{ background: V.badgeBg, border: `1px solid ${V.border}` }}>{children}</div>;
  };

  // Props comuns do campo (o componente é estável em módulo — ver CheckoutField)
  const fieldCtx = { live, labelStyle, fieldStyle, inputPh: V.inputPh };

  const bannerSrc = a.bannerUrl || a.bannerExternal;

  return (
    <CheckoutThemeProvider theme={theme} className={cn("@container/checkout relative w-full min-h-full overflow-x-hidden transition-colors duration-500", className)}>
      {/* Urgency banner (par accent/accentForeground — AA garantido) */}
      {t.urgency.enabled && (
        <div className={cn("relative z-30 w-full text-center text-[13px] py-3 px-4", theme.id === "urgency" && "animate-pulse")}
          style={{ background: V.accent, color: V.accentFg, fontFamily: V.fontHeading, fontWeight: 800, letterSpacing: "0.06em", textTransform: theme.id === "urgency" ? "uppercase" : "none" }}>
          {t.urgency.text}
        </div>
      )}

      <div className={cn("relative w-full mx-auto px-4 @md:px-6 py-8 @md:py-12", isLongForm ? "max-w-3xl" : "max-w-6xl")}>
        <div className={cn("flex flex-col", !isLongForm && "@3xl:grid @3xl:grid-cols-12 @3xl:gap-12")} style={{ gap: V.gap }}>

          {/* HERO */}
          <div className={cn(!isLongForm && "@3xl:col-span-7")} style={{ display: "flex", flexDirection: "column", gap: V.gap }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              {a.logoUrl && <img src={a.logoUrl} alt="Logo" className="h-8 @md:h-10 object-contain" />}
              {sp.buyerCount.enabled && badgeShell(
                <>
                  {badge === "pill" && (
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold" style={{ borderColor: V.bg, background: V.accent, color: V.accentFg }}>{String.fromCharCode(64 + i)}</div>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] @md:text-[11px] font-bold" style={{ color: V.badgeFg }}>+{sp.buyerCount.count.toLocaleString("pt-BR")} {sp.buyerCount.label}</span>
                </>
              )}
            </div>

            {/* Media: vídeo VSL > banner (imagem/vídeo) > placeholder */}
            <div className="relative w-full">
              {c.videoUrl && getVideoEmbed(c.videoUrl) ? (
                <div className="relative overflow-hidden aspect-video" style={{ borderRadius: framed ? V.rCard : 0, border: framed ? `1px solid ${V.border}` : "none", background: V.surfaceEl }}>
                  <iframe src={getVideoEmbed(c.videoUrl)!} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                </div>
              ) : bannerSrc ? (
                <div className="relative overflow-hidden" style={{ borderRadius: framed ? V.rCard : 0, border: framed ? `1px solid ${V.border}` : "none", boxShadow: framed ? V.shadowCard : "none" }}>
                  {isVideoUrl(bannerSrc)
                    ? <video src={bannerSrc} className="w-full object-cover max-h-[320px] @md:max-h-[420px]" muted loop playsInline autoPlay />
                    : <img src={bannerSrc} alt="Banner" className="w-full object-cover max-h-[320px] @md:max-h-[420px]" />}
                </div>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 border-2 border-dashed" style={{ background: V.inputBg, borderColor: V.inputBorder, borderRadius: framed ? V.rCard : 0 }}>
                  <PlayCircle className="h-10 w-10 @md:h-12 @md:w-12" style={{ color: V.inputPh }} />
                  <span className="text-xs @md:text-sm uppercase tracking-widest" style={{ color: V.inputPh, fontFamily: V.fontMono }}>Preview de Vídeo / Imagem</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h1 style={{ ...headingStyle, ...heroSize }}>{c.headline}</h1>
              <p className="text-base @md:text-lg @3xl:text-xl" style={{ color: V.sub, fontFamily: V.fontBody }}>{c.subheadline}</p>
              {c.description && <p className="text-[14px] @md:text-[15px] leading-relaxed border-l-2 pl-4" style={{ color: V.sub, borderColor: V.accent, opacity: 0.9 }}>{c.description}</p>}
            </div>

            {c.benefits.length > 0 && (
              <div className="grid grid-cols-1 @md:grid-cols-2 gap-3">
                {c.benefits.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 @md:p-4" style={{ background: V.inputBg, border: `1px solid ${V.inputBorder}`, borderRadius: V.rInput }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: V.accent }}><CheckCircle2 className="h-3.5 w-3.5" style={{ color: V.accentFg }} /></div>
                    <span className="text-[13px] font-semibold" style={{ color: V.text }}>{b.text}</span>
                  </div>
                ))}
              </div>
            )}

            {sp.reviews.enabled && sp.reviews.items.length > 0 && (
              <div className="pt-6 @md:pt-8" style={{ borderTop: `1px solid ${V.border}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4" style={{ fill: V.accent, color: V.accent }} />)}</div>
                  <span className="text-sm uppercase tracking-widest" style={{ color: V.sub, opacity: 0.7, fontFamily: V.fontMono }}>Avaliações</span>
                </div>
                <ReviewCarousel reviews={sp.reviews.items} display={sp.reviews.display} />
              </div>
            )}
          </div>

          {/* FORM */}
          <div className={cn("w-full", !isLongForm && "@3xl:col-span-5")}>
            {isMultiStep && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: V.border }}>
                  <div className="h-full transition-all duration-500" style={{ background: V.accent, width: step === 1 ? "50%" : "100%" }} />
                </div>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: V.sub, fontFamily: V.fontMono }}>Etapa {step} de 2</span>
              </div>
            )}

            <form
              onSubmit={(e) => { if (!live) { e.preventDefault(); return; } if (isMultiStep && step === 1) { e.preventDefault(); form!.setStep(2); } else { form!.onSubmit(e); } }}
              className={cn("w-full p-5 @md:p-8", !isLongForm && "@3xl:sticky @3xl:top-8")}
              style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: V.gap }}
            >
              {live && form!.pixData ? (
                // ── Tela PIX (live) ──
                <div className="space-y-4 text-center">
                  <h2 className="text-lg @md:text-xl" style={headingStyle}>Escaneie para pagar</h2>
                  {form!.pixData.qrCode && <img src={form!.pixData.qrCode} alt="QR Code PIX" className="mx-auto w-52 h-52 rounded-xl bg-white p-2" />}
                  <div className="p-3 rounded-xl break-all text-[11px]" style={{ background: V.inputBg, border: `1px solid ${V.inputBorder}`, color: V.sub }}>{form!.pixData.copyPaste}</div>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(form!.pixData!.copyPaste)} className={btnClass} style={{ borderRadius: V.rInput, fontFamily: V.fontBody, fontWeight: 800 }}>
                    <span className="relative z-10 uppercase tracking-widest text-[15px]">Copiar código PIX</span>
                  </button>
                  <p className="text-xs opacity-60 flex items-center justify-center gap-2" style={{ color: V.sub }}><Loader2 className="h-3 w-3 animate-spin" /> Aguardando pagamento…</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h2 className="text-lg @md:text-xl" style={headingStyle}>{isMultiStep && step === 1 ? "Identificação" : theme.id === "urgency" ? "COMPLETE SEU PEDIDO" : "Dados do Pagamento"}</h2>
                    <p className="text-xs uppercase" style={labelStyle}>{isMultiStep && step === 1 ? "Etapa 1 · Dados Básicos" : "Informações Pessoais Seguras"}</p>
                  </div>

                  {showFields && (
                    <div className="space-y-3 @md:space-y-4">
                      <CheckoutField {...fieldCtx} label="Nome Completo" ph="Seu nome aqui" required value={form?.values.buyerName} onChange={(v) => form?.setValue({ buyerName: v })} />
                      <CheckoutField {...fieldCtx} label="E-mail Principal" ph="seu@email.com" type="email" required value={form?.values.buyerEmail} onChange={(v) => form?.setValue({ buyerEmail: v })} />
                      {f.optionalFields.cpf && <CheckoutField {...fieldCtx} label="CPF / CNPJ" ph="000.000.000-00" required value={form?.values.buyerCpf} onChange={(v) => form?.setValue({ buyerCpf: v })} />}
                      {f.optionalFields.phone && <CheckoutField {...fieldCtx} label="Telefone / WhatsApp" ph="(00) 00000-0000" type="tel" required value={form?.values.buyerPhone} onChange={(v) => form?.setValue({ buyerPhone: v })} />}
                      {f.optionalFields.birthDate && <CheckoutField {...fieldCtx} label="Nascimento" type="date" required value={form?.values.buyerData.birthDate} onChange={(v) => form?.setBuyerData("birthDate", v)} />}
                      {f.optionalFields.address && <CheckoutField {...fieldCtx} label="Endereço" ph="Rua, número, bairro" required value={form?.values.buyerData.address} onChange={(v) => form?.setBuyerData("address", v)} />}
                      {f.optionalFields.zipCode && <CheckoutField {...fieldCtx} label="CEP" ph="00000-000" required value={form?.values.buyerData.zipCode} onChange={(v) => form?.setBuyerData("zipCode", v)} />}
                      {f.optionalFields.company && <CheckoutField {...fieldCtx} label="Empresa" ph="Sua empresa" required value={form?.values.buyerData.company} onChange={(v) => form?.setBuyerData("company", v)} />}
                      {f.customFields.map(cf => (
                        <CheckoutField {...fieldCtx} key={cf.id} label={cf.label} ph={cf.placeholder} required={cf.required} value={form?.values.buyerData[cf.id]} onChange={(v) => form?.setBuyerData(cf.id, v)} />
                      ))}
                    </div>
                  )}

                  {showPayment && PAYMENTS_ENABLED && (
                    <div className="space-y-4">
                      {bu.orderBumps?.filter(b => b.enabled).map(bump => {
                        const on = live ? form!.selectedBumps.includes(bump.id) : false;
                        return (
                          <div key={bump.id} className="p-4 border-2 border-dashed relative overflow-hidden" style={{ background: on ? V.badgeBg : V.inputBg, borderColor: on ? V.accent : V.inputBorder, borderRadius: V.rInput }}>
                            <div className="absolute top-0 right-0 text-[8px] font-black uppercase px-2 py-0.5" style={{ background: V.accent, color: V.accentFg, borderBottomLeftRadius: V.rInput }}>Oferta Única</div>
                            <label className={cn("flex items-start gap-3 mt-2", live && "cursor-pointer")}>
                              {live && <input type="checkbox" checked={on} onChange={(e) => form!.toggleBump(bump.id, e.target.checked)} className="mt-1 h-5 w-5 shrink-0" style={{ accentColor: "var(--checkout-accent)" }} />}
                              {!live && (bump.imageUrl
                                ? <img src={bump.imageUrl} alt="Bump" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                                : <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1" style={{ borderColor: V.accent }}><CheckCircle2 className="h-3.5 w-3.5" style={{ color: V.accent }} /></div>)}
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-black" style={{ color: V.accent }}>⚡ {bump.presentationText}</p>
                                <h4 className="text-[13px] @md:text-[14px] font-bold mt-1 leading-tight" style={{ color: V.text }}>{bump.productName}</h4>
                                <p className="text-[13px] font-black mt-1" style={{ color: V.text }}>Por Apenas: <span style={{ color: V.accent }}>{money(bump.specialPrice)}</span></p>
                              </div>
                            </label>
                          </div>
                        );
                      })}

                      {/* Métodos de pagamento */}
                      <div className="space-y-2">
                        <label className="block text-[10px] @md:text-[11px] uppercase ml-0.5" style={labelStyle}>Forma de Pagamento</label>
                        <div className="grid grid-cols-3 gap-2">
                          {([["PIX", QrCode], ["CREDIT_CARD", CreditCard], ["BOLETO", FileText]] as const).map(([m, Icon]) => {
                            const active = live ? form!.paymentMethod === m : m === "PIX";
                            return (
                              <button key={m} type="button" onClick={() => live && form!.setPaymentMethod(m)}
                                className="flex flex-col items-center justify-center gap-2 h-16 rounded-xl border transition-all"
                                style={{ borderColor: active ? V.accent : V.inputBorder, background: active ? V.badgeBg : V.inputBg, color: active ? V.accent : V.sub, borderRadius: V.rInput }}>
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold">{m === "CREDIT_CARD" ? "CARTÃO" : m}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA — ou aviso "em breve" quando pagamentos estão desativados */}
                  {PAYMENTS_ENABLED ? (
                    <button type={live ? "submit" : "button"} disabled={live && form!.loading} className={btnClass}
                      style={{ borderRadius: V.rInput, fontFamily: V.fontBody, fontWeight: 800 }}>
                      <span className="relative z-10 select-none uppercase tracking-widest text-[15px] flex items-center justify-center gap-2">
                        {live && form!.loading ? <Loader2 className="h-5 w-5 animate-spin" />
                          : isMultiStep && step === 1 ? "Ir para pagamento →"
                          : live ? `Pagar ${money(form!.totalPrice)}`
                          : a.buttonText}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full py-5 px-4 text-center" style={{ background: V.badgeBg, border: `1px dashed ${V.border}`, borderRadius: V.rInput }}>
                      <p className="text-[13px] font-black uppercase tracking-widest" style={{ color: V.accent }}>Pagamentos em breve</p>
                      <p className="text-[12px] mt-1" style={{ color: V.sub }}>Estamos finalizando a integração de pagamento. Volte em breve para concluir sua compra.</p>
                    </div>
                  )}

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

                  {t.guarantee.enabled && (
                    <div className="p-4 @md:p-5 flex items-start gap-3 @md:gap-4" style={{ background: V.badgeBg, border: `1px solid ${V.border}`, borderRadius: V.rInput }}>
                      <div className="w-10 h-10 @md:w-12 @md:h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: V.surfaceEl, border: `1px solid ${V.border}` }}><Shield className="h-5 w-5 @md:h-6 @md:w-6" style={{ color: V.accent }} /></div>
                      <div>
                        <h5 className="text-[12px] @md:text-[13px] uppercase font-bold" style={{ color: V.accent, fontFamily: V.fontHeading }}>Garantia de {t.guarantee.days} Dias</h5>
                        <p className="text-[11px] @md:text-[12px] leading-relaxed mt-1" style={{ color: V.sub }}>{t.guarantee.text}</p>
                      </div>
                    </div>
                  )}

                  {t.authority.showPaymentLogos && (
                    <div className="flex items-center justify-center gap-2 @md:gap-4 opacity-50 py-2 flex-wrap">
                      {["Visa", "Mastercard", "Pix", "Elo", "SSL"].map(brand => <span key={brand} className="text-[8px] @md:text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded" style={{ border: `1px solid ${V.inputBorder}`, color: V.text }}>{brand}</span>)}
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {sp.popup.enabled && <SocialPopup interval={sp.popup.interval} />}
      {t.scarcity.countdownEnabled && <CountdownTimer config={t.scarcity} />}
    </CheckoutThemeProvider>
  );
}
