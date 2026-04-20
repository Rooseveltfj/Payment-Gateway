"use client";

import { useState } from "react";
import { updateProfile, disable2FA, changePassword, requestEmail2FA, activateEmail2FA } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { 
  User, 
  Shield, 
  Wallet, 
  Bell, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  Key, 
  Camera,
  LogOut,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  user: any;
}

type TabType = "personal" | "security" | "pix" | "notifications";

export function PerfilClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [loading, setLoading] = useState(false);
  const [setup2FA, setSetup2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (avatarUrl) formData.append("avatarUrl", avatarUrl);
      await updateProfile(formData);
      toast.success("Perfil atualizado com sucesso!");
      window.location.reload(); // Refresh to catch updated session
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar perfil");
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
    } catch {
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
    } catch {
      toast.error("Erro ao ativar 2FA");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: "personal", label: "Dados Pessoais", icon: User },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "pix", label: "Chave PIX", icon: Wallet },
    { id: "notifications", label: "Notificações", icon: Bell },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVEGAÇÃO */}
        <aside className="w-full md:w-[280px] shrink-0">
          <Card className="p-2 bg-[#0f0f1a] border-white/[0.05] rounded-2xl">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold border-l-2",
                      isActive 
                        ? "bg-[#8b5cf61f] text-[#a78bfa] border-[#8b5cf6]" 
                        : "text-[#64748b] border-transparent hover:text-[#f1f5f9] hover:bg-white/[0.02]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="h-px bg-white/[0.05] my-2 mx-2" />
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all">
               <LogOut className="w-4 h-4" />
               Sair da Conta
            </button>
          </Card>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="overflow-hidden bg-[#0f0f1a] border-white/[0.05] rounded-[24px]">
                  <div className="p-8 border-b border-white/[0.05] flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6]">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#f1f5f9]">Dados Pessoais</h2>
                      <p className="text-sm text-[#64748b]">Gerencie suas informações de contato e identificação.</p>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col gap-6">
                       <div className="w-full max-w-[200px]">
                          <ImageUpload 
                             value={avatarUrl}
                             onChange={setAvatarUrl}
                             label="Foto de Perfil"
                             aspectRatio="1/1"
                             hint="Irá aparecer na sua dashboard"
                          />
                       </div>
                    </div>

                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Nome Completo</label>
                          <Input name="name" defaultValue={user.name} className="h-11" required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">E-mail (Login)</label>
                          <Input value={user.email} disabled className="h-11 bg-white/[0.02] border-white/[0.05] text-[#64748b]" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">CPF / Documento</label>
                          <Input value={user.document || "Não informado"} disabled className="h-11 bg-white/[0.02] border-white/[0.05] text-[#64748b]" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Telefone (WhatsApp)</label>
                          <Input name="phone" defaultValue={user.phone || ""} className="h-11" placeholder="(00) 00000-0000" />
                       </div>
                       
                       <div className="md:col-span-2 flex justify-end pt-4">
                          <Button type="submit" isLoading={loading} variant="primary" className="h-11 px-8 font-bold gap-2">
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                          </Button>
                       </div>
                    </form>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "pix" && (
              <motion.div
                key="pix"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="bg-[#0f0f1a] border-white/[0.05] rounded-[24px]">
                  <div className="p-8 border-b border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#f1f5f9]">Chave PIX para Saque</h2>
                        <p className="text-sm text-[#64748b]">Esta é a chave que receberá seus saques automaticamente.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                     <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Tipo de Chave</label>
                             <Select 
                                name="pixKeyType" 
                                defaultValue={user.pixKeyType || "CPF"}
                                options={[
                                  { label: "CPF", value: "CPF" },
                                  { label: "CNPJ", value: "CNPJ" },
                                  { label: "E-mail", value: "EMAIL" },
                                  { label: "Telefone", value: "PHONE" },
                                  { label: "Chave Aleatória", value: "RANDOM" },
                                ]}
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Chave PIX</label>
                             <Input name="pixKey" defaultValue={user.pixKey || ""} placeholder="Digite sua chave" className="h-11" required />
                           </div>
                        </div>

                        {user.pixKey && (
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                             <span className="text-sm font-bold text-emerald-500">Chave cadastrada e pronta para uso!</span>
                          </div>
                        )}

                        <div className="flex justify-end">
                           <Button type="submit" isLoading={loading} variant="primary" className="h-11 px-8 font-bold">
                              Salvar Chave PIX
                           </Button>
                        </div>
                     </form>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Alterar Senha */}
                <Card className="bg-[#0f0f1a] border-white/[0.05] rounded-[24px]">
                  <div className="p-8 border-b border-white/[0.05] flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#f1f5f9]">Alterar Senha</h2>
                      <p className="text-sm text-[#64748b]">Mantenha sua conta segura com uma senha forte.</p>
                    </div>
                  </div>
                  <div className="p-8">
                     <form onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        try {
                           await changePassword(new FormData(e.currentTarget));
                           toast.success("Senha alterada com sucesso!");
                           (e.target as HTMLFormElement).reset();
                        } catch (err: any) {
                           toast.error(err.message);
                        } finally {
                           setLoading(false);
                        }
                     }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Senha Atual</label>
                          <Input name="currentPassword" type="password" placeholder="••••••••" className="h-11" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Nova Senha</label>
                          <Input name="newPassword" type="password" placeholder="••••••••" className="h-11" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Confirmar Senha</label>
                          <Input name="confirmPassword" type="password" placeholder="••••••••" className="h-11" required />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                           <Button type="submit" isLoading={loading} variant="secondary" className="h-11 px-8 font-bold border-white/[0.05]">Atualizar Senha</Button>
                        </div>
                     </form>
                  </div>
                </Card>
 
                {/* 2FA */}
                <Card className={cn(
                  "bg-[#0f0f1a] border-white/[0.05] rounded-[24px] overflow-hidden",
                  user.twoFactorEnabled && "border-emerald-500/20"
                )}>
                  <div className="p-8 border-b border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center",
                        user.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-[#8b5cf61a] text-[#8b5cf6]"
                      )}>
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#f1f5f9]">Segurança (2FA)</h2>
                        <p className="text-sm text-[#64748b]">Proteja seus saques com autenticação secundária.</p>
                      </div>
                    </div>
                    {user.twoFactorEnabled && (
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                             {user.twoFactorMethod === 'EMAIL' ? 'Via E-mail' : 'Via App'}
                          </span>
                       </div>
                    )}
                  </div>

                  <div className="p-8 space-y-6">
                    {!user.twoFactorEnabled && !setup2FA && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Button 
                            onClick={async () => {
                               setLoading(true);
                               try {
                                  await requestEmail2FA();
                                  setSetup2FA(true);
                                  setTwoFactorData({ method: 'EMAIL' });
                                  toast.info("Código enviado para o seu e-mail!");
                               } catch (err: any) {
                                  toast.error(err.message);
                               } finally {
                                  setLoading(false);
                               }
                            }} 
                            isLoading={loading} 
                            variant="secondary" 
                            className="h-14 font-bold gap-3 border-white/5 bg-[#0f0f1a]"
                          >
                             <Mail className="w-5 h-5 text-[#a78bfa]" />
                             <div className="text-left">
                                <p className="text-[13px]">Ativar via E-mail</p>
                                <p className="text-[10px] text-[#64748b] font-normal">Receba códigos no e-mail</p>
                             </div>
                          </Button>

                          <Button 
                            onClick={generate2FA} 
                            isLoading={loading} 
                            variant="secondary" 
                            className="h-14 font-bold gap-3 border-white/5 bg-[#0f0f1a]"
                          >
                             <Smartphone className="w-5 h-5 text-[#a78bfa]" />
                             <div className="text-left">
                                <p className="text-[13px]">Ativar via App</p>
                                <p className="text-[10px] text-[#64748b] font-normal">Google Authenticator / Authy</p>
                             </div>
                          </Button>
                       </div>
                    )}
 
                    {setup2FA && twoFactorData?.method === 'EMAIL' && (
                       <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6 bg-white/[0.02] p-8 rounded-[20px] border border-white/[0.05]">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-[#f1f5f9]">Verifique seu E-mail</p>
                             <p className="text-xs text-[#64748b]">Enviamos um código de 6 dígitos para {user.email}.</p>
                          </div>
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Código de Segurança</label>
                                <Input 
                                  className="text-center text-lg font-mono tracking-[0.5em] h-12"
                                  maxLength={6}
                                  placeholder="000000"
                                  value={token}
                                  onChange={e => setToken(e.target.value.replace(/\D/g, ""))}
                                />
                             </div>
                             <div className="flex gap-3">
                                <Button 
                                  onClick={async () => {
                                     setLoading(true);
                                     try {
                                        await activateEmail2FA(token);
                                        toast.success("2FA via E-mail ativado!");
                                        window.location.reload();
                                     } catch (err: any) {
                                        toast.error(err.message);
                                     } finally {
                                        setLoading(false);
                                     }
                                  }} 
                                  isLoading={loading} 
                                  variant="primary" 
                                  className="flex-1 h-11 font-bold"
                                >
                                   Confirmar E-mail
                                </Button>
                                <Button onClick={() => setSetup2FA(false)} variant="secondary" className="h-11 font-bold border-white/[0.05]">Cancelar</Button>
                             </div>
                          </div>
                       </div>
                    )}

                    {setup2FA && twoFactorData?.qrCode && (
                      <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col md:flex-row items-center gap-8 bg-white/[0.02] p-8 rounded-[20px] border border-white/[0.05]">
                         <div className="p-4 bg-white rounded-2xl shadow-xl">
                            <img src={twoFactorData.qrCode} alt="QR Code" className="w-40 h-40" />
                         </div>
                         <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                               <p className="text-sm font-bold text-[#f1f5f9]">Escaneie o QR Code acima</p>
                               <p className="text-xs text-[#64748b]">No app Authenticator, adicione uma nova conta e carregue este código.</p>
                            </div>
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Código do App</label>
                                  <Input 
                                    className="text-center text-lg font-mono tracking-[0.5em] h-12"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={token}
                                    onChange={e => setToken(e.target.value.replace(/\D/g, ""))}
                                  />
                               </div>
                               <div className="flex gap-3">
                                  <Button onClick={activate2FA} isLoading={loading} variant="primary" className="flex-1 h-11 font-bold">Ativar Agora</Button>
                                  <Button onClick={() => setSetup2FA(false)} variant="secondary" className="h-11 font-bold border-white/[0.05]">Cancelar</Button>
                               </div>
                            </div>
                         </div>
                      </div>
                    )}
 
                    {user.twoFactorEnabled && (
                      <div className="flex items-center justify-between p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                               <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-emerald-500">Sua conta está protegida!</p>
                               <p className="text-[11px] text-[#64748b]">A verificação será solicitada em novos IPs ou dispositivos.</p>
                            </div>
                         </div>
                         <button 
                           onClick={async () => { 
                              if(confirm("Deseja desativar o 2FA? Sua conta ficará menos protegida.")) {
                                 setLoading(true);
                                 try {
                                    await disable2FA();
                                    toast.success("2FA desativado.");
                                 } finally {
                                    setLoading(false);
                                 }
                              } 
                           }}
                           className="text-xs font-bold text-red-500 hover:text-red-400 underline transition-colors"
                         >
                           Desativar 2FA
                         </button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "notifications" && (
               <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="bg-[#0f0f1a] border-white/[0.05] rounded-[24px]">
                  <div className="p-8 border-b border-white/[0.05] flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6]">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#f1f5f9]">Configurações de Notificação</h2>
                      <p className="text-sm text-[#64748b]">Escolha como você deseja ser avisado sobre suas vendas.</p>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                     {[
                       { id: "sales", label: "Novas Vendas", desc: "Receba alertas instantâneos de cada pedido pago." },
                       { id: "withdrawals", label: "Saques Concluídos", desc: "Avisos quando o dinheiro cair na sua conta PIX." },
                       { id: "marketing", label: "Campanhas e Dicas", desc: "Novas funcionalidades e estratégias de venda." }
                     ].map((item) => (
                       <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-colors">
                          <div className="space-y-1">
                             <p className="text-[14px] font-bold text-[#f1f5f9]">{item.label}</p>
                             <p className="text-[12px] text-[#64748b]">{item.desc}</p>
                          </div>
                          <div className="h-6 w-11 rounded-full bg-[#8b5cf6] relative">
                             <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                          </div>
                       </div>
                     ))}
                     <div className="flex justify-end pt-4">
                        <Button variant="primary" disabled className="h-11 px-8 font-bold opacity-50">Salvar Notificações</Button>
                     </div>
                  </div>
                </Card>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
