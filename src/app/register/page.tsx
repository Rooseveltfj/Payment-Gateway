"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Shield, Mail, User, Lock, ArrowRight } from "lucide-react";

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

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      router.push("/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#09090b] bg-grid-white p-6">
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent pointer-events-none" />
      
      <Card className="w-full max-w-md premium-card animate-fade-in relative z-10 transition-all hover:shadow-primary/5">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
            <Shield className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-black text-gradient uppercase tracking-tight">Criar Conta</CardTitle>
          <CardDescription className="text-slate-400 font-medium">
            Junte-se à elite dos pagamentos digitais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2" htmlFor="name">
                <User size={14} className="text-primary" /> Nome Completo
              </label>
              <Input 
                id="name" 
                required 
                placeholder="Ex: Roosevelt Ferreira" 
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-slate-600 focus:border-primary/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2" htmlFor="email">
                <Mail size={14} className="text-primary" /> Email
              </label>
              <Input 
                id="email" 
                type="email" 
                required 
                placeholder="seu@email.com" 
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-slate-600 focus:border-primary/50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2" htmlFor="document">
                <Shield size={14} className="text-primary" /> CPF
              </label>
              <Input 
                id="document" 
                required 
                placeholder="000.000.000-00" 
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-slate-600 focus:border-primary/50"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2" htmlFor="password">
                <Lock size={14} className="text-primary" /> Senha
              </label>
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
              {loading ? "Processando..." : (
                <span className="flex items-center gap-2">
                  Começar agora <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
            <div className="text-center text-sm text-slate-500 mt-6 font-medium">
              Já possui uma conta? <Link href="/login" className="text-primary hover:text-white transition-colors font-bold">Entre aqui</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
