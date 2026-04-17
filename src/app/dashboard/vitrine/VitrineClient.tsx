"use client";

import { useState } from "react";
import { updateShowcase, toggleProductShowcase } from "./actions";
import { Store, Globe, Camera, Save, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  user: unknown;
  products: unknown[];
}

export function VitrineClient({ user, products }: Props) {
  const [loading, setLoading] = useState(false);
  const showcaseConfig = (user.showcaseConfig as unknown) || {};
  const socialLinks = (user.socialLinks as unknown) || {};

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateShowcase(formData);
      alert("Vitrine atualizada com sucesso!");
    } catch (err: unknown) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Vitrine</h1>
          <p className="text-text-secondary mt-1">Configure sua página de vendas pública e personalize sua marca.</p>
        </div>
        {user.username && (
          <a 
            href={`/${user.username}`} 
            target="_blank" 
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all font-semibold"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Vitrine Pública
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-12">
          <form onSubmit={handleUpdate} className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
              <div className="absolute -bottom-12 left-8 p-1 bg-card rounded-2xl border border-border shadow-2xl">
                <div className="w-24 h-24 bg-hover rounded-xl flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Store className="w-10 h-10 text-text-secondary" />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-20 p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Username (Slug da Vitrine)
                  </label>
                  <div className="flex items-center">
                    <span className="bg-hover border border-r-0 border-border rounded-l-xl px-4 py-3 text-sm text-text-secondary">
                      pulsepay.com.br/
                    </span>
                    <input 
                      name="username"
                      defaultValue={user.username || ""}
                      className="flex-1 bg-card border border-border rounded-r-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      placeholder="seu-negocio"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    URL do Banner
                  </label>
                  <input 
                    name="bannerUrl"
                    defaultValue={showcaseConfig.bannerUrl || ""}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://exemplo.com/banner.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Bio / Descrição do Negócio</label>
                <textarea 
                  name="bio"
                  rows={3}
                  defaultValue={showcaseConfig.bio || ""}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Conte um pouco sobre seu negócio para seus clientes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-500" />
                    Instagram (opcional)
                  </label>
                  <input 
                    name="instagram"
                    defaultValue={socialLinks.instagram || ""}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="@seu-perfil"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <X className="w-4 h-4 text-blue-400" />
                    Twitter / X (opcional)
                  </label>
                  <input 
                    name="twitter"
                    defaultValue={socialLinks.twitter || ""}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="@seu-perfil"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <button 
                  disabled={loading}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Product Selection */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Gerenciar Vitrine</h2>
            <div className="text-xs text-text-secondary px-3 py-1 bg-hover rounded-full border border-border">
              {products.filter(p => p.showInShowcase).length} produtos visíveis
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className={cn(
                  "bg-card border rounded-2xl p-5 transition-all group overflow-hidden relative",
                  product.showInShowcase ? "border-primary/30" : "border-border opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-text-secondary">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <button 
                    onClick={() => toggleProductShowcase(product.id, !product.showInShowcase)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      product.showInShowcase ? "bg-primary" : "bg-border"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                      product.showInShowcase ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                   <span className={cn(
                     "text-[10px] font-bold px-2 py-0.5 rounded-full",
                     product.showInShowcase ? "bg-primary/10 text-primary" : "bg-hover text-text-secondary"
                   )}>
                     {product.showInShowcase ? "VISÍVEL NA VITRINE" : "OCULTO"}
                   </span>
                   <Link href={`/dashboard/produtos/${product.id}`} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                     Editar Produto
                     <ExternalLink className="w-3 h-3" />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



