"use client";

import { useState } from "react";
import { AppearanceTab } from "@/components/checkout-builder/tabs/AppearanceTab";
import { FormFieldsTab } from "@/components/checkout-builder/tabs/FormFieldsTab";
import { CheckoutPreview } from "@/components/checkout-builder/CheckoutPreview";
import { CheckoutConfig } from "@/types/checkout-config";
import { cn } from "@/lib/utils";
import { Paintbrush, LayoutTemplate, Eye } from "lucide-react";

interface Props {
  data: CheckoutConfig;
  updateData: (d: Partial<CheckoutConfig>) => void;
}

export function CheckoutConfigStep({ data, updateData }: Props) {
  const [activeTab, setActiveTab] = useState<"appearance" | "form">("appearance");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-hover p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("appearance")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "appearance" ? "bg-background text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Paintbrush className="w-4 h-4" />
            Aparência
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "form" ? "bg-background text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <LayoutTemplate className="w-4 h-4" />
            Formulário
          </button>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className={cn(
            "flex lg:hidden items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border transition-all",
            showPreview ? "bg-primary text-white border-primary" : "bg-card text-text-primary"
          )}
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Editar" : "Ver Preview"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Controls */}
        <div className={cn(
          "space-y-6 overflow-y-auto pr-2 max-h-[500px] scrollbar-thin",
          showPreview && "hidden lg:block"
        )}>
          {activeTab === "appearance" ? (
            <AppearanceTab 
              config={data.appearance} 
              onChange={(appearance) => updateData({ appearance: { ...data.appearance, ...appearance } })} 
            />
          ) : (
            <FormFieldsTab 
              config={data.form} 
              onChange={(form) => updateData({ form: { ...data.form, ...form } })} 
            />
          )}
        </div>

        {/* Live Preview */}
        <div className={cn(
          "lg:block rounded-2xl border border-border bg-black overflow-hidden relative group h-[500px]",
          !showPreview && "hidden"
        )}>
          <div className="absolute inset-0 scale-[0.6] origin-top transform-gpu">
             <CheckoutPreview config={data} />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] text-white/70 font-medium">
            Preview em tempo real
          </div>
        </div>
      </div>
    </div>
  );
}
