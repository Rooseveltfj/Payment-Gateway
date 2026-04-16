"use client";

import { useState } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/slugify";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BasicInfoStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    updateData({ name, slug: slugify(name) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });
      const { url } = await res.json();
      updateData({ imageUrl: url });
    } catch {
      alert("Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="lg:col-span-3 space-y-5">
         <div>
           <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Produto *</label>
           <Input 
             placeholder="Ex: Mentoria VIP 2024" 
             value={data.name} 
             onChange={handleNameChange}
           />
         </div>

         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">Preço Inicial (R$) *</label>
             <Input 
                 type="number" 
                 min="0.00" 
                 step="0.01" 
                 placeholder="99,90" 
                 value={data.price || ""} 
                 onChange={e => updateData({ price: parseFloat(e.target.value) })}
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Cobrança</label>
             <select 
               className="w-full flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               value={data.type}
               onChange={e => updateData({ type: e.target.value })}
             >
               <option value="SINGLE">Pagamento Único</option>
               <option value="SUBSCRIPTION">Assinatura Recorrente</option>
             </select>
           </div>
         </div>

         <div>
           <label className="block text-sm font-medium text-text-secondary mb-1">Descrição do Produto (Opcional)</label>
           <textarea 
             rows={4}
             placeholder="Explique o que o cliente receberá..."
             className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
             value={data.description}
             onChange={e => updateData({ description: e.target.value })}
           />
         </div>

         <div>
           <label className="block text-sm font-medium text-text-secondary mb-1">Slug URL</label>
           <div className="flex border border-border rounded-md bg-background overflow-hidden items-center focus-within:ring-2 focus-within:ring-primary">
              <span className="pl-3 text-text-secondary text-sm">pay.blackgate.com/</span>
              <input 
                type="text" 
                className="flex-1 bg-transparent border-0 px-2 py-2 text-sm text-text-primary focus:outline-none focus:ring-0" 
                value={data.slug} 
                onChange={e => updateData({ slug: e.target.value })}
              />
           </div>
         </div>
       </div>

       {/* Right Column: Upload */}
       <div className="lg:col-span-2 space-y-4">
         <label className="block text-sm font-medium text-text-secondary">Capa do Produto</label>
         <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-background/50 hover:bg-hover/50 transition relative overflow-hidden group">
            {data.imageUrl ? (
              <>
                 <img src={data.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" />
                 <div className="relative z-10 bg-black/60 p-3 rounded-full backdrop-blur-md cursor-pointer hover:scale-105 transition">
                    <label className="cursor-pointer text-white flex items-center gap-2 text-sm font-medium">
                       <ImageIcon className="h-4 w-4" />
                       Trocar Imagem
                       <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                 </div>
              </>
            ) : (
              <label className="cursor-pointer w-full h-full flex flex-col items-center">
                 <div className="h-12 w-12 rounded-full bg-hover flex items-center justify-center mb-3">
                    <UploadCloud className="h-6 w-6 text-text-secondary group-hover:text-primary transition-colors" />
                 </div>
                 <p className="text-sm font-medium text-text-primary">{uploading ? "Enviando..." : "Clique ou arraste uma imagem"}</p>
                 <p className="text-xs text-text-secondary mt-1">PNG, JPG ou WEBP (Máx. 2MB)</p>
                 <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={handleImageUpload} />
              </label>
            )}
         </div>
       </div>
    </div>
  );
}
