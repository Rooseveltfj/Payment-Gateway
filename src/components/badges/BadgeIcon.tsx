"use client";

import { BadgeType } from "@/lib/constants/badges";
import { Award, Shield, Star, Diamond, Zap, Crown } from "lucide-react";

export type BadgeTierInfo = {
  id: BadgeType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  glowColor: string;
};

export const BADGE_TIERS: Record<BadgeType, BadgeTierInfo> = {
  [BadgeType.BADGE_10K]: {
    id: BadgeType.BADGE_10K,
    label: "Plaquinha Prata 10K",
    color: "#94a3b8", // slate-400
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-400/30",
    icon: Shield,
    glowColor: "rgba(148, 163, 184, 0.3)",
  },
  [BadgeType.BADGE_50K]: {
    id: BadgeType.BADGE_50K,
    label: "Plaquinha Ouro 50K",
    color: "#f59e0b", // amber-500
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Award,
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  [BadgeType.BADGE_100K]: {
    id: BadgeType.BADGE_100K,
    label: "Diamante Azul 100K",
    color: "#3b82f6", // blue-500
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Diamond,
    glowColor: "rgba(59, 130, 246, 0.5)",
  },
  [BadgeType.BADGE_500K]: {
    id: BadgeType.BADGE_500K,
    label: "Diamante Roxo 500K",
    color: "#8b5cf6", // violet-500
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    icon: Zap,
    glowColor: "rgba(139, 92, 246, 0.6)",
  },
  [BadgeType.BADGE_1M]: {
    id: BadgeType.BADGE_1M,
    label: "Platina 1M",
    color: "#ec4899", // pink-500
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    icon: Star,
    glowColor: "rgba(236, 72, 153, 0.7)",
  },
  [BadgeType.BADGE_5M]: {
    id: BadgeType.BADGE_5M,
    label: "Black Elite 5M",
    color: "#ffffff",
    bgColor: "bg-slate-900",
    borderColor: "border-amber-500/50",
    icon: Crown,
    glowColor: "rgba(245, 158, 11, 0.8)",
  },
};

export function BadgeIcon({ tier, size = 48, locked = false }: { tier: BadgeType; size?: number; locked?: boolean }) {
  const info = BADGE_TIERS[tier];
  if (!info) return null;

  const Icon = info.icon;

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl border transition-all duration-300 ${
        locked ? "grayscale opacity-30 border-slate-800 bg-slate-900" : `${info.bgColor} ${info.borderColor}`
      }`}
      style={{
        width: size,
        height: size,
        boxShadow: locked ? "none" : `0 0 20px ${info.glowColor}`,
      }}
    >
      <Icon size={size * 0.5} color={locked ? "#475569" : info.color} strokeWidth={2.5} />
      
      {!locked && (
        <div 
          className="absolute inset-0 rounded-2xl animate-pulse" 
          style={{ background: `radial-gradient(circle, ${info.glowColor} 0%, transparent 70%)` }}
        />
      )}
    </div>
  );
}
