"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { KeyRound, Mail, Lock, ArrowRight } from "lucide-react";

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
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error("Credenciais inválidas ou conta não encontrada.");
      } else {
        toast.success("Bem-vindo de volta!");
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro ao tentar entrar. Tente novamente.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#09090b] bg-grid-white p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-transparent to-transparent pointer-events-none" />
      
      <Card className="w-full max-w-md premium-card animate-fade-in relative z-10 transition-all hover:shadow-primary/5">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
            <KeyRound className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-black text-gradient uppercase tracking-tight">Login</CardTitle>
          <CardDescription className="text-slate-400 font-medium">
            Gerencie seu faturamento com segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2" htmlFor="email">
                <Mail size={14} className="text-primary" /> Email ou CPF
              </label>
              <Input 
                id="email" 
                required 
                placeholder="seu@email.com" 
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-slate-600 focus:border-primary/50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2" htmlFor="password">
                  <Lock size={14} className="text-primary" /> Senha
                </label>
                <Link href="/forgot" className="text-[10px] font-black uppercase text-primary hover:text-white transition-colors tracking-tight">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="bg-white/5 border-white/10 h-12 text-white focus:border-primary/50"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest premium-button text-sm group" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Autenticando..." : (
                <span className="flex items-center gap-2">
                  Entrar no painel <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
            <div className="text-center text-sm text-slate-500 mt-6 font-medium">
              Não tem uma conta ainda? <Link href="/register" className="text-primary hover:text-white transition-colors font-bold">Cadastre-se</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
