"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutConfig, DEFAULT_CHECKOUT_CONFIG } from "@/types/checkout-config";
import { cn } from "@/lib/utils";
import { AppearanceTab } from "@/components/checkout-builder/tabs/AppearanceTab";
import { ContentTab } from "@/components/checkout-builder/tabs/ContentTab";
import { TriggersTab } from "@/components/checkout-builder/tabs/TriggersTab";
import { SocialProofTab } from "@/components/checkout-builder/tabs/SocialProofTab";
import { FormFieldsTab } from "@/components/checkout-builder/tabs/FormFieldsTab";
import { GeneralTab } from "@/components/checkout-builder/tabs/GeneralTab";
import { CheckoutPreview } from "@/components/checkout-builder/CheckoutPreview";
import { 
  ChevronLeft, Layers, Monitor, Smartphone, ExternalLink, Save, Check, Loader2,
  Settings2, Palette, Type, Zap, Users, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const TABS = [
  { id: "general", label: "Geral", icon: Settings2 },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "content", label: "Conteúdo", icon: Type },
  { id: "triggers", label: "Gatilhos", icon: Zap },
  { id: "social", label: "Prova Social", icon: Users },
  { id: "form", label: "Formulário", icon: ClipboardList },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CheckoutBuilderClient({ productId, initialProduct }: { productId: string; initialProduct: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // States to keep track of changes
  const [config, setConfig] = useState<CheckoutConfig>(
    (initialProduct?.checkoutConfig as unknown as CheckoutConfig) || DEFAULT_CHECKOUT_CONFIG
  );
  
  const [productInfo, setProductInfo] = useState({
    name: initialProduct?.name || "",
    price: initialProduct?.price || 0,
    slug: initialProduct?.slug || "",
    description: initialProduct?.description || ""
  });

  const updateConfig = useCallback(<K extends keyof CheckoutConfig>(
    section: K,
    data: Partial<CheckoutConfig[K]>
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    setSaved(false);
  }, []);

  const handleSave = async (showSuccess = true) => {
    setSaving(true);
    try {
      // 1. Save Checkout Config
      const resConfig = await fetch(`/api/products/${productId}/checkout-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutConfig: config }),
      });

      // 2. Save Basic Info
      const resInfo = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productInfo),
      });

      if (!resConfig.ok || !resInfo.ok) {
        throw new Error("Falha ao salvar. Verifique sua conexão.");
      }

      if (showSuccess) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar configuração.");
    } finally {
      setSaving(false);
    }
  };

  // Debounced auto-save (1.5s)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [config, productInfo]);

  const openPreview = () => {
    window.open(`/c/${productInfo.slug || productId}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#07070f] selection:bg-purple-500/30 font-sans text-white overflow-hidden">
      {/* ─── Topbar ─── */}
      <header className="h-[56px] shrink-0 bg-[#07070f] border-b border-white/5 flex items-center justify-between px-5 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard/produtos")}
            className="flex items-center gap-2 text-[13px] font-medium text-[#64748b] hover:text-[#f1f5f9] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Produtos
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Layers className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-[14px] font-bold text-[#f1f5f9] tracking-tight">{productInfo.name || "Sem nome"}</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-tight">
              Checkout Builder
            </span>
          </div>
        </div>

        {/* Center: Device Toggle */}
        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5 shadow-inner" style={{ background: "rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => setPreviewMode("desktop")}
            className={cn(
              "flex items-center gap-2 px-6 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-200",
              previewMode === "desktop" ? "bg-white text-black shadow-lg" : "text-[#64748b] hover:text-white"
            )}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            className={cn(
              "flex items-center gap-2 px-6 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-200",
              previewMode === "mobile" ? "bg-white text-black shadow-lg" : "text-[#64748b] hover:text-white"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openPreview}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-[12px] font-bold text-[#64748b] hover:bg-white/5 hover:text-[#f1f5f9] transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Visualizar
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className={cn(
              "h-9 px-6 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2 min-w-[100px] justify-center",
              saved 
                ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
            )}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <><Check className="h-4 w-4" /> Salvo!</>
            ) : (
              <><Save className="h-4 w-4" /> Salvar</>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Panel: Config ─── */}
        <div className="w-[420px] shrink-0 flex flex-col bg-[#07070f] border-r border-white/5 overflow-hidden z-10 shadow-2xl">
          {/* Scrollable Tabs Nav */}
          <div className="shrink-0 sticky top-0 bg-[#07070f] border-b border-white/5 px-2 flex gap-1 overflow-x-auto no-scrollbar z-10 py-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-3 py-2.5 min-w-[76px] transition-all rounded-xl",
                    activeTab === tab.id
                      ? "bg-purple-500/10 text-purple-400 group relative"
                      : "text-[#64748b] hover:text-[#f1f5f9] hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", activeTab === tab.id ? "text-purple-400" : "text-[#475569]")} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Config Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-8 pb-24">
            {activeTab === "general" && (
              <GeneralTab data={productInfo} onChange={d => setProductInfo(prev => ({ ...prev, ...d }))} />
            )}
            {activeTab === "appearance" && (
              <AppearanceTab config={config.appearance} onChange={d => updateConfig("appearance", d)} />
            )}
            {activeTab === "content" && (
              <ContentTab config={config.content} onChange={d => updateConfig("content", d)} />
            )}
            {activeTab === "triggers" && (
              <TriggersTab config={config.triggers} onChange={d => updateConfig("triggers", d)} />
            )}
            {activeTab === "social" && (
              <SocialProofTab config={config.socialProof} onChange={d => updateConfig("socialProof", d)} />
            )}
            {activeTab === "form" && (
              <FormFieldsTab config={config.form} onChange={d => updateConfig("form", d)} />
            )}
          </div>
        </div>

        {/* ─── Right Panel: Live Preview ─── */}
        <div className="flex-1 bg-[#030307] relative flex items-center justify-center p-8 overflow-hidden">
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
          />

          <AnimatePresence mode="wait">
            {previewMode === "desktop" ? (
              <motion.div
                key="desktop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-5xl h-full rounded-2xl border border-white/5 bg-[#09090b] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
              >
                {/* Simulated browser topbar */}
                <div className="h-10 bg-white/[0.03] border-b border-white/5 flex items-center px-4 gap-2">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                   </div>
                   <div className="flex-1 flex justify-center">
                     <div className="bg-black/20 rounded-md px-10 py-1 text-[10px] text-[#475569] font-mono border border-white/5">
                        pay.PulsePay.com/c/{productInfo.slug || "checkout-exemplo"}
                     </div>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                   <CheckoutPreview config={config} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative flex items-center justify-center"
                style={{ height: "calc(100vh - 56px - 64px)" }}
              >
                {/*
                  iPhone 14 Pro Frame — pixel-perfect preview strategy:
                  We render at real 390px mobile width, then CSS scale it down.
                  This is how Framer/Webflow show faithful mobile previews.
                */}

                {/* Outer phone shell */}
                <div
                  className="relative shrink-0"
                  style={{
                    // Scale the entire phone to fit available height
                    // Phone at real size: 390px wide × 850px tall (with bezel)
                    // We scale to fit within ~580px height  
                    transform: "scale(0.65)",
                    transformOrigin: "center center",
                    width: "414px",
                    height: "896px",
                  }}
                >
                  {/* Phone body */}
                  <div className="absolute inset-0 bg-[#1c1c1e] rounded-[55px] shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden border border-white/10">
                    {/* Side buttons — decorative */}
                    <div className="absolute right-[-3px] top-[120px] w-[3px] h-[60px] bg-[#2c2c2e] rounded-l-sm" />
                    <div className="absolute left-[-3px] top-[100px] w-[3px] h-[36px] bg-[#2c2c2e] rounded-r-sm" />
                    <div className="absolute left-[-3px] top-[150px] w-[3px] h-[60px] bg-[#2c2c2e] rounded-r-sm" />
                    <div className="absolute left-[-3px] top-[220px] w-[3px] h-[60px] bg-[#2c2c2e] rounded-r-sm" />
                    
                    {/* Screen area - clips to rounded corners */}
                    <div className="absolute inset-[12px] rounded-[44px] overflow-hidden bg-black flex flex-col">
                      
                      {/* Dynamic Island notch */}
                      <div className="relative shrink-0 h-[48px] flex items-start justify-center pt-3 bg-black z-30">
                        <div className="w-[120px] h-[33px] bg-black rounded-full border border-white/10 flex items-center justify-center gap-3 px-4">
                          <div className="w-[10px] h-[10px] rounded-full bg-[#1c1c1e] border border-white/10" />
                          <div className="flex-1 h-[3px] bg-[#1c1c1e] rounded-full" />
                          <div className="w-[14px] h-[14px] rounded-full bg-[#1a1a1a] border border-white/10" />
                        </div>
                      </div>

                      {/* Status bar */}
                      <div className="shrink-0 h-8 bg-black px-6 flex items-center justify-between -mt-1 z-20">
                        <span className="text-white text-[12px] font-bold">9:41</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5 items-end h-3">
                            {[3,5,7,9].map(h => <div key={h} className="w-1 bg-white rounded-sm" style={{height: h}} />)}
                          </div>
                          <div className="w-4 h-2.5 rounded-sm border border-white/40 relative">
                            <div className="absolute right-0 top-0 bottom-0 w-[70%] bg-white/80 rounded-sm m-px" />
                            <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[5px] bg-white/50 rounded-r-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Safe URL bar — just for aesthetics */}
                      <div className="shrink-0 h-8 flex items-center justify-center px-4 bg-black/80 backdrop-blur-xl -mt-1 z-20">
                        <div className="w-full max-w-[220px] h-6 rounded-md bg-white/8 border border-white/10 flex items-center justify-center px-3 gap-1.5">
                          <div className="w-2 h-2 rounded-sm bg-green-500/60" />
                          <span className="text-[9px] text-white/40 font-mono truncate">
                            pay.pulsepay.com/c/{productInfo.slug || "..."}
                          </span>
                        </div>
                      </div>

                      {/* ── ACTUAL CHECKOUT CONTENT — rendered at real 390px width ── */}
                      <div
                        className="flex-1 overflow-y-auto overflow-x-hidden"
                        style={{
                          // Real iPhone 14 Pro inner screen width after notch padding = 390px
                          width: "390px",
                          WebkitOverflowScrolling: "touch",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <CheckoutPreview config={config} />
                      </div>

                      {/* Home indicator */}
                      <div className="shrink-0 h-8 bg-black flex items-center justify-center">
                        <div className="w-[120px] h-[5px] bg-white/30 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
