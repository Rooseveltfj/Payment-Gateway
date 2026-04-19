"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, XCircle, Info, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IdentityDocStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);

  const uploadFile = async (file: File, type: "front" | "back") => {
    const isFront = type === "front";
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    if (isFront) setFrontUploading(true); else setBackUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      
      if (res.ok) {
        if (isFront) updateData({ frontIdUrl: result.url });
        else updateData({ backIdUrl: result.url });
        toast.success("Documento enviado!");
      } else {
        const errorMsg = result.error || "Erro desconhecido";
        toast.error(`Falha no upload: ${errorMsg}`);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("KYC_UPLOAD_ERROR:", err);
      if (!err.message?.includes("upload")) {
        toast.error(`Erro: ${err.message || "Falha na conexão com o servidor"}`);
      }
    } finally {
      if (isFront) setFrontUploading(false); else setBackUploading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center max-w-lg mx-auto space-y-2">
        <h3 className="text-xl font-bold text-[#f1f5f9]">Documento de Identidade</h3>
        <p className="text-sm text-[#64748b]">Envie fotos nítidas do seu documento (RG ou CNH). Remova do plástico para evitar reflexos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* FRONT */}
        <div className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1 flex justify-between items-center">
            Frente do Documento
            {data.frontIdUrl && <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />}
          </label>
          <div className={cn(
            "relative group aspect-[1.6/1] rounded-[20px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden",
            data.frontIdUrl 
              ? "border-white/[0.05] bg-[#0d0d1c]" 
              : "border-[#8b5cf633] bg-[#8b5cf60a] hover:border-[#8b5cf666] hover:bg-[#8b5cf612]"
          )}>
            {frontUploading ? (
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full border-2 border-[#8b5cf6] border-t-transparent animate-spin" />
               </div>
            ) : data.frontIdUrl ? (
               <>
                 <img src={data.frontIdUrl} alt="Frente" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <label className="cursor-pointer bg-white text-black h-9 px-4 rounded-full flex items-center gap-2 text-[12px] font-bold shadow-xl hover:scale-105 transition active:scale-95">
                      <ImageIcon className="h-4 w-4" />
                      Alterar Foto
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if(e.target.files?.[0]) uploadFile(e.target.files[0], "front"); }} />
                    </label>
                 </div>
               </>
            ) : (
               <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6]">
                     <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-[#f1f5f9]">Anexar Frente</p>
                    <p className="text-[11px] text-[#64748b]">Clique ou arraste</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if(e.target.files?.[0]) uploadFile(e.target.files[0], "front"); }} />
               </label>
            )}
          </div>
        </div>

        {/* BACK */}
        <div className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1 flex justify-between items-center">
            Verso do Documento
            {data.backIdUrl && <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />}
          </label>
          <div className={cn(
            "relative group aspect-[1.6/1] rounded-[20px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden",
            data.backIdUrl 
              ? "border-white/[0.05] bg-[#0d0d1c]" 
              : "border-[#8b5cf633] bg-[#8b5cf60a] hover:border-[#8b5cf666] hover:bg-[#8b5cf612]"
          )}>
            {backUploading ? (
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full border-2 border-[#8b5cf6] border-t-transparent animate-spin" />
               </div>
            ) : data.backIdUrl ? (
               <>
                 <img src={data.backIdUrl} alt="Verso" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <label className="cursor-pointer bg-white text-black h-9 px-4 rounded-full flex items-center gap-2 text-[12px] font-bold shadow-xl hover:scale-105 transition active:scale-95">
                      <ImageIcon className="h-4 w-4" />
                      Alterar Foto
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if(e.target.files?.[0]) uploadFile(e.target.files[0], "back"); }} />
                    </label>
                 </div>
               </>
            ) : (
               <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6]">
                     <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-[#f1f5f9]">Anexar Verso</p>
                    <p className="text-[11px] text-[#64748b]">Clique ou arraste</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if(e.target.files?.[0]) uploadFile(e.target.files[0], "back"); }} />
               </label>
            )}
          </div>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <p className="text-[12px] text-[#64748b] leading-relaxed">
          <strong className="text-[#f1f5f9]">Dica de Sucesso:</strong> Certifique-se que o documento está legível, sem cortes nas bordas e sem reflexos de luz (flash). Isso acelera o processo de aprovação em até 2x.
        </p>
      </div>
    </div>
  );
}
