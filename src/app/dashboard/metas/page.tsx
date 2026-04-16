"use client";

import { useState, useEffect } from "react";
import { Award, TrendingUp, Star, ChevronRight, Lock } from "lucide-react";
import { BadgeIcon, BADGE_TIERS } from "@/components/badges/BadgeIcon";
import { BadgeType } from "@/lib/constants/badges";
import { CelebrationModal } from "@/components/badges/CelebrationModal";
import { BADGE_ORDER } from "@/lib/constants/badges";

interface MetasStats {
  totalEarnings: number;
  badges: { badge: BadgeType; earnedAt: string }[];
  nextBadge: BadgeType | null;
  nextThreshold: number | null;
  progress: number;
}

export default function MetasPage() {
  const [stats, setStats] = useState<MetasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebratingBadge, setCelebratingBadge] = useState<BadgeType | null>(null);
  const [userName, setUserName] = useState("Player");

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/metas");
      const data = await r.json();
      setStats(data);
      
      // Também pega o nome do usuário
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.name) setUserName(session.user.name);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen pl-60 pt-20" style={{ background: "#09090b" }}>
        <div className="p-8 animate-pulse">
           <div className="h-40 bg-slate-900 rounded-3xl mb-8" />
           <div className="grid grid-cols-3 gap-6">
             {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-900 rounded-3xl" />
             ))}
           </div>
        </div>
      </div>
    );
  }

  const earnedBadgeTypes = new Set(stats.badges.map(b => b.badge));
  const remainingToNext = stats.nextThreshold ? stats.nextThreshold - stats.totalEarnings : 0;

  return (
    <div className="min-h-screen" style={{ background: "#060608", color: "#e2e8f0" }}>
      <div className="pl-60 pt-16">
        <div className="px-8 py-10 max-w-6xl">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            
            {/* Main Stats Card */}
            <div className="flex-1 bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-[32px] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <TrendingUp className="h-32 w-32 text-primary" />
               </div>
               
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Faturamento Total</p>
               <h1 className="text-5xl font-black text-white mb-8">
                 R$ {stats.totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
               </h1>

               {stats.nextBadge && (
                 <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-400 font-semibold italic">Próximo Marco: {stats.nextBadge.replace("BADGE_", "")}</span>
                     <span className="text-primary font-bold">Faltam R$ {remainingToNext.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-700/50">
                     <div 
                       className="h-full bg-gradient-to-r from-primary to-primary/40 rounded-full transition-all duration-1000"
                       style={{ width: `${stats.progress}%` }}
                     />
                   </div>
                 </div>
               )}
            </div>

            {/* Quick Stats */}
            <div className="w-full md:w-80 flex flex-col gap-4">
              <a href="/dashboard/metas/ranking" className="flex-1 bg-slate-900/50 border border-slate-800 hover:border-primary/50 rounded-3xl p-6 flex items-center justify-between group transition-all">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Ranking</p>
                  <p className="text-white font-black text-xl flex items-center gap-2">
                    Top 50 Players
                    <Award className="h-4 w-4 text-amber-400" />
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-600 group-hover:text-primary transition-colors" />
              </a>
              <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Conquistas</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-2xl">{stats.badges.length}</span>
                  <span className="text-slate-500 text-sm">de 6 plaquinhas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BADGE_ORDER.map((badgeType) => {
              const info = BADGE_TIERS[badgeType];
              const isEarned = earnedBadgeTypes.has(badgeType);
              const badgeData = stats.badges.find(b => b.badge === badgeType);

              return (
                <div 
                  key={badgeType}
                  className={`relative bg-slate-900/40 border-2 rounded-[32px] p-8 flex flex-col items-center transition-all duration-500 hover:scale-[1.02] ${
                    isEarned ? "border-slate-800" : "border-transparent bg-slate-900/20"
                  }`}
                >
                  {/* Status Badge */}
                  {!isEarned && (
                     <div className="absolute top-6 right-6 text-slate-700">
                       <Lock className="h-5 w-5" />
                     </div>
                  )}

                  <div className="mb-6">
                    <BadgeIcon tier={badgeType} size={100} locked={!isEarned} />
                  </div>

                  <h3 className={`text-xl font-black mb-2 ${isEarned ? "text-white" : "text-slate-600"}`}>
                    {info.label.split(" ").slice(1).join(" ")}
                  </h3>
                  
                  {isEarned ? (
                    <>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">
                        Conquistado em {new Date(badgeData!.earnedAt).toLocaleDateString("pt-BR")}
                      </p>
                      <button 
                        onClick={() => setCelebratingBadge(badgeType)}
                        className="mt-auto w-full py-4 rounded-2xl bg-slate-800 text-white text-sm font-black hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Ver Detalhes
                        <Star className="h-4 w-4 text-primary" />
                      </button>
                    </>
                  ) : (
                    <p className="text-slate-700 text-sm font-bold uppercase tracking-widest mt-4">Bloqueado</p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Celebration / Detail Modal */}
      {celebratingBadge && (
        <CelebrationModal 
          userName={userName}
          badgeType={celebratingBadge}
          onClose={() => setCelebratingBadge(null)}
        />
      )}
    </div>
  );
}
