"use client";

import { BadgeType } from "@/lib/constants/badges";
import { BADGE_TIERS } from "./BadgeIcon";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BadgeCertificateProps {
  userName: string;
  badgeType: BadgeType;
  earnedAt?: Date;
  revenue?: number;
}

export function BadgeCertificate({ userName, badgeType, earnedAt = new Date(), revenue }: BadgeCertificateProps) {
  const info = BADGE_TIERS[badgeType];
  const dateStr = format(earnedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Pega o valor do marco (ex: 10K) removendo "Badge_" do enum
  const milestone = badgeType.replace("BADGE_", "");

  return (
    <div
      id={`certificate-${badgeType}`}
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: "1080px",
        height: "1080px",
        background: "#09090b", // slate-950
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background patterns */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${info.color}22 0%, transparent 70%)`
        }}
      />
      
      {/* Border with glow */}
      <div 
        className="absolute inset-12 border-4 rounded-[60px]"
        style={{
          borderColor: `${info.color}33`,
          boxShadow: `inset 0 0 100px ${info.color}11`
        }}
      />

      {/* Content */}
      <div className="z-10 text-center flex flex-col items-center px-24">
        {/* Platform Logo */}
        <div className="flex items-center gap-4 mb-20 animate-fade-in">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white rounded-lg rotate-45" />
          </div>
          <span className="text-4xl font-black text-white tracking-widest uppercase">PulsePay</span>
        </div>

        {/* The Badge Icon */}
        <div className="relative mb-16">
          <div 
            className="w-72 h-72 rounded-[40px] flex items-center justify-center border-4"
            style={{ 
              backgroundColor: info.bgColor.replace("bg-", "#").replace("/10", "11"), 
              borderColor: info.borderColor.replace("border-", "#").replace("/30", "44"),
              boxShadow: `0 0 80px ${info.glowColor}`
            }}
          >
            <info.icon size={120} color={info.color} strokeWidth={2.5} />
          </div>
          
          {/* Milestone Label */}
          <div 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-10 py-4 rounded-full border-2 font-black text-3xl"
            style={{ backgroundColor: "#09090b", borderColor: info.color, color: info.color }}
          >
            MARCO {milestone}
          </div>
        </div>

        {/* Certificate Text */}
        <p className="text-slate-500 text-2xl uppercase tracking-[0.3em] font-bold mb-6">Certificado de Conquista</p>
        <h2 className="text-white text-7xl font-black mb-12 leading-tight">
          {userName}
        </h2>
        
        <p className="text-slate-400 text-3xl max-w-2xl leading-relaxed mb-16">
          Por ter atingido o volume extraordinário de <span className="text-white font-black">R$ {revenue?.toLocaleString("pt-BR") ?? milestone.replace("K", ".000").replace("M", ".000.000")}</span> em vendas liquidadas na plataforma PulsePay.
        </p>

        {/* Footer info */}
        <div className="flex items-center justify-between w-full mt-10">
          <div className="text-left">
            <p className="text-slate-600 text-sm uppercase tracking-widest font-bold">Data da Conquista</p>
            <p className="text-white text-xl font-bold">{dateStr}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600 text-sm uppercase tracking-widest font-bold">Autenticidade</p>
            <p className="text-primary text-xl font-bold">pulsepay.com.br/verify</p>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 opacity-10"
        style={{
          background: `radial-gradient(circle at top right, ${info.color} 0%, transparent 70%)`
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 opacity-10"
        style={{
          background: `radial-gradient(circle at bottom left, ${info.color} 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
