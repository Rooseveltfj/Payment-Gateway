"use client";

import { useState, useEffect } from "react";
import { 
  Award, 
  TrendingUp, 
  Star, 
  ChevronRight, 
  Lock, 
  Download,
  Info,
  CheckCircle2
} from "lucide-react";
import { BadgeType, BADGE_ORDER, BADGE_THRESHOLDS } from "@/lib/constants/badges";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetasStats {
  totalEarnings: number;
  badges: { badge: BadgeType; earnedAt: string }[];
  nextBadge: BadgeType | null;
  nextThreshold: number | null;
  progress: number;
}

const BADGE_CONFIG: Record<BadgeType, { emoji: string; label: string; borderColor: string; glow?: string }> = {
  [BadgeType.BADGE_10K]: { 
    emoji: "🥈", 
    label: "Plaquinha Prata", 
    borderColor: "rgba(148,163,184,0.4)" 
  },
  [BadgeType.BADGE_50K]: { 
    emoji: "🥇", 
    label: "Plaquinha Ouro", 
    borderColor: "rgba(251,191,36,0.4)" 
  },
  [BadgeType.BADGE_100K]: { 
    emoji: "💎", 
    label: "Diamante Azul", 
    borderColor: "rgba(96,165,250,0.4)" 
  },
  [BadgeType.BADGE_500K]: { 
    emoji: "💜", 
    label: "Diamante Roxo", 
    borderColor: "rgba(139,92,246,0.5)" 
  },
  [BadgeType.BADGE_1M]: { 
    emoji: "⭐", 
    label: "Plaquinha Platina", 
    borderColor: "rgba(226,232,240,0.5)" 
  },
  [BadgeType.BADGE_5M]: { 
    emoji: "👑", 
    label: "Plaquinha Elite", 
    borderColor: "rgba(251,191,36,0.6)",
    glow: "0 0 20px rgba(251,191,36,0.3)"
  },
};

export default function MetasPage() {
  const [stats, setStats] = useState<MetasStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/metas");
      const data = await r.json();
      setStats(data);
    } catch {
      console.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 bg-[#0f0f1a] rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-[#0f0f1a] rounded-[24px]" />)}
        </div>
      </div>
    );
  }

  const earnedBadgeTypes = new Set(stats.badges.map(b => b.badge));
  const remainingToNext = stats.nextThreshold ? stats.nextThreshold - stats.totalEarnings : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h1 className="text-[28px] font-bold text-[#f1f5f9] tracking-tight">Plaquinhas de Meta</h1>
        <p className="text-[14px] text-[#64748b]">Conquistas que marcam sua jornada como player.</p>
      </div>

      {/* PROGRESS CARD (DESTAKE) */}
      <Card className="p-8 bg-[#0f0f1a] border-[#8b5cf633] rounded-[32px] relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <TrendingUp className="h-48 w-48 text-[#8b5cf6]" />
         </div>
         
         <div className="relative z-10 space-y-8">
            <div className="space-y-2">
               <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">Faturamento Total Atual</p>
               <h2 className="text-[42px] font-bold text-[#f1f5f9] tracking-tight leading-none">
                 R$ {stats.totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
               </h2>
            </div>

            {stats.nextBadge && (
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-[#a78bfa]" />
                        <span className="text-[#f1f5f9] font-bold">Próxima meta: {BADGE_CONFIG[stats.nextBadge]?.label}</span>
                     </div>
                     <span className="text-[#8b5cf6] font-bold tracking-tighter">
                        Faltam R$ {remainingToNext.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                     </span>
                  </div>
                  
                  <div className="space-y-2">
                     <div className="h-3 w-full bg-[#8b5cf615] rounded-full overflow-hidden border border-white/[0.03]">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                     </div>
                     <p className="text-[11px] text-[#64748b] font-medium text-right">
                        {stats.progress.toFixed(1)}% concluído
                     </p>
                  </div>
               </div>
            )}
         </div>
      </Card>

      {/* BADGES GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {BADGE_ORDER.map((badgeType) => {
            const config = BADGE_CONFIG[badgeType];
            const isEarned = earnedBadgeTypes.has(badgeType);
            const badgeData = stats.badges.find(b => b.badge === badgeType);
            const threshold = BADGE_THRESHOLDS[badgeType];

            return (
               <Card 
                  key={badgeType}
                  style={{ 
                    borderColor: isEarned ? config.borderColor : "rgba(255,255,255,0.05)",
                    boxShadow: isEarned ? config.glow : "none"
                  }}
                  className={cn(
                    "relative p-8 flex flex-col items-center text-center transition-all duration-500 overflow-hidden",
                    "bg-[#0f0f1a] rounded-[24px] border-2",
                    !isEarned && "opacity-40 grayscale-[0.8]"
                  )}
               >
                  {/* Status Overlay */}
                  {!isEarned && (
                     <div className="absolute top-4 right-4 h-7 px-3 bg-white/5 border border-white/5 rounded-full flex items-center justify-center gap-1.5 backdrop-blur-md">
                        <Lock className="h-3 w-3 text-[#64748b]" />
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Bloqueado</span>
                     </div>
                  )}

                  {isEarned && (
                     <div className="absolute top-4 right-4">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500/50" />
                     </div>
                  )}

                  <div className="mb-6 relative">
                     <span className="text-[56px] leading-none drop-shadow-2xl select-none">{config.emoji}</span>
                     {isEarned && (
                        <div className="absolute inset-0 bg-white/20 blur-2xl opacity-20 -z-10" />
                     )}
                  </div>

                  <h3 className={cn(
                    "text-xl font-bold tracking-tight mb-1",
                    isEarned ? "text-[#f1f5f9]" : "text-[#64748b]"
                  )}>
                    {config.label}
                  </h3>
                  
                  <p className="text-[13px] font-bold text-[#8b5cf6]/80 font-mono mb-4">
                     R$ {threshold >= 1000000 ? `${threshold/1000000}M` : `${threshold/1000}k`}
                  </p>

                  <div className="mt-auto w-full pt-4 space-y-4">
                     {isEarned ? (
                        <>
                           <div className="text-[11px] text-[#64748b] space-y-0.5">
                              <p>Conquistada em</p>
                              <p className="font-bold text-[#f1f5f9]/60">{new Date(badgeData!.earnedAt).toLocaleDateString()}</p>
                           </div>
                           <Button variant="ghost" className="w-full text-[#a78bfa] hover:bg-[#8b5cf61a] hover:text-white h-10 font-bold gap-2 border border-transparent hover:border-[#8b5cf633] transition-all">
                              <Download className="h-4 w-4" />
                              Baixar plaquinha
                           </Button>
                        </>
                     ) : (
                        <div className="py-2">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] bg-white/5 px-4 py-1.5 rounded-full inline-block">
                             Em progresso
                           </p>
                        </div>
                     )}
                  </div>
               </Card>
            );
         })}
      </section>

      {/* FOOTER INFO */}
      <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl flex items-start gap-4">
         <div className="h-10 w-10 rounded-xl bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6] shrink-0">
            <Info className="h-5 w-5" />
         </div>
         <div className="space-y-1">
            <p className="text-sm font-bold text-[#f1f5f9]">Sobre as Conquistas</p>
            <p className="text-xs text-[#64748b] leading-relaxed">
               As plaquinhas são enviadas digitalmente assim que você atinge o faturamento. Placas físicas para metas acima de R$ 500k podem ser solicitadas via suporte após a validação do compliance.
            </p>
         </div>
      </div>
    </div>
  );
}
