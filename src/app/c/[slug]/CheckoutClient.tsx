"use client";

import { useState, useEffect } from "react";
import { CheckoutConfig } from "@/types/checkout-config";
import { CheckoutRenderer, CheckoutFormApi } from "@/components/checkout/CheckoutRenderer";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand-colors";

interface Props {
  product: { id: string; slug: string; price: number; name: string };
  config: CheckoutConfig | null;
}

// Página pública: MESMO CheckoutRenderer do preview do builder (mode="live").
// Aqui vive só o estado + a lógica de pagamento (inalterada); o desenho é do renderer.
export function CheckoutClient({ product, config }: Props) {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD" | "BOLETO">("PIX");
  const [formData, setFormData] = useState({
    buyerName: "", buyerEmail: "", buyerCpf: "", buyerPhone: "", buyerData: {} as Record<string, string>,
  });
  const [loading, setLoading] = useState(false);
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [pixData, setPixData] = useState<{ qrCode: string; copyPaste: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Back Redirect
  useEffect(() => {
    if (!config?.redirects?.backRedirectUrl) return;
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => { window.location.href = config.redirects.backRedirectUrl; };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [config]);

  // Polling PIX
  useEffect(() => {
    if (!orderId || paymentMethod !== "PIX" || !pixData) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/orders/${orderId}/status`);
        const data = await res.json();
        if (data.status === "PAID") {
          if (config?.redirects?.thankYouPageUrl) window.location.href = `${config.redirects.thankYouPageUrl}?order=${orderId}`;
          else router.push(`/obrigado/${orderId}`);
        }
      } catch { }
    }, 3000);
    return () => clearInterval(interval);
  }, [orderId, pixData, paymentMethod, router, config]);

  if (!config) return <div className="p-10 text-center text-zinc-500">Checkout não configurado</div>;

  const { triggers: t, bumpUpsell: bu } = config;
  const totalBumpsPrice = selectedBumps.reduce((acc, id) => acc + (bu.orderBumps?.find(b => b.id === id)?.specialPrice || 0), 0);
  const totalPrice = product.price + totalBumpsPrice;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (paymentMethod === "PIX") {
        const res = await fetch(`/api/checkout/${product.slug}/pix`, { method: "POST", body: JSON.stringify({ ...formData, selectedBumps }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOrderId(data.orderId);
        setPixData({ qrCode: data.qrCodeImage, copyPaste: data.brCode });
      } else {
        const res = await fetch(`/api/checkout/${product.slug}/create-order`, {
          method: "POST",
          body: JSON.stringify({ ...formData, productId: product.id, paymentMethod, selectedBumps }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOrderId(data.orderId);
        if (config.redirects?.thankYouPageUrl) window.location.href = `${config.redirects.thankYouPageUrl}?order=${data.orderId}`;
        else router.push(`/obrigado/${data.orderId}`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao processar pedido");
    } finally {
      setLoading(false);
    }
  };

  const form: CheckoutFormApi = {
    values: formData,
    setValue: (patch) => setFormData(prev => ({ ...prev, ...patch })),
    setBuyerData: (key, value) => setFormData(prev => ({ ...prev, buyerData: { ...prev.buyerData, [key]: value } })),
    paymentMethod, setPaymentMethod,
    selectedBumps,
    toggleBump: (id, on) => setSelectedBumps(prev => on ? [...prev, id] : prev.filter(x => x !== id)),
    step, setStep,
    loading, onSubmit: handleCreateOrder,
    pixData, totalPrice,
  };

  return (
    <>
      <CheckoutRenderer config={config} product={product} mode="live" form={form} className="min-h-screen" />

      {/* Support Widget FAB (fora do renderer; marcas de terceiros) */}
      {t.supportWidget?.enabled && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {t.supportWidget.instagram && (
            <a href={`https://instagram.com/${t.supportWidget.instagram}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full cursor-pointer bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
          )}
          {t.supportWidget.whatsapp && (
            <a href={`https://wa.me/${t.supportWidget.whatsapp}`} target="_blank" rel="noreferrer" style={{ background: BRAND.whatsapp }} className="w-12 h-12 rounded-full cursor-pointer shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.888-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
            </a>
          )}
        </div>
      )}
    </>
  );
}
