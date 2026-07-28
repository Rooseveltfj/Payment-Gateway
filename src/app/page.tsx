"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useInView, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { PartnerTicker } from "@/components/landing/PartnerTicker";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { 
  ShoppingCart, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Webhook, 
  Trophy, 
  ChevronRight, 
  Menu, 
  X, 
  Play,
  CheckCircle2,
  ArrowRight,
  Code2,
  Globe,
  Database,
  Lock
} from "lucide-react";
import Image from "next/image";
import { IconBrandTabler } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// --- Components Helpers ---

const Counter = ({ value, duration = 2 }: { value: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Extract number and suffix (e.g., "10M+" -> 10, "M+")
  const numericValue = parseFloat(value.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.,]/g, '');

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = numericValue;
      const totalSteps = 60 * duration;
      const increment = end / totalSteps;
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 1000 / 60);
      
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue, duration]);

  const displayCount = value.includes(',') || value.includes('.') 
    ? count.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : count.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  return <span ref={ref}>{displayCount}{suffix}</span>;
};

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-4 h-4 rounded-full bg-success/40 pointer-events-none z-[9999] blur-sm transition-transform duration-75 ease-out"
      style={{ transform: `translate(${position.x - 8}px, ${position.y - 8}px)` }}
    />
  );
};

