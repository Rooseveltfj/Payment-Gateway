"use client";

import { useState, useEffect } from "react";
import { CheckoutConfig } from "@/types/checkout-config";
import { resolveTheme, ctaVariant } from "@/types/checkout-theme";
import { isVideoUrl } from "@/lib/checkout-assets";
import { CheckoutThemeProvider } from "@/components/checkout-builder/CheckoutThemeProvider";
import { CountdownTimer } from "@/components/checkout-builder/preview/CountdownTimer";
import { SocialPopup } from "@/components/checkout-builder/preview/SocialPopup";
import { ReviewCarousel } from "@/components/checkout-builder/preview/ReviewCarousel";
import { CreditCard, QrCode, FileText, Loader2, CheckCircle2, Shield, Lock, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand-colors";

interface Props {
  product: {
    id: string;
    slug: string;
    price: number;
    name: string;
  };
  config: CheckoutConfig | null;
}

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return null;
}

// Classe do CTA — a variante vem do data-cta do provider; aqui só glow/pulse.
function _cnBtn(theme: ReturnType<typeof resolveTheme>): string {
  return [
    "ck-btn",
    theme.effects.ctaGlow ? "ck-btn--glow" : "",
    theme.id === "urgency" ? "ck-btn--pulse" : "",
  ].filter(Boolean).join(" ");
}

