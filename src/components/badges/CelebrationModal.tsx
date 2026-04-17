"use client";

import { useState, useEffect } from "react";
import { BadgeType } from "@/lib/constants/badges";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { X, Download, Share2, Camera, Check } from "lucide-react";
import { BADGE_TIERS } from "./BadgeIcon";
import { BadgeCertificate } from "./BadgeCertificate";

interface CelebrationModalProps {
  userName: string;
  badgeType: BadgeType;
  onClose: () => void;
}

export function CelebrationModal({ userName, badgeType, onClose }: CelebrationModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const info = BADGE_TIERS[badgeType];

  useEffect(() => {
    // Fire confetti!
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleDownload = async () => {
    const certElement = document.getElementById(`certificate-${badgeType}`);
    if (!certElement) return;

    setDownloading(true);
    try {
      // Temporariamente remove classes que podem esconder o elemento ou forçar tamanho minúsculo se estiver fora da tela
      const canvas = await html2canvas(certElement, {
        scale: 2, // 2x para alta resolução (2160x2160)
        useCORS: true,
        backgroundColor: "#09090b",
      });
      
      const link = document.createElement("a");
      link.download = `PulsePay_Achievement_${badgeType}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate certificate", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <div className="absolute top-6 right-6">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
          <X className="h-8 w-8" />
        </button>
      </div>

      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center">
        {/* Left share/text */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            Nova Conquista Desbloqueada
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Parabéns, <br /> <span className="text-primary">{userName}!</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-md">
            Você atingiu o marco de <span className="text-white font-bold">{badgeType.replace("BADGE_", "")}</span> em vendas. 
            Sua dedicação e resultados são inspiradores.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-white text-black font-black px-6 py-4 rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {downloading ? "Gerando..." : "Baixar Plaquinha"}
            </button>
            <button
               onClick={() => { navigator.clipboard.writeText(`https://PulsePay.com.br/share/${badgeType}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
               className="flex items-center gap-2 bg-slate-800 text-white font-black px-6 py-4 rounded-2xl hover:bg-slate-700 transition-all"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Share2 className="h-5 w-5" />}
              Compartilhar link
            </button>
          </div>
          
          <p className="mt-8 text-xs text-slate-500 flex items-center gap-2 uppercase tracking-widest font-bold">
            <Camera className="h-4 w-4" />
            Poste nos stories e marque @pulsepay.oficial
          </p>
        </div>

        {/* Right Preview (scaled down certificate) */}
        <div className="flex-shrink-0 relative group">
          <div 
            className="rounded-3xl border-4 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ borderColor: info.color + "44", width: "400px", height: "400px" }}
          >
            {/* O Elemento real que o html2canvas vai ler (escondido ou em escala) */}
            <div className="absolute left-0 top-0 origin-top-left scale-[0.3703]"> 
              <BadgeCertificate userName={userName} badgeType={badgeType} revenue={undefined} />
            </div>
          </div>
          
          {/* Floating badge icon reflection */}
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-3xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center animate-bounce shadow-2xl">
            <info.icon size={48} color={info.color} />
          </div>
        </div>
      </div>
    </div>
  );
}
