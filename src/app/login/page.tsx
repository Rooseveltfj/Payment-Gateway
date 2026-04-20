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
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Smartphone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [canSendEmail, setCanSendEmail] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code: ""
  });

  const sendEmailCode = async () => {
    if (!formData.email) return toast.error("Insira seu e-mail primeiro");
    setLoading(true);
    try {
       // We'll create a temp route for this or just use a server action
       const res = await fetch("/api/auth/2fa/send-code", {
          method: "POST",
          body: JSON.stringify({ email: formData.email, password: formData.password })
       });
       if (res.ok) {
          toast.success("Código enviado para o seu e-mail!");
          setCanSendEmail(false);
          setTimeout(() => setCanSendEmail(true), 60000); // 1 minute cooldown
       } else {
          toast.error("Erro ao enviar código. Verifique suas credenciais.");
       }
    } catch {
       toast.error("Erro de conexão");
    } finally {
       setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Proactively check user status
      const statusRes = await fetch("/api/auth/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const { status } = await statusRes.json();

      if (status === "PENDING") {
        toast.info("Sua conta ainda não foi verificada. Redirecionando para o 2FA...");
        setTimeout(() => {
          router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
        return;
      }

      // 2. Attempt sign in
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        code: formData.code
      });

      if (result?.error === "2FA_REQUIRED") {
        setShow2FA(true);
        toast.info("Autenticação de dois fatores necessária");
      } else if (result?.error === "INVALID_2FA_CODE") {
        toast.error("Código de verificação inválido");
      } else if (result?.error) {
        toast.error("Credenciais inválidas ou conta não encontrada.");
      } else {
        toast.success("Bem-vindo de volta!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao tentar entrar.");
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
          {!show2FA ? (
             <div className="flex flex-col items-center text-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-white uppercase italic tracking-tight">Login</h1>
                  <p className="text-sm text-text-secondary">Acesse seu painel administrativo</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-5">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                      <Mail size={12} className="text-accent" /> Email ou CPF
                    </label>
                    <Input 
                      required 
                      placeholder="seu@email.com" 
                      className="bg-bg-void border-white/5 h-12 text-white focus:border-accent"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                        <Lock size={12} className="text-accent" /> Senha
                      </label>
                      <Link href="/auth/forgot-password" classNam="text-[10px] font-bold uppercase text-accent hover:underline tracking-tight">
                        Esqueceu?
                      </Link>
                    </div>
                    <Input 
                      type="password" 
                      required 
                      className="bg-bg-void border-white/5 h-12 text-white focus:border-accent"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(191,0,255,0.3)] group" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <span className="flex items-center gap-2">
                        Entrar no Painel <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>
             </div>
          ) : (
             <div className="flex flex-col items-center text-center space-y-6 animate-in slide-in-from-right duration-500">
                <div className="h-16 w-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent ring-1 ring-accent/30 shadow-[0_0_30px_rgba(191,0,255,0.2)]">
                   <ShieldCheck size={32} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-bold text-white uppercase italic tracking-tight">Verificação Social</h1>
                  <p className="text-[12px] text-text-secondary">Insira o código enviado ou do seu app autenticador para continuar.</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-5">
                   <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                      <Smartphone size={12} className="text-accent" /> Código de 6 dígitos
                    </label>
                    <Input 
                      required 
                      placeholder="000 000" 
                      className="bg-bg-void border-white/5 h-14 text-center text-xl font-mono tracking-[0.5em] focus:border-accent"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-black font-bold uppercase tracking-widest text-xs" type="submit" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verificar e Entrar"}
                    </Button>
                    <button 
                      type="button"
                      onClick={sendEmailCode}
                      disabled={!canSendEmail || loading}
                      className="text-[10px] font-bold uppercase text-accent hover:underline disabled:opacity-50"
                    >
                      {canSendEmail ? "Não recebeu? Reenviar código por e-mail" : "Aguarde 60s para novo envio"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShow2FA(false)}
                      className="block w-full text-[10px] font-bold uppercase text-[#64748b] hover:text-white"
                    >
                      Voltar para o login
                    </button>
                  </div>
                </form>
             </div>
          )}

          <div className="text-center text-xs text-text-muted mt-6 font-medium">
            Não tem uma conta? <Link href="/register" className="text-accent hover:underline font-bold">Cadastre-se agora</Link>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-text-muted font-bold uppercase tracking-[0.2em]">© 2024 PulsePay. Segurança Garantida.</p>
        </div>
      </div>
    </main>
  );
}
