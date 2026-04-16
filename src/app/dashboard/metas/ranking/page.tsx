"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, ArrowLeft, ArrowUpRight, User } from "lucide-react";
import { BadgeIcon } from "@/components/badges/BadgeIcon";
import { BadgeType } from "@/lib/constants/badges";
import Link from "next/link";

interface RankingUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalEarnings: number;
  currentBadge: BadgeType | null;
}

export default function RankingPage() {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/metas/ranking");
      setUsers(await r.json());
      
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.id) setCurrentUserId(session.user.id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen" style={{ background: "#060608", color: "#e2e8f0" }}>
      <div className="pl-60 pt-16">
        <div className="px-8 py-10 max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <Link href="/dashboard/metas" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-4">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Metas
              </Link>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                Ranking Black Gate
                <Trophy className="h-8 w-8 text-amber-500" />
              </h1>
              <p className="text-slate-500 mt-2">Os 50 players com maior faturamento da rede.</p>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-[32px] overflow-hidden">
            <div className="p-8 pb-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Posição</th>
                    <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Player</th>
                    <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Nível Atual</th>
                    <th className="pb-6 text-xs font-bold text-slate-500 uppercase tracking-widest px-4 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="py-6 h-16 bg-slate-900/20 rounded-xl mb-2" />
                      </tr>
                    ))
                  ) : (
                    users.map((u, index) => {
                      const isMe = currentUserId === u.id;
                      const place = index + 1;
                      
                      return (
                        <tr 
                          key={u.id} 
                          className={`transition-colors group hover:bg-slate-800/20 ${isMe ? "bg-primary/10" : ""}`}
                        >
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-xl font-black ${
                                place === 1 ? "text-amber-500" :
                                place === 2 ? "text-slate-400" :
                                place === 3 ? "text-amber-700" : "text-slate-600"
                              }`}>
                                #{place}
                              </span>
                              {place <= 3 && <Medal className={`h-4 w-4 ${
                                place === 1 ? "text-amber-500" :
                                place === 2 ? "text-slate-400" : "text-amber-700"
                              }`} />}
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                                {u.avatarUrl ? (
                                  <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                                ) : (
                                  <User className="h-5 w-5 text-slate-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-200">{u.name}</p>
                                {isMe && <span className="text-[10px] bg-primary text-white font-black px-1.5 py-0.5 rounded uppercase">Você</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            {u.currentBadge ? (
                              <div className="flex items-center gap-3">
                                <BadgeIcon tier={u.currentBadge} size={32} />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
                                  {u.currentBadge.replace("BADGE_", "")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-slate-600">Iniciante</span>
                            )}
                          </td>
                          <td className="py-5 px-4 text-right">
                            <span className="font-mono text-white font-bold">
                              R$ {u.totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {!loading && users.length === 0 && (
                <div className="py-20 text-center text-slate-500 font-medium">
                  Nenhum player faturou ainda. Seja o primeiro!
                </div>
              )}
            </div>

            {/* User Position Sticky Footer (Only if not in top 50) */}
            {currentUserId && !users.find(u => u.id === currentUserId) && (
              <div className="bg-slate-900 border-t border-slate-800 p-6 flex justify-between items-center bg-gradient-to-r from-slate-900 to-primary/5">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-black">?</div>
                   <div>
                     <p className="text-white font-bold">Você ainda não está no Top 50</p>
                     <p className="text-slate-500 text-xs font-medium">Continue vendendo para subir no ranking.</p>
                   </div>
                </div>
                <Link href="/dashboard/metas" className="flex items-center gap-2 text-primary text-sm font-bold hover:underline">
                  Ver meu progresso
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="p-8 text-center bg-slate-950/50">
               <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Atualizado a cada 60 minutos</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
