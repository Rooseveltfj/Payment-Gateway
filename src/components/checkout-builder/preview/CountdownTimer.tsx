"use client";

import { useEffect, useState } from "react";
import { ScarcityConfig } from "@/types/checkout-config";

interface Props {
  config: ScarcityConfig;
}

function getDurationMs(config: ScarcityConfig): number {
  const d = config.countdown.duration;
  if (d === "10min") return 10 * 60;
  if (d === "30min") return 30 * 60;
  if (d === "1h") return 60 * 60;
  if (d === "24h") return 24 * 60 * 60;
  return (config.countdown.customMinutes || 30) * 60;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function CountdownTimer({ config }: Props) {
  const [seconds, setSeconds] = useState(() => getDurationMs(config));

  useEffect(() => {
    setSeconds(getDurationMs(config));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.countdown.duration, config.countdown.customMinutes]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const isUrgent = config.countdown.style === "urgent";

  const segments = h > 0
    ? [["H", h], ["M", m], ["S", s]]
    : [["M", m], ["S", s]];

  // Cores 100% via var(--checkout-*). "urgent" apenas realça com o accent do tema.
  const accentText = isUrgent ? "var(--checkout-accent)" : "var(--checkout-text-secondary)";
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--checkout-surface-elevated)", border: "1px solid var(--checkout-border)" }}>
      <p className="text-xs font-semibold text-center" style={{ color: accentText, fontFamily: "var(--checkout-font-mono)" }}>
        {config.countdown.label}
      </p>
      <div className="flex items-center justify-center gap-3">
        {segments.map(([label, value], i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="text-center">
              <div
                className="text-3xl font-bold tabular-nums rounded-lg px-3 py-2 min-w-[60px]"
                style={{
                  background: "var(--checkout-badge-background)",
                  color: isUrgent ? "var(--checkout-accent)" : "var(--checkout-text-primary)",
                  border: "1px solid var(--checkout-border)",
                  fontFamily: "var(--checkout-font-mono)",
                }}
              >
                {pad(value as number)}
              </div>
              <span className="text-[10px] uppercase tracking-widest mt-1 block" style={{ color: accentText }}>
                {label}
              </span>
            </div>
            {i < segments.length - 1 && (
              <span className="text-2xl font-bold mb-4" style={{ color: accentText }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
