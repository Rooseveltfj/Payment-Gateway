"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResidencyStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
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
        updateData({ residencyUrl: result.url });
        toast.success("Comprovante anexado!");
      } else {
        throw new Error(result.error);
      }
    } catch {
      toast.error("Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    updateData({ residencyUrl: null });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-[#f1f5f9]">Comprovante de Residência</h3>
        <p className="text-sm text-[#64748b]">Envie um comprovante emitido nos últimos 90 dias em seu nome ou de parentes de 1º grau.</p>
      </div>

      <div className="space-y-6">
        <div className={cn(
          "relative min-h-[220px] rounded-[24px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center p-8",
          data.residencyUrl 
            ? "border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.05)]" 
            : "border-[#8b5cf633] bg-[#8b5cf60a] hover:border-[#8b5cf666] hover:bg-[#8b5cf612]"
        )}>
           {uploading ? (
             <div className="flex flex-col items-center gap-3">
               <div className="w-10 h-10 rounded-full border-3 border-[#8b5cf6] border-t-transparent animate-spin" />
               <span className="text-sm font-bold text-[#f1f5f9]">Enviando documento...</span>
             </div>
           ) : data.residencyUrl ? (
             <div className="space-y-4 flex flex-col items-center">
                <div className="h-16 w-16 bg-[#22c55e1a] text-[#22c55e] rounded-2xl flex items-center justify-center border border-[#22c55e33]">
                   <FileText className="h-8 w-8" />
                </div>
                <div>
                   <p className="text-[15px] font-bold text-[#f1f5f9]">Documento Anexado</p>
                   <p className="text-[12px] text-[#64748b] mt-1 italic">Visto com sucesso pela plataforma</p>
                </div>
                <div className="flex gap-3 pt-2">
                   <button 
                    onClick={removeFile}
                    className="h-9 px-5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-bold text-[11px] flex items-center gap-2 uppercase tracking-wider"
                   >
                     <X className="w-3.5 h-3.5" />
                     Remover e Trocar
                   </button>
                </div>
             </div>
           ) : (
             <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-5 group">
                <div className="h-16 w-16 rounded-2xl bg-[#8b5cf61a] border border-[#8b5cf633] flex items-center justify-center text-[#8b5cf6] transition-transform duration-300 group-hover:scale-110">
                   <UploadCloud className="h-8 w-8" />
                </div>
                <div className="space-y-1 px-8">
                  <p className="text-[16px] font-bold text-[#f1f5f9]">Anexar Comprovante</p>
                  <p className="text-[12px] text-[#64748b]">Clique ou arraste seu arquivo PDF ou Imagem</p>
                </div>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
             </label>
           )}
        </div>

        {/* Requirements Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[12px] font-bold text-[#f1f5f9]">Tipos de documento</p>
                <p className="text-[11px] text-[#64748b]">Contas de energia, água, gás ou telefone fixo/celular.</p>
              </div>
           </div>
           <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#eab308] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[12px] font-bold text-[#f1f5f9]">Validade</p>
                <p className="text-[11px] text-[#64748b]">Data de emissão de no máximo 3 meses atrás.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