// --- Main Page ---

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroRef = useRef<HTMLElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-body selection:bg-accent selection:text-white">
      <CustomCursor />
      <motion.div id="scroll-progress" style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-[10001]" />

      {/* --- Navbar --- */}
      <nav className={cn(
        "fixed top-0 w-full z-[1000] border-b transition-all duration-300 bg-[#08090f]",
        isScrolled ? "py-3 border-accent/20 border-b shadow-[0_4px_30px_rgba(191,0,255,0.05)]" : "py-6 border-transparent"
      )}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image 
              src="/assets/logo-png.png" 
              alt="PulsePay Logo" 
              width={160} 
              height={40} 
              className="w-auto h-8 md:h-10 object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            {['Recursos', 'Taxas', 'Para Quem', 'API'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-accent transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="px-5 py-2 text-sm font-semibold text-white border border-white/10 rounded-full hover:bg-white/5 transition-all">
              Entrar
            </Link>
            <Link href="/register" className="px-6 py-2.5 text-sm font-bold text-bg-void bg-success rounded-full hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,230,118,0.2)]">
              Criar conta grátis
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[2000] bg-bg-void p-10 flex flex-col items-center justify-center gap-8"
          >
            <button className="absolute top-10 right-10 text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-8 h-8" />
            </button>
            {['Recursos', 'Taxas', 'Para Quem', 'API'].map((item) => (
              <Link key={item} href="#" className="text-2xl font-display font-bold text-white uppercase italic" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-4 w-full max-w-xs mt-10">
              <Link href="/login" className="px-6 py-4 text-center font-bold text-white border border-white/10 rounded-xl">Entrar</Link>
              <Link href="/register" className="px-6 py-4 text-center font-bold text-bg-void bg-success rounded-xl">Criar conta grátis</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Section 1: Hero --- */}
      <section 
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative min-h-[100vh] md:min-h-[100svh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-[#030307]"
      >
        {/* 1. Hero Video Background System */}
        <div className="absolute inset-0 z-[0]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              times: [0, 0.05, 0.95, 1],
              ease: "easeInOut"
            }}
            className="absolute inset-0 w-full h-full"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster="/assets/video-fallback.jpg"
            >
              <source src="/assets/video-hero.mp4" type="video/mp4" />
            </video>
          </motion.div>
          
          {/* Overlays for readability and integration */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030307]/60 via-[#030307]/70 to-[#030307] z-[1]" />
          <div className="absolute inset-0 backdrop-blur-[8px] bg-[#8b5cf6]/5 z-[2]" />
        </div>

        {/* 2. Particles Orbit (Orbs roxos) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full z-0"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", filter: "blur(80px)" }}
          />
          <motion.div 
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[400px] rounded-full z-0"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(80px)" }}
          />
        </div>
        
        {/* 3. Global Noise / Overlay Texture */}
        <div className="absolute inset-0 opacity-20 z-[3] pointer-events-none grid-dots" />

        <div className="container mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center justify-between w-full h-full max-w-7xl mx-auto">
            {/* Esquerda: Texto */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0 w-full lg:w-[110%] relative z-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-accent font-bold">
                  ⚡ PIX com liquidação D+0 — Split automático em segundos
                </span>
              </motion.div>

              <h1 
                className="font-display mb-8"
                style={{ lineHeight: 1.0, letterSpacing: "-0.03em" }}
              >
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="block text-white"
                  style={{ fontSize: "clamp(48px, 7vw, 82px)", fontWeight: 900 }}
                >
                  O gateway que
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="block text-white"
                  style={{ fontSize: "clamp(48px, 7vw, 82px)", fontWeight: 900 }}
                >
                  seus players
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="block text-[#8b5cf6]"
                  style={{ 
                     fontSize: "clamp(48px, 7vw, 82px)", 
                     fontWeight: 900,
                     textShadow: "0 0 40px rgba(139,92,246,0.3)"
                  }}
                >
                  merecem.
                </motion.span>
              </h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[18px] text-white/55 leading-relaxed mb-12 max-w-[520px] mx-auto lg:mx-0 font-medium"
              >
                Checkout builder completo, split PIX instantâneo e dashboard em tempo real.
                A plataforma que players e afiliados escolhem para escalar.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto"
              >
                <Link href="/register" className="w-full sm:w-auto px-10 h-[60px] flex items-center justify-center gap-3 font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-2xl transition-all scale-100 hover:scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  Criar conta grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#features" className="w-full sm:w-auto px-10 h-[60px] flex items-center justify-center gap-3 font-bold text-white border border-white/10 rounded-2xl hover:bg-white/5 transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                  Ver como funciona
                </Link>
              </motion.div>

              {/* Micro-text */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-xs md:text-sm text-text-muted font-medium mb-10 lg:mb-0">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Sem mensalidade</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Conta em 5 minutos</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Sem cartão</span>
              </div>
            </div>
            
            {/* Direita: Mockup 3D Notebook */}
            <div className="w-full relative z-10 flex items-center justify-center scale-90 sm:scale-100 mt-10 lg:mt-0">
              <DashboardMockup mouseX={mouseX} mouseY={mouseY} />
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Partner Ticker --- */}
      <PartnerTicker />

      {/* --- Section 3: Features --- */}
      <section id="recursos" className="py-32 bg-bg-deep relative overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionHeading
            label="RECURSOS"
            title="Tudo que você precisa."
            subtitle="Desenvolvido por quem entende as dores reais de processar pagamentos no digital."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<ShoppingCart className="w-8 h-8 text-accent" />}
              title="Checkout Builder Visual"
              description="Gatilhos mentais, timer de escassez, prova social, order bump e pixels de rastreamento. Monte em minutos."
              tag="Sem código"
              visual={<div className="h-20 bg-accent/5 rounded-lg border border-accent/10 flex items-center justify-center font-mono text-accent text-xs">TIMER: 04:59</div>}
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-accent" />}
              title="Split PIX instantâneo"
              description="Cada venda divide automaticamente na hora: sua comissão vai pra você, o líquido vai pro player."
              tag="D+0"
              highlight
              visual={<div className="h-20 w-full bg-success/5 rounded-lg border border-success/20 flex flex-col items-center justify-center">
                <div className="w-32 h-1 bg-white/10 rounded-full relative overflow-hidden">
                  <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-success w-1/3" />
                </div>
                <span className="text-[8px] text-success font-bold mt-2">TRANSFÊRENCIA REALTIME</span>
              </div>}
            />
             <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-accent" />}
              title="Dashboard em tempo real"
              description="Aprovadas, pendentes, recusadas, saldo disponível e histórico de saques. Tudo em um painel limpo."
              tag="Live"
              visual={<div className="flex gap-1 h-16 items-end justify-center">
                {[40, 70, 50, 90, 60, 80].map((h, i) => (
                  <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: h }} className="w-2 bg-accent rounded-t-sm" />
                ))}
              </div>}
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-accent" />}
              title="KYC simplificado"
              description="Cadastro em 5 minutos com verificação de documentos. Aprovação rápida para começar a vender."
              tag="5 min"
            />
            <FeatureCard 
              icon={<Code2 className="w-8 h-8 text-accent" />}
              title="API REST + Webhooks"
              description="Documentação completa, sandbox para testes e eventos em tempo real assinado com HMAC."
              tag="REST API"
              visual={<div className="p-3 bg-bg-void rounded border border-white/5 font-mono text-[8px] leading-tight text-text-secondary overflow-hidden h-24">
                <span className="text-accent underline">{"{"}</span><br />
                &nbsp;&nbsp;&quot;event&quot;: &quot;order.paid&quot;,<br />
                &nbsp;&nbsp;&quot;amount&quot;: 29700,<br />
                &nbsp;&nbsp;&quot;status&quot;: &quot;success&quot;<br />
                <span className="text-accent">{"}"}</span>
              </div>}
            />
            <FeatureCard 
              icon={<Trophy className="w-8 h-8 text-accent" />}
              title="Plaquinhas de Meta"
              description="R$10k, R$50k, R$100k, R$1M. Gamificação que motiva seus players a baterem recordes."
              tag="Gamificação"
              visual={<div className="flex gap-3 justify-center">
                <div className="w-8 h-10 bg-slate-400 rounded-sm border-t-4 border-slate-300 shadow-lg" />
                <div className="w-8 h-10 bg-yellow-400 rounded-sm border-t-4 border-yellow-200 shadow-lg scale-110" />
                <div className="w-8 h-10 bg-blue-400 rounded-sm border-t-4 border-blue-200 shadow-lg" />
              </div>}
            />
          </div>
        </div>
      </section>

      {/* --- Section 4: Steps --- */}
      <section className="py-32 bg-bg-void relative border-y border-white/5">
        <div className="container mx-auto px-6">
          <SectionHeading
            label="COMO FUNCIONA"
            title="Três passos para escalar."
            subtitle="Da criação da conta até o primeiro split em menos de um dia."
            align="center"
          />
          <div className="space-y-40">
             <StepItem 
              num="01" 
              title="Crie sua conta em 5 minutos" 
              description="Cadastro simplificado para CNPJ ou CPF. Nossa verificação de identidade (KYC) é ágil para que você não perca tempo e possa ativar sua operação no mesmo dia."
              visual={<div className="flex flex-col gap-3 p-4 bg-bg-card rounded-2xl border border-white/10 w-full max-w-sm ml-auto">
                <div className="h-10 bg-white/5 rounded-lg border border-white/5 px-3 flex items-center text-xs text-white/20 italic">Seu nome completo</div>
                <div className="h-10 bg-white/5 rounded-lg border border-white/5 px-3 flex items-center text-xs text-white/20 italic">E-mail corporativo</div>
                <div className="h-10 bg-accent transition-all rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xl">CONTINUAR</div>
              </div>}
            />
            <StepItem 
              num="02" 
              reverse 
              title="Monte seu checkout profissional" 
              description="Sem escrever uma linha de código. Configure ofertas, defina taxas de recorrência, adicione prova social dinâmica e otimize cada pixel para converter tráfego em vendas."
              visual={<div className="relative p-4 bg-bg-card rounded-2xl border border-white/10 w-full max-w-sm mr-auto group">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-20 h-2 bg-white/10 rounded-full" />
                  <div className="w-8 h-2 bg-accent rounded-full" />
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between border-b border-white/5 pb-2">
                     <div className="w-24 h-2 bg-white/10 rounded-full" />
                     <div className="w-12 h-2 bg-white/20 rounded-full" />
                   </div>
                   <div className="flex justify-between border-b border-white/5 pb-2">
                     <div className="w-24 h-2 bg-white/10 rounded-full" />
                     <div className="w-12 h-3 bg-success rounded-full" />
                   </div>
                </div>
                <div className="absolute -bottom-1 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-3xl" />
              </div>}
            />
            <StepItem 
              num="03" 
              title="Receba e escale em tempo real" 
              description="Acompanhe o split acontecer assim que o cliente clica em pagar. Veja o faturamento líquido cair direto no dashboard. Notificações imediatas via webhook para automação total."
              visual={<div className="flex gap-4 items-center p-4 bg-success/5 rounded-2xl border border-success/10 w-full max-w-sm ml-auto animate-pulse">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Nova venda aprovada</p>
                  <p className="text-lg font-mono font-bold text-success">+ R$ 497,90</p>
                </div>
              </div>}
            />
          </div>
        </div>
      </section>

      {/* --- Section 5: Pricing --- */}
      <section id="taxas" className="py-32 bg-bg-deep relative overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionHeading
            label="PREÇOS"
            title="Custo justo. Sem surpresas."
            subtitle="Você só paga quando vende. Sem mensalidade, sem taxa de adesão."
            align="center"
          />

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* PIX Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full max-w-[440px] bg-bg-card p-10 rounded-[32px] border-2 border-success/20 relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                 <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold rounded-full uppercase tracking-widest border border-success/20">Recomendado</span>
              </div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-success fill-success" />
                </div>
                <span className="font-display text-xl font-bold uppercase italic text-white/60 tracking-widest">GATEWAY PIX</span>
              </div>
              <div className="mb-10">
                <span className="font-display text-8xl font-black text-white italic">0,8</span>
                <span className="font-display text-4xl font-bold text-success">%</span>
              </div>
              <p className="text-text-secondary text-sm mb-10 pb-8 border-b border-white/5 uppercase font-bold tracking-[0.2em]">por transação</p>
              
              <ul className="space-y-5 mb-12">
                {["Liquidação D+0 — na hora", "Split automático para o player", "QR Code dinâmico via API", "Webhook em tempo real", "Sem taxa de adesão"].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-sm text-text-primary">
                    <CheckCircle2 className="w-5 h-5 text-success" /> {benefit}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="block w-full h-16 bg-success text-bg-void font-bold rounded-2xl flex items-center justify-center hover:brightness-110 transition-all shadow-[0_10px_30px_rgba(0,230,118,0.2)]">
                Começar agora grátis
              </Link>
              <p className="text-center text-[10px] text-text-muted mt-6 font-bold uppercase tracking-widest">Taxa mínima: R$ 0,50 | Máxima: R$ 5,00</p>
              
              {/* Bottom Glow */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-success/10 rounded-full blur-3xl pointer-events-none" />
            </motion.div>

            {/* Platform Card */}
            <div className="w-full max-w-[400px] bg-bg-card/40 p-10 rounded-[32px] border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                   <IconBrandTabler className="w-6 h-6 text-text-muted" />
                   <span className="font-display text-sm font-bold uppercase tracking-widest text-text-muted">PLATAFORMA</span>
                </div>
                <div className="mb-10 flex items-center">
                  <span className="font-display text-6xl font-black text-text-secondary italic">X</span>
                  <span className="font-display text-4xl font-bold text-text-muted">%</span>
                  <div className="w-1 h-12 bg-accent ml-2 animate-pulse" />
                </div>
                <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mb-10">Você define sua margem</p>
                
                <div className="p-6 bg-bg-void/60 rounded-2xl border border-white/5 mb-10">
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-4">Exemplo em uma venda de R$ 100:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs transition-opacity">
                      <span className="text-text-secondary">Player recebe:</span>
                      <span className="text-success font-bold font-mono">R$ 89,20</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Sua Margem (10%):</span>
                      <span className="text-accent font-bold font-mono">R$ 9,20</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-white/5 pt-2">
                      <span className="text-text-muted">Taxa de processamento (0.8%):</span>
                      <span className="text-white font-bold font-mono">R$ 0,80</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link href="/register" className="w-full h-14 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all">
                Configurar minhas taxas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 6: Target Personas --- */}
      <section id="para-quem" className="py-32 bg-bg-void relative border-y border-white/5">
        <div className="container mx-auto px-6">
          <SectionHeading
            label="PARA QUEM É"
            title="Feito para quem vende de verdade."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <PersonaCard emoji="🎯" title="Afiliados" desc="Crie links de checkout personalizados, acompanhe comissões em realtime e saque via PIX." />
             <PersonaCard emoji="🚀" title="Produtores" desc="Venda cursos e infoprodutos com checkout builder e prova social que converte 18% mais." />
             <PersonaCard emoji="📊" title="Gestores" desc="Instale pixels, estude funis e acompanhe o ROAS das campanhas direto no gateway." />
             <PersonaCard emoji="⚙️" title="SaaS" desc="Use nossa API e Webhooks para automatizar pagamentos e splits no seu sistema em minutos." />
          </div>
        </div>
      </section>

      {/* --- Section 7: Testimonials & Counters --- */}
      <section className="py-32 bg-bg-deep relative">
        <div className="container mx-auto px-6">
          {/* Animated Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-32 border-b border-white/5 pb-20">
            <div className="text-center">
               <p className="font-display text-4xl md:text-6xl font-black text-white italic"><Counter value="R$ 2,4M+" /></p>
               <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest mt-2 px-2">EM TRANSAÇÕES PROCESSADAS</p>
            </div>
            <div className="text-center">
               <p className="font-display text-4xl md:text-6xl font-black text-white italic"><Counter value="847+" /></p>
               <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest mt-2">PLAYERS ATIVOS NA PLATAFORMA</p>
            </div>
            <div className="text-center">
               <p className="font-display text-4xl md:text-6xl font-black text-white italic"><Counter value="99.8%" /></p>
               <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest mt-2">UPTIME GARANTIDO EM 2024</p>
            </div>
            <div className="text-center">
               <p className="font-display text-4xl md:text-6xl font-black text-white italic"><Counter value="< 2s" /></p>
               <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest mt-2">TEMPO MÉDIO DE APROVAÇÃO</p>
            </div>
          </div>

          <SectionHeading
            label="CASES"
            title="Players que já escalam."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
             <TestimonialCard 
               name="Rafael M."
               role="Afiliado Digital · R$ 847k"
               text="Antes eu ficava no escuro com outros gateways. Com o PulsePay, cada venda aparece em tempo real e o split vai direto pra minha chave PIX. Não existe nada mais rápido."
               seed="Rafael"
               badge="🏆 Plaquinha 500k"
             />
             <TestimonialCard 
               name="Camila R."
               role="Infoprodutora · R$ 200k/mês"
               text="O checkout builder tem tudo que eu precisava: timer, prova social, order bump. Configurei em 20 minutos e minha conversão subiu 18% no primeiro lançamento."
               seed="Camila"
               badge="🚀 Top Player"
             />
             <TestimonialCard 
               name="Lucas A."
               role="Gestor de Tráfego"
               text="A integração com Meta Pixel e GTM funciona perfeitamente. Finalmente um gateway que entende as dores reais de quem trabalha com tráfego pago escala produtos."
               seed="Lucas"
             />
          </div>
          
          <div className="text-center">
             <Link href="/register" className="inline-flex items-center gap-3 text-white font-bold text-lg hover:text-accent group transition-all underline underline-offset-8 decoration-white/20 hover:decoration-accent">
               Ver mais histórias de sucesso no Instagram <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* --- Section 8: API / Developers --- */}
      <section id="api" className="py-32 bg-bg-void relative overflow-hidden flex flex-col items-center">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeading
                label="DESENVOLVEDORES"
                title="API pensada para devs sérios."
                subtitle="Documentação completa, sandbox gratuito e SDK Node.js."
                align="left"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <ApiFeature icon={<Globe className="w-5 h-5" />} text="REST + JSON Nativo" />
                 <ApiFeature icon={<Database className="w-5 h-5" />} text="Sandbox de Testes" />
                 <ApiFeature icon={<Lock className="w-5 h-5" />} text="Assinatura HMAC" />
                 <ApiFeature icon={<Webhook className="w-5 h-5" />} text="Events Realtime" />
              </div>

              <div className="mt-12">
                 <Link href="#" className="h-14 px-8 inline-flex items-center justify-center gap-3 bg-white/5 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
                   <ChevronRight className="w-5 h-5 text-accent" /> Acessar Documentação
                 </Link>
              </div>
            </div>

            <div className="relative group p-[1px] bg-gradient-to-br from-white/10 via-accent/20 to-transparent rounded-[32px]">
               <div className="bg-[#0b0f15] rounded-[31px] p-8 overflow-hidden relative shadow-2xl">
                  {/* Fake Terminal Header */}
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                     <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-error/40" />
                        <div className="w-3 h-3 rounded-full bg-warning/40" />
                        <div className="w-3 h-3 rounded-full bg-success/40" />
                     </div>
                     <span className="text-[10px] text-text-muted font-mono flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success animate-pulse" /> bash - post: /orders</span>
                  </div>

                  {/* Terminal Code Content */}
                  <div className="font-mono text-[11px] md:text-sm leading-relaxed overflow-x-auto">
                     <p className="text-text-muted mb-4 hidden md:block"># Crie um novo pedido via API</p>
                     <p className="text-white"><span className="text-success">curl</span> -X POST https://api.pulsepay.com.br/v1/orders \</p>
                     <p className="text-white">&nbsp;&nbsp;-H <span className="text-accent-dim bg-accent/10 px-1">&quot;AppID: YOUR_KEY&quot;</span> \</p>
                     <p className="text-white">&nbsp;&nbsp;-d <span className="text-yellow-200">{"'{"}</span></p>
                     <p className="text-text-secondary">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-success">&quot;amount&quot;</span>: 29700,</p>
                     <p className="text-text-secondary">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-success">&quot;split&quot;</span>: [</p>
                     <p className="text-text-secondary">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"{"}<span className="text-success">&quot;role&quot;</span>: &quot;player&quot;, <span className="text-success">&quot;percent&quot;</span>: 80{"}"}</p>
                     <p className="text-text-secondary">&nbsp;&nbsp;&nbsp;&nbsp;],</p>
                     <p className="text-text-secondary">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-success">&quot;postback&quot;</span>: &quot;https://seuapp.com/webhook&quot;</p>
                     <p className="text-white">&nbsp;&nbsp;<span className="text-yellow-200">{"}'"}</span></p>
                  </div>

                  {/* Reflection */}
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 9: CTA Final --- */}
      <section className="py-32 bg-bg-deep relative border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }} className="mb-6 font-display">Pronto para escalar?</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }} className="max-w-[520px] mx-auto mb-10">Crie sua conta em 5 minutos e comece a receber via PIX hoje mesmo.</p>
          <Link href="/register" className="inline-flex px-10 h-[60px] items-center justify-center gap-3 font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-2xl transition-all scale-100 hover:scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            Criar conta grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-bg-void border-t border-white/5 py-20 overflow-hidden relative">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
             <Link href="/" className="flex items-center mb-8 group">
                <Image src="/assets/logo-png.png" alt="PulsePay" width={120} height={32} className="w-auto h-8 object-contain group-hover:scale-105 transition-transform duration-300" />
             </Link>
             <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-xs">A tecnologia definitiva de processamento PIX para quem escala no mercado digital. D+0 real.</p>
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-accent/10 transition-colors cursor-pointer"><span className="text-white text-xs">IG</span></div>
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-accent/10 transition-colors cursor-pointer"><span className="text-white text-xs">LI</span></div>
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-accent/10 transition-colors cursor-pointer"><span className="text-white text-xs">X</span></div>
             </div>
          </div>

          <div>
             <h4 className="font-display text-white italic font-bold uppercase tracking-widest text-xs mb-8">Navegação</h4>
             <ul className="space-y-4 text-sm text-text-secondary">
                <li className="hover:text-accent cursor-pointer">Recursos</li>
                <li className="hover:text-accent cursor-pointer">Taxas</li>
                <li className="hover:text-accent cursor-pointer">Para Quem Er</li>
                <li className="hover:text-accent cursor-pointer">API / Documentação</li>
             </ul>
          </div>

          <div>
             <h4 className="font-display text-white italic font-bold uppercase tracking-widest text-xs mb-8">Jurídico</h4>
             <ul className="space-y-4 text-sm text-text-secondary">
                <li className="hover:text-accent cursor-pointer">Termos de Uso</li>
                <li className="hover:text-accent cursor-pointer">Privacidade</li>
                <li className="hover:text-accent cursor-pointer">Cookies</li>
                <li className="hover:text-accent cursor-pointer">Segurança</li>
             </ul>
          </div>

          <div>
             <h4 className="font-display text-white italic font-bold uppercase tracking-widest text-xs mb-8">Newsletter</h4>
             <p className="text-xs text-text-muted mb-4 font-bold uppercase">Assine e receba estratégias de escala.</p>
             <div className="flex gap-2">
                <input type="text" placeholder="Seu melhor e-mail" className="bg-bg-card border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-accent w-full" />
                <button className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-white"><ChevronRight className="w-5 h-5" /></button>
             </div>
          </div>
        </div>

        <div className="container mx-auto px-6 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">&copy; 2024 PulsePay INTERMEDIAÇÃO LTDA. TODOS OS DIREITOS RESERVADOS.</p>
           <div className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] flex items-center gap-2">FEITO COM <div className="w-2 h-2 bg-accent rounded-full animate-ping" /> PARA PLAYERS FORTES.</div>
        </div>
      </footer>
    </div>
  );
}

