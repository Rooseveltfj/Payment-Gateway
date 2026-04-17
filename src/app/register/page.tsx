"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Mail, User, Shield, Lock, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso! Verifique seu e-mail.");
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-bg-void overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 grid-dots opacity-20" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center space-y-8">
        {/* Logo Link */}
        <Link href="/" className="hover:scale-105 transition-transform duration-300">
          <Image 
            src="/assets/logo-png.png" 
            alt="PulsePay Logo" 
            width={180} 
            height={48} 
            className="w-auto h-12 object-contain"
          />
        </Link>

        <Card className="w-full max-w-md p-8 bg-bg-card/50 backdrop-blur-xl border-accent/20 shadow-[0_0_50px_rgba(191,0,255,0.1)]">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white uppercase italic tracking-tight">Criar Conta</h1>
              <p className="text-sm text-text-secondary">
                Junte-se à elite dos pagamentos digitais
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <User size={12} className="text-accent" /> Nome Completo
                </label>
                <Input 
                  id="name" 
                  required 
                  placeholder="Nome completo" 
                  className="bg-bg-void border-white/5 h-11 text-white placeholder:text-text-muted focus:border-accent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <Mail size={12} className="text-accent" /> Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="seu@email.com" 
                    className="bg-bg-void border-white/5 h-11 text-white placeholder:text-text-muted focus:border-accent"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <Shield size={12} className="text-accent" /> CPF
                  </label>
                  <Input 
                    id="document" 
                    required 
                    placeholder="000.000.000-00" 
                    className="bg-bg-void border-white/5 h-11 text-white placeholder:text-text-muted focus:border-accent"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Lock size={12} className="text-accent" /> Senha
                </label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="bg-bg-void border-white/5 h-11 text-white focus:border-accent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <Button 
                className="w-full h-12 bg-accent hover:bg-accent/90 text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(191,0,255,0.3)] mt-2 group" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    Começar agora <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-text-muted mt-4 font-medium">
              Já possui uma conta? <Link href="/login" className="text-accent hover:underline font-bold">Entre aqui</Link>
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-sm text-text-muted font-bold uppercase tracking-[0.2em]">
            © 2024 PulsePay. Segurança Garantida.
          </p>
        </div>
      </div>
    </main>
  );
}
