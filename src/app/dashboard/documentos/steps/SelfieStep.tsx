"use client";

import { useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SelfieStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
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
      updateData({ selfieUrl: url });
    } catch {
      alert("Falha no upload da Selfie");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-8 items-center animate-in slide-in-from-right-4 duration-500 py-6">
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-bold text-text-primary">Validação Biométrica</h3>
        <p className="text-sm text-text-secondary">
          Precisamos garantir que é você mesmo efetuando o cadastro para sua própria segurança tributária.
        </p>
        <ul className="text-xs text-text-secondary list-disc pl-5 space-y-2 mt-4 opacity-80">
          <li>Segure seu documento ao lado do rosto.</li>
          <li>Garanta boa iluminação e que texto esteja legível.</li>
          <li>Não utilize boné, gorro ou óculos escuros.</li>
        </ul>
      </div>

      <div className="w-64 h-80 shrink-0 relative">
        <label className="group relative block w-full h-full rounded-2xl border-2 border-border overflow-hidden bg-card cursor-pointer shadow-lg hover:border-primary transition-colors">
          {data.selfieUrl ? (
            <img src={data.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <Camera className="h-12 w-12 text-hover mb-4 group-hover:text-primary transition-colors" />
              <span className="text-sm font-semibold text-text-primary">{uploading ? "Processando..." : "Subir Foto Liveness"}</span>
              <span className="text-[10px] text-text-secondary mt-2 border border-border px-2 py-1 rounded">Capturar da WebCam/Mobile</span>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading}/>
          
          {data.selfieUrl && (
             <div className="absolute top-2 right-2 bg-success text-white p-1.5 rounded-full shadow-md">
                <CheckCircle2 className="h-4 w-4" />
             </div>
          )}
        </label>
      </div>
    </div>
  );
}