// --- Internal Components ---

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  visual?: React.ReactNode;
  highlight?: boolean;
}

const FeatureCard = ({ icon, title, description, tag, visual, highlight = false }: FeatureCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -4, borderColor: "rgba(139,92,246,0.25)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group p-8 rounded-3xl bg-bg-card border border-white/5 transition-colors duration-300 relative overflow-hidden",
        highlight && "border-accent/40 bg-accent/5"
      )}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>{icon}</div>
          <span className="px-2 py-0.5 bg-white/5 text-text-muted text-[8px] font-bold uppercase rounded-full tracking-tighter border border-white/5">{tag}</span>
        </div>
        <h3 className="text-white mb-2" style={{ fontSize: "17px", fontWeight: 600 }}>{title}</h3>
        <p className="text-text-secondary mb-8" style={{ fontSize: "14px", lineHeight: 1.6 }}>{description}</p>
        {visual && <div className="mt-auto">{visual}</div>}
      </div>
      
      {/* Hover Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

interface StepItemProps {
  num: string;
  title: string;
  description: string;
  visual: React.ReactNode;
  reverse?: boolean;
}

const StepItem = ({ num, title, description, visual, reverse = false }: StepItemProps) => {
  return (
    <div className={cn("flex flex-col md:flex-row items-center gap-16", reverse && "md:flex-row-reverse")}>
      <motion.div 
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1"
      >
        <div className="flex items-baseline gap-4 mb-6">
          <span className="font-display text-8xl md:text-[120px] font-black text-accent opacity-10 italic leading-none">{num}</span>
          <h3 className="font-display text-3xl md:text-5xl font-bold text-white uppercase italic leading-tight">{title}</h3>
        </div>
        <p className="text-text-secondary text-lg leading-relaxed">{description}</p>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 w-full"
      >
        {visual}
      </motion.div>
    </div>
  );
};

interface PersonaCardProps {
  emoji: string;
  title: string;
  desc: string;
}

const PersonaCard = ({ emoji, title, desc }: PersonaCardProps) => (
  <motion.div 
    whileHover={{ y: -4, backgroundColor: "rgba(191,0,255,0.02)" }}
    className="p-8 rounded-2xl bg-bg-card border border-white/5 transition-all"
  >
    <div className="text-4xl mb-6">{emoji}</div>
    <h4 className="font-display text-xl font-bold text-white uppercase italic mb-4 tracking-tight">{title}</h4>
    <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
  </motion.div>
);

interface TestimonialCardProps {
  name: string;
  role: string;
  text: string;
  seed: string;
  badge?: string;
}

const TestimonialCard = ({ name, role, text, seed, badge }: TestimonialCardProps) => (
  <div className="p-8 rounded-3xl bg-bg-card border border-white/5 relative group">
    <div className="flex items-center gap-4 mb-6">
       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name} className="w-12 h-12 rounded-xl bg-white/5 border border-white/5" />
       <div>
         <h5 className="text-white font-bold text-sm tracking-tight italic">{name}</h5>
         <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{role}</p>
       </div>
    </div>
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-xs">⭐</span>)}
    </div>
    <p className="text-sm text-text-secondary leading-relaxed italic">&quot;{text}&quot;</p>
    {badge && (
      <div className="mt-6">
         <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] text-accent font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(191,0,255,0.2)]">{badge}</span>
      </div>
    )}
  </div>
);

interface ApiFeatureProps {
  icon: React.ReactNode;
  text: string;
}

const ApiFeature = ({ icon, text }: ApiFeatureProps) => (
  <div className="flex items-center gap-3">
     <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">{icon}</div>
     <span className="text-xs text-text-primary font-bold uppercase tracking-widest">{text}</span>
  </div>
);
