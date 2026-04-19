"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("[Login] Checking status for:", formData.email);
      // 1. Proactively check user status
      const statusRes = await fetch("/api/auth/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const { status } = await statusRes.json();
      console.log("[Login] Status received:", status);

      if (status === "PENDING") {
        toast.info("Sua conta ainda não foi verificada. Redirecionando para o 2FA...");
        setTimeout(() => {
          router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
        return;
      }

      console.log("[Login] Attempting sign-in...");
      // 2. Proceed with sign in if not pending
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      console.log("[Login] Sign-in result:", result);

      if (result?.error) {
        toast.error("Credenciais inválidas ou conta não encontrada.");
      } else {
        toast.success("Bem-vindo de volta!");
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("[Login] Exception:", error);
      const message = error instanceof Error ? error.message : "Erro ao tentar entrar.";
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
              <h1 className="text-2xl font-bold text-white uppercase italic tracking-tight">Login</h1>
              <p className="text-sm text-text-secondary">
                Acesse seu painel administrativo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Mail size={12} className="text-accent" /> Email ou CPF
                </label>
                <Input 
                  id="email" 
                  required 
                  placeholder="seu@email.com" 
                  className="bg-bg-void border-white/5 h-12 text-white placeholder:text-text-muted focus:border-accent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <Lock size={12} className="text-accent" /> Senha
                  </label>
                  <Link href="/auth/forgot-password" className="text-[10px] font-bold uppercase text-accent hover:underline tracking-tight">
                    Esqueceu?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="bg-bg-void border-white/5 h-12 text-white focus:border-accent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <Button 
                className="w-full h-12 bg-accent hover:bg-accent/90 text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(191,0,255,0.3)] group" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    Entrar no Painel <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-text-muted mt-6 font-medium">
              Não tem uma conta? <Link href="/register" className="text-accent hover:underline font-bold">Cadastre-se agora</Link>
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