export function CheckoutClient({ product, config }: Props) {
  const router = useRouter();

  // 1. Hooks (Must be top level)
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD" | "BOLETO">("PIX");
  const [formData, setFormData] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerCpf: "",
    buyerPhone: "",
    buyerData: {} as Record<string, string>
  });
  const [loading, setLoading] = useState(false);
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [pixData, setPixData] = useState<{ qrCode: string; copyPaste: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Back Redirect Hook
  useEffect(() => {
    if (!config?.redirects?.backRedirectUrl) return;
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.location.href = config.redirects.backRedirectUrl;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [config]);

  // Polling para PIX
  useEffect(() => {
    if (!orderId || paymentMethod !== "PIX" || !pixData) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/orders/${orderId}/status`);
        const data = await res.json();
        if (data.status === "PAID") {
          if (config?.redirects?.thankYouPageUrl) {
            window.location.href = `${config.redirects.thankYouPageUrl}?order=${orderId}`;
          } else {
            router.push(`/obrigado/${orderId}`);
          }
        }
      } catch { }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, pixData, paymentMethod, router]);

  // 2. Guard
  if (!config) return <div className="p-10 text-center text-zinc-500">Checkout não configurado</div>;

  // 3. Destructuring
  const { appearance: a, content: c, triggers: t, socialProof: sp, form: f, bumpUpsell: bu } = config;

  // Tema resolvido pela MESMA função do preview do builder (fonte única).
  const theme = resolveTheme(a);
  const templateId = theme.id;
  const headingFont = "var(--checkout-font-heading)";

  // Tudo consumido via var(--checkout-*) emitidas pelo CheckoutThemeProvider.
  const ts = {
    bg: "var(--checkout-background)",
    cardBg: "var(--checkout-surface)",
    cardBorder: "var(--checkout-border)",
    text: "var(--checkout-text-primary)",
    subtext: "var(--checkout-text-secondary)",
    accent: "var(--checkout-accent)",
    buttonText: "var(--checkout-cta-foreground)",
    fieldBg: "var(--checkout-input-background)",
    fieldBorder: "var(--checkout-input-border)",
    labelColor: "var(--checkout-input-placeholder)",
    surfaceEl: "var(--checkout-surface-elevated)",
    badgeBg: "var(--checkout-badge-background)",
  };

  // buttonStyle do usuário só ajusta o raio; variante/cor vêm do tema (data-cta).
  const btnRadius = a.buttonStyle === "pill" ? "9999px" : a.buttonStyle === "square" ? "4px" : "var(--checkout-radius-cta)";
  const ctaClass = _cnBtn(theme);
  const isLongForm = a.layoutType === "longform";
  const isMultiStep = a.layoutType === "multistep";

  const totalBumpsPrice = selectedBumps.reduce((acc, bumpId) => {
    const b = bu.orderBumps?.find(ob => ob.id === bumpId);
    return acc + (b?.specialPrice || 0);
  }, 0);
  const totalPrice = product.price + totalBumpsPrice;

  const fieldStyle = {
    background: ts.fieldBg,
    border: `1px solid ${ts.fieldBorder}`,
    color: "var(--checkout-input-text)",
    borderRadius: "var(--checkout-radius-input)",
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === "PIX") {
        const res = await fetch(`/api/checkout/${product.slug}/pix`, {
          method: "POST",
          body: JSON.stringify({ ...formData, selectedBumps })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setOrderId(data.orderId);
        setPixData({ qrCode: data.qrCodeImage, copyPaste: data.brCode });
      } else {
        const res = await fetch(`/api/checkout/${product.slug}/create-order`, {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            productId: product.id,
            paymentMethod,
            selectedBumps
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setOrderId(data.orderId);
        if (config.redirects?.thankYouPageUrl) {
          window.location.href = `${config.redirects.thankYouPageUrl}?order=${data.orderId}`;
        } else {
          router.push(`/obrigado/${data.orderId}`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar pedido";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutThemeProvider theme={theme} applyBackground className="min-h-screen relative">
      {/* Urgency Banner — usa o par accent/accentForeground (AA garantido) */}
      {t.urgency.enabled && (
        <div
          className="sticky top-0 z-50 w-full text-center text-sm font-bold py-2 px-4 shadow-md overflow-hidden"
          style={{ background: ts.accent, color: "var(--checkout-accent-foreground)", fontFamily: headingFont, textTransform: theme.typography.ctaTextTransform }}
        >
          <div className={theme.id === "urgency" ? "animate-pulse" : ""}>{t.urgency.text}</div>
        </div>
      )}

      {/* Main Container */}
      <div className={cn("w-full mx-auto px-4 sm:px-6 py-8 sm:py-12", isLongForm ? "max-w-3xl" : "max-w-6xl")}>
        
        <div className={cn("flex flex-col gap-8", !isLongForm && "lg:grid lg:grid-cols-12 lg:gap-12")}>
          
          {/* Left Column Content */}
          <div className={cn("space-y-6 sm:space-y-8", !isLongForm && "lg:col-span-7")}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              {a.logoUrl && (
                <img src={a.logoUrl} alt="Logo" className="h-8 sm:h-10 object-contain drop-shadow-lg" />
              )}
              {sp.buyerCount?.enabled && (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md"
                  style={{ background: ts.badgeBg, border: `1px solid ${ts.cardBorder}` }}
                >
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold text-white"
                        style={{ borderColor: ts.bg, background: ts.accent, color: "var(--checkout-accent-foreground)" }}>
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: ts.accent }}>
                    +{sp.buyerCount.count.toLocaleString("pt-BR")} {sp.buyerCount.label}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="leading-tight" style={{ color: ts.text, fontFamily: headingFont, fontWeight: "var(--checkout-heading-weight)" as unknown as number, letterSpacing: "var(--checkout-letter-spacing)", fontSize: "calc(clamp(1.875rem, 4.5vw, 3rem) * var(--checkout-heading-scale))", textTransform: theme.id === "urgency" ? "uppercase" : "none" }}>
                {c.headline}
              </h1>
              <p className="text-xl" style={{ color: ts.subtext }}>
                {c.subheadline}
              </p>
            </div>

            {/* Video or Banner */}
            {c.videoUrl && getVideoEmbed(c.videoUrl) ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl ring-1 ring-white/10">
                <iframe
                  src={getVideoEmbed(c.videoUrl)!}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Vídeo de Apresentação"
                />
              </div>
            ) : (a.bannerUrl || a.bannerExternal) && (
              isVideoUrl(a.bannerUrl || a.bannerExternal) ? (
                <video
                  src={a.bannerUrl || a.bannerExternal}
                  className="w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
                  muted loop playsInline autoPlay
                />
              ) : (
                <img
                  src={a.bannerUrl || a.bannerExternal}
                  alt="Banner do Produto"
                  className="w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
                />
              )
            )}

            {/* Scarcity Countdown */}
            {t.scarcity.countdownEnabled && (
              <CountdownTimer config={t.scarcity} />
            )}

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-widest opacity-50">O que você vai receber:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {c.benefits.map(b => (
                  <li key={b.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: ts.fieldBg, border: `1px solid ${ts.fieldBorder}` }}>
                    <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: ts.accent }}>
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold" style={{ color: ts.text }}>{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            {sp.reviews.enabled && sp.reviews.items.length > 0 && (
              <div className="py-8 border-t border-white/5">
                 <ReviewCarousel reviews={sp.reviews.items} display={sp.reviews.display} />
              </div>
            )}

            {/* Guarantee */}
            {t.guarantee.enabled && (
               <div className="flex items-center gap-6 p-6 rounded-2xl" style={{ background: ts.cardBg, border: `1px solid ${ts.cardBorder}` }}>
                 <img src="https://cdn-icons-png.flaticon.com/512/755/755191.png" className="h-20 w-20 grayscale brightness-150 opacity-50" alt="Garantia" />
                 <div>
                    <h4 className="text-xl font-bold" style={{ color: ts.text }}>Garantia Incondicional de {t.guarantee.days} Dias</h4>
                    <p className="text-sm mt-1" style={{ color: ts.subtext }}>{t.guarantee.text}</p>
                 </div>
               </div>
            )}
          </div>

          {/* Right Column Form */}
          <div className={cn("w-full", !isLongForm && "lg:col-span-5")}>
            <div className={cn(!isLongForm && "lg:sticky lg:top-8")}>
              
              {isMultiStep && !pixData && (
                <div className="flex items-center gap-2 mb-6">
                   <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: ts.cardBorder }}>
                     <div className="h-full transition-all duration-500" style={{ background: ts.accent, width: step === 1 ? '50%' : '100%' }} />
                   </div>
                   <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">Etapa {step} de 2</span>
                </div>
              )}

              <form onSubmit={(e) => {
                if (isMultiStep && step === 1) {
                   e.preventDefault();
                   setStep(2);
                } else {
                   handleCreateOrder(e);
                }
              }} className="p-5 sm:p-8 space-y-6 transition-all duration-500" style={{ background: ts.cardBg, border: `1px solid ${ts.cardBorder}`, borderRadius: "var(--checkout-radius-card)", boxShadow: "var(--checkout-shadow-card)", backdropFilter: templateId === "gradient" ? "blur(16px)" : undefined }}>
                
                {!pixData ? (
                  <>
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black" style={{ color: ts.text }}>
                        {isMultiStep && step === 1 ? "Identificação" : templateId === "urgency" ? "⚡ COMPLETE SEU PEDIDO" : "Dados do Pagamento"}
                      </h2>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ts.labelColor }}>
                        {isMultiStep && step === 1 ? "Etapa 1 - Dados Básicos" : "Informações Pessoais Seguras"}
                      </p>
                    </div>

                    {/* Form Fields - Step 1 */}
                    {(!isMultiStep || step === 1) && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">Nome Completo</label>
                          <input 
                            required 
                            value={formData.buyerName}
                            onChange={e => setFormData({...formData, buyerName: e.target.value})}
                            style={fieldStyle}
                            className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                            placeholder="Seu nome"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">E-mail</label>
                          <input 
                            required 
                            type="email"
                            value={formData.buyerEmail}
                            onChange={e => setFormData({...formData, buyerEmail: e.target.value})}
                            style={fieldStyle}
                            className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                            placeholder="seu@email.com"
                          />
                        </div>
                        {f.optionalFields.cpf && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">CPF / CNPJ</label>
                            <input 
                              required 
                              value={formData.buyerCpf}
                              onChange={e => setFormData({...formData, buyerCpf: e.target.value})}
                              style={fieldStyle}
                              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                              placeholder="000.000.000-00"
                            />
                          </div>
                        )}
                        {f.optionalFields.phone && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">Telefone / WhatsApp</label>
                            <input 
                              required 
                              type="tel"
                              value={formData.buyerPhone}
                              onChange={e => setFormData({...formData, buyerPhone: e.target.value})}
                              style={fieldStyle}
                              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                        )}
                        {f.optionalFields.birthDate && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">Data de Nascimento</label>
                            <input 
                              required 
                              type="date"
                              value={formData.buyerData.birthDate || ''}
                              onChange={e => setFormData({...formData, buyerData: { ...formData.buyerData, birthDate: e.target.value }})}
                              style={fieldStyle}
                              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                            />
                          </div>
                        )}
                        {f.optionalFields.address && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">Endereço Completo</label>
                            <input 
                              required 
                              value={formData.buyerData.address || ''}
                              onChange={e => setFormData({...formData, buyerData: { ...formData.buyerData, address: e.target.value }})}
                              style={fieldStyle}
                              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                              placeholder="Rua, Número, Bairro"
                            />
                          </div>
                        )}
                        {f.optionalFields.zipCode && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">CEP</label>
                            <input 
                              required 
                              value={formData.buyerData.zipCode || ''}
                              onChange={e => setFormData({...formData, buyerData: { ...formData.buyerData, zipCode: e.target.value }})}
                              style={fieldStyle}
                              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                              placeholder="00000-000"
                            />
                          </div>
                        )}
                        {f.optionalFields.company && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">Nome da Empresa</label>
                            <input 
                              required 
                              value={formData.buyerData.company || ''}
                              onChange={e => setFormData({...formData, buyerData: { ...formData.buyerData, company: e.target.value }})}
                              style={fieldStyle}
                              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                              placeholder="Sua Empresa"
                            />
                          </div>
                        )}

                        {f.customFields?.map(field => (
                          <div key={field.id}>
                            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">{field.label}</label>
                            <input 
                              required={field.required}
                              value={formData.buyerData[field.id] || ''}
                              onChange={e => setFormData({...formData, buyerData: { ...formData.buyerData, [field.id]: e.target.value }})}
                              style={fieldStyle}
                              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-500" 
                              placeholder={field.placeholder || "..."}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form Fields - Step 2 */}
                    {(!isMultiStep || step === 2) && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {isMultiStep && (
                           <button type="button" onClick={() => setStep(1)} className="text-xs font-bold uppercase opacity-60 hover:opacity-100 flex items-center gap-1 mb-4" style={{ color: ts.text }}>
                              &larr; Voltar
                           </button>
                        )}
                        
                        {/* Order Bumps */}
                        {bu.orderBumps?.filter(b => b.enabled).map(bump => (
                          <div key={bump.id} className="p-4 rounded-xl border-2 border-dashed flex items-start gap-3 transition-colors relative overflow-hidden" 
                               style={{ 
                                 borderColor: selectedBumps.includes(bump.id) ? ts.accent : ts.fieldBorder,
                                 background: selectedBumps.includes(bump.id) ? ts.badgeBg : ts.fieldBg
                               }}>
                             <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                               Oferta Única
                             </div>
                             <div className="flex-1 min-w-0 pr-8">
                               <div className="flex items-center gap-2 mb-1">
                                 <span className="text-[11px] font-black" style={{ color: ts.accent }}>⚡ {bump.presentationText}</span>
                               </div>
                               <p className="text-[13px] font-bold mt-1 leading-tight" style={{ color: ts.text }}>{bump.productName}</p>
                               <p className="text-[12px] font-black mt-1" style={{ color: ts.accent }}>
                                 + R$ {bump.specialPrice.toFixed(2).replace(".", ",")}
                               </p>
                             </div>
                             <label className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 checked={selectedBumps.includes(bump.id)}
                                 onChange={e => {
                                   if (e.target.checked) setSelectedBumps(p => [...p, bump.id]);
                                   else setSelectedBumps(p => p.filter(id => id !== bump.id));
                                 }}
                                 className="h-6 w-6 rounded border-white/20 bg-transparent focus:ring-0" 
                                 style={{ color: ts.accent }}
                               />
                             </label>
                          </div>
                        ))}

                        {/* Payment Tabs */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">Selecione o Pagamento</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button 
                              type="button"
                              onClick={() => setPaymentMethod("PIX")}
                              className={cn("flex flex-col items-center justify-center gap-2 h-16 rounded-xl border transition-all", paymentMethod === "PIX" ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/5 opacity-60 hover:opacity-100")}
                            >
                              <QrCode className="h-5 w-5" />
                              <span className="text-[10px] font-bold">PIX</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => setPaymentMethod("CREDIT_CARD")}
                              className={cn("flex flex-col items-center justify-center gap-2 h-16 rounded-xl border transition-all", paymentMethod === "CREDIT_CARD" ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/5 opacity-60 hover:opacity-100")}
                            >
                              <CreditCard className="h-5 w-5" />
                              <span className="text-[10px] font-bold">CARTÃO</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => setPaymentMethod("BOLETO")}
                              className={cn("flex flex-col items-center justify-center gap-2 h-16 rounded-xl border transition-all", paymentMethod === "BOLETO" ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/5 opacity-60 hover:opacity-100")}
                            >
                              <FileText className="h-5 w-5" />
                              <span className="text-[10px] font-bold">BOLETO</span>
                            </button>
                          </div>
                        </div>

                        <button
                          disabled={loading}
                          type="submit"
                          className={cn(ctaClass, "w-full relative overflow-hidden group py-4 sm:py-5 text-base sm:text-lg font-black disabled:opacity-50 flex items-center justify-center gap-2")}
                          style={{
                            borderRadius: btnRadius,
                            boxShadow: ctaVariant(theme) === "solid" ? "var(--checkout-shadow-card)" : undefined,
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                          ) : (
                            <span className="relative z-10 uppercase tracking-widest flex items-center gap-2">
                              {isMultiStep && step === 1 ? "Ir para pagamento" : (a.buttonText?.trim() ? a.buttonText : `Pagar R$ ${totalPrice.toFixed(2).replace(".", ",")}`)}
                            </span>
                          )}
                        </button>

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
                        </div>

                        {t.authority.showPaymentLogos && (
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 opacity-40">
                            {["Visa", "Mastercard", "Pix", "Elo", "SSL"].map(brand => (
                              <span
                                key={brand}
                                className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded"
                                style={{
                                  border: `1px solid ${ts.fieldBorder}`,
                                  color: ts.text
                                }}
                              >
                                {brand}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* PIX Display Area */
                  <div className="text-center space-y-6 pt-4 animate-in fade-in zoom-in duration-300">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Quase lá!</h2>
                      <p className="text-sm opacity-60">Escaneie o QR Code abaixo para pagar</p>
                    </div>

                    <div className="bg-white p-4 rounded-3xl mx-auto w-fit shadow-2xl">
                      <img src={pixData.qrCode} alt="QR Code PIX" className="h-48 w-48" />
                    </div>

                    <div className="space-y-3">
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(pixData.copyPaste);
                          alert("Código copiado!");
                        }}
                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        COPIAR CÓDIGO PIX
                      </button>
                      <p className="text-xs opacity-50 flex items-center justify-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Aguardando pagamento...
                      </p>
                    </div>

                    <div className="p-4 rounded-xl text-left space-y-2" style={{ borderWidth: 1, borderStyle: "solid", borderColor: ts.cardBorder, background: ts.badgeBg }}>
                      <h4 className="text-xs font-bold uppercase" style={{ color: ts.accent }}>Como pagar?</h4>
                      <ol className="text-xs space-y-1 opacity-80 list-decimal pl-4">
                        <li>Abra o app do seu banco</li>
                        <li>Vá em Área PIX e escolha &quot;Ler QR Code&quot; ou &quot;Pix Copia e Cola&quot;</li>
                        <li>Confirme os dados e finalize o pagamento</li>
                      </ol>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Support Widget FAB */}
      {t.supportWidget?.enabled && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {t.supportWidget.instagram && (
            <a href={`https://instagram.com/${t.supportWidget.instagram}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full cursor-pointer bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          )}
          {t.supportWidget.whatsapp && (
            <a href={`https://wa.me/${t.supportWidget.whatsapp}`} target="_blank" rel="noreferrer" style={{ background: BRAND.whatsapp }} className="w-12 h-12 rounded-full cursor-pointer shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.888-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
          )}
        </div>
      )}

      {/* Social Proof Popup */}
      {sp.popup.enabled && (
        <SocialPopup interval={sp.popup.interval} />
      )}
    </CheckoutThemeProvider>
  );
}
