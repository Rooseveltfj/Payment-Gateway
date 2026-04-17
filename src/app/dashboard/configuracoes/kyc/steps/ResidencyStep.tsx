"use client";

import { useState } from "react";
import { Upload, Home, CheckCircle2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResidencyStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      
      const res = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });
      const { url } = await res.json();
      updateData({ residencyUrl: url });
    } catch {
      alert("Falha no upload do comprovante.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6 animate-in slide-in-from-right-4 duration-500 py-6">
       <div className="h-16 w-16 bg-hover rounded-full mx-auto flex items-center justify-center mb-2">
         <Home className="h-8 w-8 text-text-secondary" />
       </div>
       <h3 className="text-xl font-bold text-text-primary">Comprovante de Residência</h3>
       <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
         Envie uma conta de consumo (Água, Luz, Telefone Fixo ou Fatura de Cartão) no seu nome, com data de emissão <strong className="text-primary font-bold">dentro dos últimos 3 meses</strong>.
       </p>

       <label className="group relative mt-8 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-card hover:bg-hover transition-colors cursor-pointer h-64 overflow-hidden shadow-sm hover:border-primary mx-8">
          {data.residencyUrl ? (
            <>
               <img src={data.residencyUrl} alt="Comprovante" className="absolute inset-0 w-full h-full object-cover opacity-60" />
               <div className="relative z-10 flex flex-col items-center p-4 bg-background/80 rounded-xl backdrop-blur">
                 <CheckCircle2 className="h-8 w-8 text-success mb-2" />
                 <span className="text-sm font-bold text-text-primary">Arquivo anexado com sucesso</span>
                 <span className="text-xs text-text-secondary mt-1">Toque para substituir</span>
               </div>
            </>
          ) : (
             <>
               <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-text-secondary group-hover:text-primary transition-colors" />
               </div>
               <span className="text-sm font-semibold text-text-primary">{uploading ? "Aguarde, enviando..." : "Selecionar Documento"}</span>
               <span className="text-xs text-text-secondary mt-2">Formatos PDF, PNG ou JPG (Max: 5MB)</span>
             </>
          )}
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} disabled={uploading}/>
       </label>
    </div>
  );
}
