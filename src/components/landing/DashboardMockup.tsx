"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardMockupProps {
  mouseX: any;
  mouseY: any;
}

export function DashboardMockup({ mouseX, mouseY }: DashboardMockupProps) {
  const { scrollY } = useScroll();
  const notebookY = useTransform(scrollY, [0, 600], [0, -80]);
  const notebookOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);

  // Spring animation for smooth mouse parallax
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-8, 8]), { stiffness: 100, damping: 30 });

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);
  const values = ["R$ 497,00", "R$ 97,00", "R$ 1.490,00", "R$ 197,00"];
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setNotification(`💚 Nova venda · +${values[index]}`);
      index = (index + 1) % values.length;
      
      setTimeout(() => setNotification(null), 1500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes notebookFloat {
          0%, 100% { transform: translateY(0px) rotateX(2deg) rotateY(-2deg); }
          50% { transform: translateY(-12px) rotateX(2deg) rotateY(-2deg); }
        }
        .notebook-float-anim {
          animation: notebookFloat 4s ease-in-out infinite;
          animation-delay: 1.5s;
          /* Keep starting position until animation begins */
          transform: translateY(0px) rotateX(2deg) rotateY(-2deg);
        }
      `}} />
      
      <motion.div
        style={{ y: notebookY, opacity: notebookOpacity, transformPerspective: 1200 }}
        className="relative w-full max-w-[680px] mx-auto md:-mr-[60px] lg:-mr-[80px]"
      >
        <motion.div
          initial={{ y: 80, opacity: 0, rotateX: 15 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <motion.div style={{ rotateX, rotateY }}>
            <div className="notebook-float-anim relative w-full">
              
              {/* Tampa do Notebook */}
              <div style={{
                background: "linear-gradient(145deg, #1a1a2e 0%, #0d0d1a 100%)",
                borderRadius: "16px 16px 0 0",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 -2px 0 rgba(255,255,255,0.05) inset",
              }} className="w-full aspect-[68/42] p-3 flex flex-col relative z-10">
                
                {/* Tela */}
                <div className="flex-1 bg-[#030307] rounded-lg overflow-hidden border-[2px] border-black flex">
                  
                  {/* Sidebar esquerda */}
                  <div className="w-[80px] sm:w-[120px] bg-[#07070f] border-r border-white/5 flex flex-col items-center py-4 gap-4 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                       <span className="text-[10px] font-bold text-accent italic">PP</span>
                    </div>
                    
                    <div className="w-full px-3 space-y-3 mt-2">
                       <div className="flex items-center gap-2 bg-accent/5 py-1 px-1.5 rounded">
                           <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0" />
                           <div className="h-1 flex-1 bg-accent/80 rounded-full hidden sm:block" />
                       </div>
                       <div className="flex items-center gap-2 px-1.5">
                           <div className="w-3 h-3 rounded-full bg-white/10 flex-shrink-0" />
                           <div className="h-1 w-8 bg-white/10 rounded-full hidden sm:block" />
                       </div>
                       <div className="flex items-center gap-2 px-1.5">
                           <div className="w-3 h-3 rounded-full bg-white/10 flex-shrink-0" />
                           <div className="h-1 w-10 bg-white/10 rounded-full hidden sm:block" />
                       </div>
                    </div>
                  </div>
                  
                  {/* Conteúdo à direita */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Topbar */}
                    <div className="h-[36px] bg-[#07070f] border-b border-white/5 px-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                             <div className="w-4 h-4 rounded bg-white/5" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">R</div>
                    </div>
                    
                    {/* View Principal */}
                    <div className="flex-1 bg-[#09090f] p-3 sm:p-4 flex flex-col">
                       <div className="mb-3">
                         <p className="text-white text-[12px] font-bold">Olá, Rafael 👋</p>
                       </div>
                       
                       {/* Métricas */}
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                           <div className="h-[44px] bg-[#0f0f1a] border border-white/5 rounded-lg flex flex-col justify-center px-3 relative overflow-hidden">
                               <p className="text-[8px] text-white/50 mb-0.5">SALDO DISPONÍVEL</p>
                               <p className="text-[12px] text-success font-bold font-mono">R$ 12.847,00</p>
                               <div className="absolute right-[-10px] top-[-10px] w-8 h-8 rounded-full bg-success/10 blur-xl" />
                           </div>
                           <div className="h-[44px] bg-[#0f0f1a] border border-white/5 rounded-lg flex flex-col justify-center px-3">
                               <p className="text-[8px] text-white/50 mb-0.5">VENDAS HOJE</p>
                               <p className="text-[12px] text-white font-bold font-mono">47</p>
                           </div>
                           <div className="h-[44px] bg-[#0f0f1a] border border-white/5 rounded-lg flex flex-col justify-center px-3 hidden sm:flex">
                               <p className="text-[8px] text-white/50 mb-0.5">CONVERSÃO</p>
                               <p className="text-[12px] text-white font-bold font-mono">94%</p>
                           </div>
                       </div>
                       
                       {/* Gráfico */}
                       <div className="h-[40px] sm:h-[60px] bg-accent/5 rounded-lg relative overflow-hidden flex items-end mb-4 border border-accent/10">
                            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                               <path d="M0,80 Q 50,20 100,60 T 200,40 T 300,10 T 400,50 L400,100 L0,100 Z" fill="url(#grad)" opacity="0.1" />
                               <path d="M0,80 Q 50,20 100,60 T 200,40 T 300,10 T 400,50" fill="none" stroke="var(--accent)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                               <defs>
                                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="0%" stopColor="var(--accent)" />
                                     <stop offset="100%" stopColor="transparent" />
                                  </linearGradient>
                               </defs>
                            </svg>
                       </div>
                       
                       {/* Tabela */}
                       <div className="flex-1 flex flex-col justify-end">
                           <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                               <div className="flex items-center gap-1.5 text-[8px] text-white/50"><div className="w-1.5 h-1.5 rounded-full bg-success" /> PIX · Pedro S.</div>
                               <div className="text-[10px] text-success font-bold font-mono">+R$ 297,00</div>
                           </div>
                           <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                               <div className="flex items-center gap-1.5 text-[8px] text-white/50"><div className="w-1.5 h-1.5 rounded-full bg-success" /> PIX · Mariana L.</div>
                               <div className="text-[10px] text-success font-bold font-mono">+R$ 97,00</div>
                           </div>
                           <div className="flex justify-between items-center py-1.5 border-b border-white/5 hidden sm:flex">
                               <div className="flex items-center gap-1.5 text-[8px] text-white/50"><div className="w-1.5 h-1.5 rounded-full bg-success" /> PIX · Carlos J.</div>
                               <div className="text-[10px] text-success font-bold font-mono">+R$ 1.490,00</div>
                           </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dobradiça (Base do Notebook) */}
              <div style={{
                height: "16px",
                background: "linear-gradient(to bottom, #1a1a2e, #111120)",
                borderRadius: "0 0 4px 4px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }} className="w-full flex justify-center items-start pt-[4px] relative z-10">
                 <div style={{
                     height: "4px",
                     background: "#222236",
                     width: "120px",
                     borderRadius: "2px"
                 }} className="sm:w-[200px]" />
              </div>

              {/* Reflexo (Sombra) */}
              <div style={{
                height: "20px",
                background: "linear-gradient(to bottom, rgba(139,92,246,0.06) 0%, transparent 100%)",
                filter: "blur(8px)",
                marginTop: "-4px"
              }} className="w-full absolute z-0" />
              
              {/* Notificação Flutuante */}
              <AnimatePresence>
                {notification && (
                    <motion.div
                        key={notification}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="absolute bottom-10 -left-6 sm:-left-12 bg-[#0f0f1a] border border-success/30 rounded-lg px-3 py-2 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.08)] whitespace-nowrap"
                    >
                        <span className="text-[12px] font-medium text-white">{notification}</span>
                    </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
