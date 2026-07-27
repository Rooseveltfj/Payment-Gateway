"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

  // Erros vindos do OAuth (redirect ?error=). Client-only (sem Suspense).
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err === "email_exists") {
      toast.error("Já existe uma conta com senha para este e-mail. Entre com e-mail e senha.");
    } else if (err === "google_unverified") {
      toast.error("Não foi possível confirmar seu e-mail no Google.");
    } else if (err === "OAuthAccountNotLinked" || err === "AccessDenied") {
      toast.error("Não foi possível entrar com o Google. Tente novamente ou use e-mail e senha.");
    }
  }, []);

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

            {/* Divisor + cadastro social */}
            <div className="w-full flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">ou</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-md bg-white text-[#1f1f1f] font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continuar com Google
            </button>

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
