"use client";

import { useEffect, useState } from "react";
import { PopupInterval } from "@/types/checkout-config";

const BR_NAMES = ["Ana P.", "Carlos S.", "Fernanda L.", "João S.", "Mariana C.", "Pedro A.", "Juliana R.", "Rafael M.", "Camila F.", "Lucas O."];
const BR_CITIES = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Porto Alegre, RS", "Curitiba, PR", "Fortaleza, CE"];

interface Props {
  interval: PopupInterval;
  primaryColor: string;
}

export function SocialPopup({ interval, primaryColor }: Props) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: BR_NAMES[0], city: BR_CITIES[0] });

  useEffect(() => {
    const show = () => {
      setData({
        name: BR_NAMES[Math.floor(Math.random() * BR_NAMES.length)],
        city: BR_CITIES[Math.floor(Math.random() * BR_CITIES.length)],
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    // Garantir fallback de 10s caso interval seja undefined/resolva em NaN, evitando loops imediatos
    const safeInterval = Number(interval) || 10;
    
    // First popup after 2s
    const initial = setTimeout(show, 2000);
    const recurring = setInterval(show, safeInterval * 1000);

    return () => {
      clearTimeout(initial);
      clearInterval(recurring);
    };
  }, [interval]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all animate-in slide-in-from-bottom-4 duration-300"
      style={{
        background: "rgba(9,9,11,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        maxWidth: 280,
      }}
    >
      <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold"
        style={{ background: primaryColor, color: "#fff" }}>
        🟢
      </div>
      <div>
        <p className="text-xs font-bold text-white leading-tight">{data.name} de {data.city}</p>
        <p className="text-[11px] text-zinc-400">acabou de comprar!</p>
      </div>
    </div>
  );
}
