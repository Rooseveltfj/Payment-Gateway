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

  return (
    <div className={`rounded-xl p-4 space-y-2 ${isUrgent ? "bg-red-950/40 border border-red-500/40" : "bg-white/5 border border-white/10"}`}>
      <p className="text-xs font-semibold text-center" style={{ color: isUrgent ? "#f87171" : "#a1a1aa" }}>
        {config.countdown.label}
      </p>
      <div className="flex items-center justify-center gap-3">
        {segments.map(([label, value], i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="text-center">
              <div
                className="text-3xl font-bold font-mono tabular-nums rounded-lg px-3 py-2 min-w-[60px]"
                style={{
                  background: isUrgent ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                  color: isUrgent ? "#f87171" : "#f4f4f5",
                  border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`
                }}
              >
                {pad(value as number)}
              </div>
              <span className="text-[10px] uppercase tracking-widest mt-1 block" style={{ color: isUrgent ? "#f87171" : "#71717a" }}>
                {label}
              </span>
            </div>
            {i < segments.length - 1 && (
              <span className="text-2xl font-bold mb-4" style={{ color: isUrgent ? "#f87171" : "#52525b" }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
