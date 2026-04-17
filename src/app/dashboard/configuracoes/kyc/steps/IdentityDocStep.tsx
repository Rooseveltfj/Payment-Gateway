"use client";

import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IdentityDocStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);

  const uploadFile = async (file: File, type: "front" | "back") => {
    const isFront = type === "front";
    if (isFront) { setFrontUploading(true); } else { setBackUploading(true); }

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Reusing the product upload endpoint for development mockup, 
      // in production point this to an isolated /api/kyc/upload
      const res = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });
      const { url } = await res.json();
      
      if (isFront) { updateData({ frontIdUrl: url }); }
      else { updateData({ backIdUrl: url }); }
    } catch {
      alert("Falha no upload");
    } finally {
      if (isFront) { setFrontUploading(false); } else { setBackUploading(false); }
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-text-primary">Fotografe seu RG ou CNH Aberta</h3>
        <p className="text-sm text-text-secondary mt-2">Remova o documento do plástico reflexivo. Envie as duas faces de forma legível.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* FRONT */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary flex items-center justify-between">
            Frente do Documento
            {data.frontIdUrl && <CheckCircle2 className="h-4 w-4 text-success" />}
          </label>
          <label className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-card hover:bg-hover transition-colors cursor-pointer h-56 overflow-hidden">
             {data.frontIdUrl ? (
                <img src={data.frontIdUrl} alt="Frente" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-50" />
             ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform">
                     <Upload className="h-6 w-6 text-text-secondary group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{frontUploading ? "Enviando..." : "Anexar Foto da Frente"}</span>
                  <span className="text-xs text-text-secondary mt-1">JPG, PNG, PDF</span>
                </>
             )}
             <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if(e.target.files?.[0]) uploadFile(e.target.files[0], "front"); }} disabled={frontUploading}/>
          </label>
        </div>

        {/* BACK */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary flex items-center justify-between">
            Verso do Documento
            {data.backIdUrl && <CheckCircle2 className="h-4 w-4 text-success" />}
          </label>
          <label className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-card hover:bg-hover transition-colors cursor-pointer h-56 overflow-hidden">
             {data.backIdUrl ? (
                <img src={data.backIdUrl} alt="Verso" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-50" />
             ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform">
                     <Upload className="h-6 w-6 text-text-secondary group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{backUploading ? "Enviando..." : "Anexar Foto do Verso"}</span>
                  <span className="text-xs text-text-secondary mt-1">Caso RG seja impresso frente/verso independentes.</span>
                </>
             )}
             <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if(e.target.files?.[0]) uploadFile(e.target.files[0], "back"); }} disabled={backUploading}/>
          </label>
        </div>
      </div>
    </div>
  );
}
