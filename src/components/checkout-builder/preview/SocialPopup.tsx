"use client";

import { useEffect, useState } from "react";
import { PopupInterval } from "@/types/checkout-config";

const BR_NAMES = ["Ana P.", "Carlos S.", "Fernanda L.", "João S.", "Mariana C.", "Pedro A.", "Juliana R.", "Rafael M.", "Camila F.", "Lucas O."];
const BR_CITIES = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Porto Alegre, RS", "Curitiba, PR", "Fortaleza, CE"];

interface Props {
  interval: PopupInterval;
}

// Cores 100% via var(--checkout-*) herdadas do CheckoutThemeProvider.
export function SocialPopup({ interval }: Props) {
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
    const safeInterval = Number(interval) || 10;
    const initial = setTimeout(show, 2000);
    const recurring = setInterval(show, safeInterval * 1000);
    return () => { clearTimeout(initial); clearInterval(recurring); };
  }, [interval]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-300"
      style={{
        background: "var(--checkout-surface-elevated)",
        border: "1px solid var(--checkout-border)",
        backdropFilter: "blur(12px)",
        maxWidth: 280,
      }}
    >
      <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold"
        style={{ background: "var(--checkout-accent)", color: "var(--checkout-accent-foreground)" }}>
        ✓
      </div>
      <div>
        <p className="text-xs font-bold leading-tight" style={{ color: "var(--checkout-text-primary)" }}>{data.name} de {data.city}</p>
        <p className="text-[11px]" style={{ color: "var(--checkout-text-secondary)" }}>acabou de comprar!</p>
      </div>
    </div>
  );
}
