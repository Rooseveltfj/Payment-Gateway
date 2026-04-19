"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, User, Camera, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SelfieStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        updateData({ selfieUrl: result.url });
        toast.success("Selfie enviada!");
      } else {
        throw new Error(result.error);
      }
    } catch {
      toast.error("Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    updateData({ selfieUrl: null });
  };

  const instructions = [
    "Segure o documento ao lado do seu rosto.",
    "Certifique-se que o ambiente esteja bem iluminado.",
    "Olhe diretamente para a câmera sem óculos ou boné."
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-[#f1f5f9]">Validação de Identidade (Selfie)</h3>
        <p className="text-sm text-[#64748b]">Precisamos de uma foto sua segurando o documento para confirmar sua identidade.</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Huge Centralized Card (400x300 styled area) */}
        <div className={cn(
          "relative w-full max-w-[440px] aspect-[4/3] rounded-[24px] border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center text-center",
          data.selfieUrl 
            ? "border-white/[0.05] bg-[#0d0d1c]" 
            : "border-[#8b5cf633] bg-[#8b5cf60a] hover:border-[#8b5cf666] hover:bg-[#8b5cf612]"
        )}>
           {uploading ? (
             <div className="flex flex-col items-center gap-3">
               <Camera className="w-10 h-10 text-[#8b5cf6] animate-pulse" />
               <span className="text-sm font-bold text-[#f1f5f9]">Enviando selfie...</span>
             </div>
           ) : data.selfieUrl ? (
             <>
                <img src={data.selfieUrl} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px] gap-3">
                   <label className="cursor-pointer bg-white text-black h-11 px-6 rounded-full flex items-center gap-2 text-sm font-bold shadow-xl hover:scale-105 transition active:scale-95">
                      <Camera className="h-4 w-4" />
                      Tirar Outra
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </label>
                   <button 
                    onClick={removeImage}
                    className="h-11 px-6 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 transition-all font-bold text-sm"
                   >
                     Remover
                   </button>
                </div>
             </>
           ) : (
             <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-5 group">
                <div className="h-16 w-16 rounded-2xl bg-[#8b5cf61a] border border-[#8b5cf633] flex items-center justify-center text-[#8b5cf6] shadow-[0_0_30px_rgba(139,92,246,0.1)] group-hover:scale-110 transition-transform duration-300">
                   <Camera className="h-8 w-8" />
                </div>
                <div className="space-y-1 px-8">
                  <p className="text-[16px] font-bold text-[#f1f5f9]">Anexar minha Selfie</p>
                  <p className="text-[12px] text-[#64748b]">Clique aqui para selecionar uma foto</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
             </label>
           )}
        </div>

        {/* Instructions List */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
           {instructions.map((text, i) => (
             <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
               <div className="h-5 w-5 rounded-full bg-[#22c55e1a] text-[#22c55e] flex items-center justify-center shrink-0">
                 <CheckCircle2 className="h-3.5 w-3.5" />
               </div>
               <span className="text-xs text-[#f1f5f9]/80 font-medium">{text}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
