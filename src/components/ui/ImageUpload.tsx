"use client";

import { useState, useRef, useCallback } from "react";
import { ImagePlus, RefreshCw, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  aspectRatio?: "16/9" | "1/1" | "4/3";
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  aspectRatio = "16/9",
  maxSizeMB = 2,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    "16/9": "aspect-video",
    "1/1": "aspect-square",
    "4/3": "aspect-[4/3]",
  }[aspectRatio];

  const handleUpload = async (file: File) => {
    // Basic Validation
    if (!file.type.startsWith("image/")) {
      const msg = "Apenas imagens (JPG, PNG, WEBP) são permitidas.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      const msg = `O tamanho máximo permitido é ${maxSizeMB}MB.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      // Use the server-side API route (which has access to service_role key)
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao fazer upload");
      }

      const { url } = await res.json();

      onChange(url);
      setPreview(url);
      setError(null);
    } catch (err: any) {
      const errMsg = err.message || "Erro ao enviar imagem. Tente novamente.";
      setError(errMsg);
      setPreview(value); // revert preview
      toast.error("Falha no upload da imagem: " + errMsg);
      console.error("[ImageUpload Error]", err);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[13px] font-medium text-[#94a3b8] mb-1.5 ml-1 flex items-center justify-between">
          {label}
        </label>
      )}

      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative w-full overflow-hidden transition-all duration-300 rounded-[20px] group",
          aspectRatioClass,
          !preview && "bg-white/[0.02] border-2 border-dashed border-white/10 cursor-pointer flex flex-col items-center justify-center gap-3",
          dragActive && "border-purple-500 bg-purple-500/5 shadow-[0_0_0_4px_rgba(139,92,246,0.1)]",
          isUploading && "cursor-not-allowed pointer-events-none opacity-80",
          error && "border-red-500/40 bg-red-500/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="text-[13px] font-medium text-[#64748b]">Enviando imagem...</span>
          </div>
        ) : preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />

            {/* Success check badge */}
            {!isUploading && !error && (
              <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 shadow-lg z-10">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Hover actions overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white text-[13px] font-bold border border-white/10 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Alterar
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-xl text-red-400 text-[13px] font-bold border border-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Remover
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 border border-purple-500/20">
              <ImagePlus className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-[14px] font-bold text-white tracking-tight">
              Clique ou arraste uma imagem
            </p>
            <p className="text-[11px] font-medium text-[#64748b] mt-1 uppercase tracking-wider">
              PNG, JPG ou WEBP • Máx {maxSizeMB}MB
            </p>
            {dragActive && (
              <p className="text-[12px] font-bold text-purple-400 mt-2 animate-pulse">
                Solte para fazer upload ✓
              </p>
            )}
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-[12px] text-red-400 font-medium ml-1 mt-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      ) : hint ? (
        <p className="text-[11px] text-[#64748b] italic ml-1 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
