"use client";

import { useState } from "react";
import { updateProfile, disable2FA } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Shield, Smartphone, Key, User, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  user: any;
}

export function PerfilClient({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [setup2FA, setSetup2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
      toast.success("Perfil atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generate2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/generate");
      const data = await res.json();
      setTwoFactorData(data);
      setSetup2FA(true);
      setStep(1);
    } catch (err: any) {
      toast.error("Erro ao gerar 2FA");
    } finally {
      setLoading(false);
    }
  };

  const activate2FA = async () => {
    if (token.length !== 6) return toast.error("Código deve ter 6 dígitos");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/activate", {
        method: "POST",
        body: JSON.stringify({ secret: twoFactorData.secret, token }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Autenticação de 2 fatores ativada!");
        window.location.reload();
      } else {
        toast.error(data.error);
      }
    } catch (err: any) {
      toast.error("Erro ao ativar 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Meu Perfil</h1>
        <p className="text-text-secondary">Gerencie suas informações pessoais e segurança da conta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Main Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Nome Completo</label>
                    <Input name="name" defaultValue={user.name} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">E-mail (Login)</label>
                    <Input value={user.email} disabled className="opacity-60 bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">WhatsApp</label>
                    <Input name="phone" defaultValue={user.phone || ""} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Chave PIX (Para Saques)</label>
                    <Input name="pixKey" defaultValue={user.pixKey || ""} placeholder="CPF, e-mail ou chave aleatória" />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" isLoading={loading} className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security / 2FA */}
          <Card className={cn(
            "relative overflow-hidden transition-all duration-500",
            user.twoFactorEnabled ? "border-green-500/20" : "border-border"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Segurança (2FA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className={cn(
                  "p-3 rounded-xl",
                  user.twoFactorEnabled ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                )}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold">Autenticação de Dois Fatores</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Proteja sua conta PulsePay com uma camada extra de segurança. Ao ativar, você precisará de um código do seu celular para entrar ou realizar saques.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    user.twoFactorEnabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {user.twoFactorEnabled ? "ATIVADO" : "DESATIVADO"}
                  </span>
                </div>
              </div>

              {!user.twoFactorEnabled && !setup2FA && (
                <Button variant="outline" onClick={generate2FA} className="w-full h-12 gap-2 text-primary border-primary/20 hover:bg-primary/5">
                  <Key className="w-4 h-4" />
                  Configurar 2FA (Google Authenticator)
                </Button>
              )}

              {setup2FA && (
                <div className="space-y-6 pt-4 animate-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="p-3 bg-white rounded-2xl border-4 border-primary/20">
                       <img src={twoFactorData.qrCode} alt="2FA QR Code" className="w-40 h-40" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Passo 1: Escaneie o código
                        </p>
                        <p className="text-xs text-text-secondary">Use o Google Authenticator ou Authy no seu celular.</p>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <p className="text-xs font-bold text-primary">Passo 2: Digite o código de 6 dígitos</p>
                        <Input 
                          placeholder="000 000" 
                          maxLength={6} 
                          value={token}
                          onChange={e => setToken(e.target.value.replace(/\D/g, ""))}
                          className="text-center text-lg font-mono tracking-[0.5em]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={activate2FA} isLoading={loading} className="flex-1">Confirmar e Ativar</Button>
                        <Button variant="outline" onClick={() => setSetup2FA(false)}>Cancelar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user.twoFactorEnabled && (
                <div className="flex justify-between items-center p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                   <p className="text-xs text-green-500 font-medium">Sua conta está protegida com autenticação de dois fatores.</p>
                   <button 
                     onClick={() => { if(confirm("Deseja realmente desativar o 2FA?")) disable2FA() }}
                     className="text-xs font-bold text-red-500 hover:underline"
                   >
                     Desativar Segurança
                   </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 via-transparent to-transparent">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold">Por que configurar?</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Dados completos e segurança em dia (2FA) aumentam sua confiabilidade na plataforma e garantem saques mais rápidos.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
             <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Status da Conta</h4>
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium">KYC</span>
               <span className={cn(
                 "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                 user.kycStatus === "APPROVED" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
               )}>
                 {user.kycStatus === "APPROVED" ? "Aprovado" : "Pendente"}
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium">Membro desde</span>
               <span className="text-xs text-text-secondary">{new Date(user.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
