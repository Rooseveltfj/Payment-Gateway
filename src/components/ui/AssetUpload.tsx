"use client";

import { useState, useRef, useCallback } from "react";
import { ImagePlus, RefreshCw, Trash2, Loader2, AlertCircle, CheckCircle2, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AssetKind, ASSET_RULES, sniffMime, validateAssetMeta, isVideoMime, isVideoUrl,
} from "@/lib/checkout-assets";

interface Props {
  kind: AssetKind;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  aspectRatio?: "16/9" | "1/1" | "4/3";
}

// Upload direto client → Supabase via signed upload URL (rota server-side).
// A service key NUNCA chega ao client.
export function AssetUpload({ kind, value, onChange, label, hint, aspectRatio = "16/9" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localIsVideo, setLocalIsVideo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rules = ASSET_RULES[kind];
  const acceptAttr = rules.mimes.join(",");
  const maxHint = kind === "logo"
    ? "PNG, JPG, WEBP, SVG • máx 2MB"
    : "Imagem (máx 5MB) ou vídeo MP4/WEBM (máx 50MB)";

  const aspectClass = { "16/9": "aspect-video", "1/1": "aspect-square", "4/3": "aspect-[4/3]" }[aspectRatio];

  const preview = localPreview ?? value;
  const previewIsVideo = localPreview ? localIsVideo : isVideoUrl(value);

  const putWithProgress = (signedUrl: string, file: File, mime: string) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("content-type", mime);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.setRequestHeader("cache-control", "3600");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
      xhr.onerror = () => reject(new Error("network"));
      xhr.onabort = () => reject(new Error("abort"));
      xhr.send(file);
    });

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // 1) content-type REAL por magic bytes (não confia na extensão)
    const sniffed = await sniffMime(file);
    const mime = sniffed || file.type;
    const v = validateAssetMeta(kind, mime, file.size);
    if (!v.ok) {
      setError(v.error!);
      toast.error(v.error!);
      return;
    }
    const asVideo = isVideoMime(mime);

    // 2) preview otimista imediato
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setLocalIsVideo(asVideo);
    setUploading(true);
    setProgress(0);

    const previousUrl = value; // para cleanup após sucesso

    try {
      // 3) pedir signed upload URL ao servidor (NextAuth-gated)
      const res = await fetch("/api/checkout/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, contentType: mime, size: file.size }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao preparar o upload.");
      }
      const { signedUrl, publicUrl } = await res.json();

      // 4) upload direto ao Supabase com barra de progresso
      await putWithProgress(signedUrl, file, mime);

      // 5) persistir URL pública
      onChange(publicUrl);
      setLocalPreview(null); // passa a usar a URL pública
      URL.revokeObjectURL(objectUrl);

      // 6) limpeza: apagar asset antigo do bucket
      if (previousUrl && previousUrl !== publicUrl) {
        fetch("/api/checkout/delete-asset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousUrl }),
        }).catch(() => {});
      }
    } catch (err) {
      const msg = (err as Error).message === "network"
        ? "Falha de rede durante o upload. Verifique sua conexão e tente novamente."
        : ((err as Error).message || "Erro no upload. Tente novamente.");
      setError(msg);
      toast.error(msg);
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [kind, value, onChange]);

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
    e.target.value = "";
  };

  const removeAsset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = value;
    onChange(null);
    setLocalPreview(null);
    setError(null);
    if (url) {
      fetch("/api/checkout/delete-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }).catch(() => {});
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[13px] font-medium text-[#94a3b8] mb-1.5 ml-1 flex items-center gap-2">
          {kind === "banner" ? <Film className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {label}
        </label>
      )}

      <div
        onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "relative w-full overflow-hidden rounded-[20px] group transition-all duration-300",
          aspectClass,
          !preview && "bg-white/[0.02] border-2 border-dashed border-white/10 cursor-pointer flex flex-col items-center justify-center gap-3",
          dragActive && "border-purple-500 bg-purple-500/5 shadow-[0_0_0_4px_rgba(139,92,246,0.1)]",
          uploading && "cursor-not-allowed",
          error && !preview && "border-red-500/40 bg-red-500/5"
        )}
      >
        <input ref={inputRef} type="file" accept={acceptAttr} className="hidden" onChange={onInput} />

        {preview ? (
          <div className="relative w-full h-full">
            {previewIsVideo ? (
              <video src={preview} className="w-full h-full object-cover" muted loop playsInline autoPlay />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            )}

            {!uploading && !error && (
              <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 shadow-lg z-10">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Overlay de ações */}
            {!uploading && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white text-[13px] font-bold border border-white/10">
                  <RefreshCw className="w-4 h-4" /> Substituir
                </button>
                <button type="button" onClick={removeAsset}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-xl text-red-400 text-[13px] font-bold border border-red-500/20">
                  <Trash2 className="w-4 h-4" /> Remover
                </button>
              </div>
            )}

            {/* Barra de progresso */}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 px-8">
                <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
                <div className="w-full max-w-[220px] h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-purple-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[12px] font-bold text-white/80 tabular-nums">Enviando… {progress}%</span>
              </div>
            )}
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-3 px-8 w-full">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <div className="w-full max-w-[220px] h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-purple-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[12px] font-medium text-[#64748b] tabular-nums">Enviando… {progress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 border border-purple-500/20 group-hover:scale-110 transition-transform">
              {kind === "banner" ? <Film className="w-6 h-6 text-purple-400" /> : <ImagePlus className="w-6 h-6 text-purple-400" />}
            </div>
            <p className="text-[14px] font-bold text-white">Clique ou arraste {kind === "banner" ? "imagem ou vídeo" : "uma imagem"}</p>
            <p className="text-[11px] font-medium text-[#64748b] mt-1 uppercase tracking-wider">{maxHint}</p>
            {dragActive && <p className="text-[12px] font-bold text-purple-400 mt-2 animate-pulse">Solte para enviar ✓</p>}
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-[12px] text-red-400 font-medium ml-1 mt-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      ) : hint ? (
        <p className="text-[11px] text-[#64748b] italic ml-1 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
