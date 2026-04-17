"use client";

import { useState, useCallback } from "react";
import { CheckoutConfig, DEFAULT_CHECKOUT_CONFIG } from "@/types/checkout-config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AppearanceTab } from "@/components/checkout-builder/tabs/AppearanceTab";
import { ContentTab } from "@/components/checkout-builder/tabs/ContentTab";
import { TriggersTab } from "@/components/checkout-builder/tabs/TriggersTab";
import { SocialProofTab } from "@/components/checkout-builder/tabs/SocialProofTab";
import { FormFieldsTab } from "@/components/checkout-builder/tabs/FormFieldsTab";
import { BumpUpsellTab } from "@/components/checkout-builder/tabs/BumpUpsellTab";
import { PixelsTab } from "@/components/pixels/PixelsTab";
import { GeneralTab } from "@/components/checkout-builder/tabs/GeneralTab";
import { CheckoutPreview } from "@/components/checkout-builder/CheckoutPreview";
import {
  Settings2, Palette, Type, Zap, Users, ClipboardList, ShoppingCart, Code2,
  Monitor, Smartphone, ExternalLink, Save, CheckCircle2, Loader2
} from "lucide-react";

const TABS = [
  { id: "general", label: "Geral", icon: Settings2 },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "content", label: "Conteúdo", icon: Type },
  { id: "triggers", label: "Gatilhos", icon: Zap },
  { id: "social", label: "Prova Social", icon: Users },
  { id: "form", label: "Formulário", icon: ClipboardList },
  { id: "bump", label: "Bump & Upsell", icon: ShoppingCart },
  { id: "pixels", label: "Pixels", icon: Code2 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CheckoutBuilderClient({ productId, initialProduct }: { productId: string; initialProduct: any }) {
  const [activeTab, setActiveTab] = useState("general");
  
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

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSave = async () => {
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

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar configuração.");
    } finally {
      setSaving(false);
    }
  };

  const openPreview = () => {
    const encoded = encodeURIComponent(JSON.stringify(config));
    window.open(`/checkout/preview?config=${encoded}`, "_blank");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#09090b" }}>
      {/* ─── Left Panel ─── */}
      <div className="w-[400px] shrink-0 flex flex-col border-r border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-text-primary">Checkout Builder</h1>
            <p className="text-[11px] text-text-secondary mt-0.5">Edite e veja em tempo real</p>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "text-xs font-semibold gap-1.5 transition-all",
              saved && "bg-success hover:bg-success/90"
            )}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Salvo!</>
            ) : (
              <><Save className="h-3.5 w-3.5" /> Salvar</>
            )}
          </Button>
        </div>

        {/* Tabs nav */}
        <div className="flex overflow-x-auto border-b border-border bg-background/40 shrink-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2.5 text-[10px] font-medium whitespace-nowrap transition-colors shrink-0",
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-text-secondary hover:text-text-primary hover:bg-hover/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
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
          {activeTab === "bump" && (
            <BumpUpsellTab config={config.bumpUpsell} onChange={d => updateConfig("bumpUpsell", d)} />
          )}
          {activeTab === "pixels" && (
            <PixelsTab config={config.pixels} onChange={d => updateConfig("pixels", d)} />
          )}
        </div>
      </div>

      {/* ─── Right Preview Panel ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background/20">
        {/* Preview toolbar */}
        <div className="h-12 shrink-0 border-b border-border flex items-center justify-between px-4 bg-card/50">
          <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all",
                previewMode === "desktop"
                  ? "bg-primary text-white shadow"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all",
                previewMode === "mobile"
                  ? "bg-primary text-white shadow"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>

          <button
            onClick={openPreview}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Abrir em nova aba
          </button>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-6"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "24px 24px" }}
        >
          <div
            className={cn(
              "transition-all duration-300 shadow-2xl rounded-xl overflow-hidden",
              previewMode === "mobile" ? "w-[390px]" : "w-full max-w-4xl"
            )}
            style={{ minHeight: 600 }}
          >
            <CheckoutPreview config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
