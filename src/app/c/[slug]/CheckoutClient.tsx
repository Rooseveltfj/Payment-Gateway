"use client";

import { useState, useEffect } from "react";
import { CheckoutConfig } from "@/types/checkout-config";
import { CountdownTimer } from "@/components/checkout-builder/preview/CountdownTimer";
import { SocialPopup } from "@/components/checkout-builder/preview/SocialPopup";
import { ReviewCarousel } from "@/components/checkout-builder/preview/ReviewCarousel";
import { CreditCard, QrCode, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  product: {
    id: string;
    slug: string;
    price: number;
    name: string;
  };
  config: CheckoutConfig | null;
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

export function CheckoutClient({ product, config }: Props) {
  const router = useRouter();

  // 1. Hooks (Must be top level)
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD" | "BOLETO">("PIX");
  const [formData, setFormData] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerCpf: "",
    buyerPhone: "",
    buyerData: {}
  });
  const [loading, setLoading] = useState(false);
  const [orderBump, setOrderBump] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; copyPaste: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Polling para PIX
  useEffect(() => {
    if (!orderId || paymentMethod !== "PIX" || !pixData) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/orders/${orderId}/status`);
        const data = await res.json();
        if (data.status === "PAID") {
          router.push(`/obrigado/${orderId}`);
        }
      } catch { }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, pixData, paymentMethod, router]);

  // 2. Guard
  if (!config) return <div className="p-10 text-center text-zinc-500">Checkout não configurado</div>;

  // 3. Destructuring
  const { appearance: a, content: c, triggers: t, socialProof: sp, form: f, bumpUpsell: bu } = config;

  const fontFamily = a.fontFamily === "Geist" ? "inherit" : a.fontFamily;
  const isDark = a.themePreset !== "light";

  const textPrimary = isDark ? "#f4f4f5" : "#09090b";
  const textSecondary = isDark ? "#a1a1aa" : "#71717a";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,1)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === "PIX") {
        const res = await fetch(`/api/checkout/${product.slug}/pix`, {
          method: "POST",
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setOrderId(data.orderId);
        setPixData({ qrCode: data.qrCodeImage, copyPaste: data.brCode });
      } else {
        // Fallback for Credit Card / Boleto (Not yet fully implemented with real Woovi logic)
        const res = await fetch(`/api/checkout/${product.slug}/create-order`, {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            productId: product.id,
            paymentMethod,
            orderBump
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setOrderId(data.orderId);
        router.push(`/obrigado/${data.orderId}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar pedido";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: a.themePreset === "gradient"
          ? `linear-gradient(135deg, #1e1b4b, ${a.bgColor})`
          : a.bgColor,
        fontFamily,
        color: textPrimary,
      }}
    >
      {/* Font loader */}
      {a.fontFamily !== "Geist" && FONT_IMPORTS[a.fontFamily] && (
        <link rel="stylesheet" href={FONT_IMPORTS[a.fontFamily]} />
      )}

      {/* Urgency Banner */}
      {t.urgency.enabled && (
        <div
          className="sticky top-0 z-50 w-full text-center text-sm font-bold py-2 px-4 shadow-md overflow-hidden"
          style={{ background: t.urgency.bgColor, color: "#fff" }}
        >
          <div className="animate-pulse">{t.urgency.text}</div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column Content - 7 cols */}
        <div className="lg:col-span-7 space-y-8">
          {a.logoUrl && (
            <img src={a.logoUrl} alt="Logo" className="h-10 object-contain" />
          )}

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ color: textPrimary }}>
              {c.headline}
            </h1>
            <p className="text-xl" style={{ color: textSecondary }}>
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
            <img
              src={a.bannerUrl || a.bannerExternal}
              alt="Banner do Produto"
              className="w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
            />
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
                <li key={b.id} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: a.primaryColor }}>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          {sp.reviews.enabled && sp.reviews.items.length > 0 && (
            <div className="py-8 border-t border-white/5">
               <ReviewCarousel reviews={sp.reviews.items} display={sp.reviews.display} primaryColor={a.primaryColor} />
            </div>
          )}

          {/* Guarantee */}
          {t.guarantee.enabled && (
             <div className="flex items-center gap-6 p-6 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
               <img src="https://cdn-icons-png.flaticon.com/512/755/755191.png" className="h-20 w-20 grayscale brightness-150 opacity-50" alt="Garantia" />
               <div>
                  <h4 className="text-xl font-bold">Garantia Incondicional de {t.guarantee.days} Dias</h4>
                  <p className="text-sm opacity-70 mt-1">{t.guarantee.text}</p>
               </div>
             </div>
          )}
        </div>

        {/* Right Column Form - 5 cols */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <form onSubmit={handleCreateOrder} className="rounded-3xl p-8 space-y-6 shadow-2xl ring-1 ring-white/10" style={{ background: cardBg }}>
              
              {!pixData ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Checkout Seguro</h2>
                    <p className="text-sm opacity-60">Complete seus dados para continuar</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">Nome Completo</label>
                      <input 
                        required 
                        value={formData.buyerName}
                        onChange={e => setFormData({...formData, buyerName: e.target.value})}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
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
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                        placeholder="seu@email.com"
                      />
                    </div>
                    {f.optionalFields.cpf && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block opacity-50">CPF</label>
                        <input 
                          required 
                          value={formData.buyerCpf}
                          onChange={e => setFormData({...formData, buyerCpf: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                          placeholder="000.000.000-00"
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Bump */}
                  {bu.orderBump.enabled && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-primary uppercase">OFERTA ESPECIAL</span>
                         <span className="text-sm font-bold text-primary">+ R$ {bu.orderBump.specialPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-sm font-semibold">{bu.orderBump.productName}</p>
                      <label className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all border border-white/5">
                        <input 
                          type="checkbox" 
                          checked={orderBump}
                          onChange={e => setOrderBump(e.target.checked)}
                          className="h-5 w-5 rounded border-white/20 bg-transparent text-primary focus:ring-primary" 
                        />
                        <span className="text-xs font-bold">SIM! ADICIONAR AGORA</span>
                      </label>
                    </div>
                  )}

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
                    className="w-full h-14 rounded-2xl font-bold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    style={{ 
                      background: a.primaryColor,
                      borderRadius: a.buttonStyle === "pill" ? "9999px" : a.buttonStyle === "square" ? "4px" : "12px"
                    }}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>PAGAR AGORA R$ {orderBump ? (product.price + bu.orderBump.specialPrice).toFixed(2) : product.price.toFixed(2)}</>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 opacity-30">
                    <img src="https://checkout.perfectpay.com.br/assets/images/gateways/visa.svg" alt="Visa" className="h-4" />
                    <img src="https://checkout.perfectpay.com.br/assets/images/gateways/mastercard.svg" alt="Mastercard" className="h-4" />
                    <img src="https://checkout.perfectpay.com.br/assets/images/gateways/pix.svg" alt="Pix" className="h-4" />
                    <img src="https://checkout.perfectpay.com.br/assets/images/gateways/encryption.svg" alt="SSL" className="h-4" />
                  </div>
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

                  <div className="p-4 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-left space-y-2" style={{ borderColor: `${a.primaryColor}30`, background: `${a.primaryColor}10` }}>
                    <h4 className="text-xs font-bold uppercase" style={{ color: a.primaryColor }}>Como pagar?</h4>
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

      {/* Social Proof Popup */}
      {sp.popup.enabled && (
        <SocialPopup interval={sp.popup.interval} primaryColor={a.primaryColor} />
      )}
    </div>
  );
}
