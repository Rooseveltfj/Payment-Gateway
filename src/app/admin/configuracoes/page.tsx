"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  Mail, 
  Lock, 
  Save, 
  Database
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminSettingsData {
  defaultPlatformFee: number;
  withdrawalFee: number;
  minWithdrawalAmount: number;
  balanceRetentionDays: number;
  minWithdrawalDays: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  emailSenderName?: string;
  emailSenderAddress?: string;
  wooviProductionKey?: string;
  wooviSandboxKey?: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert("Configurações salvas com sucesso!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AdminSettingsData, value: string | number | boolean) => {
    setSettings((prev: AdminSettingsData | null) => prev ? ({ ...prev, [field]: value }) : null);
  };

  if (loading || !settings) return <div>Carregando...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Configurações Base</h1>
            <p className="text-slate-500 mt-1">Defina as regras de negócio e integrações globais da plataforma PulsePay.</p>
         </div>
         <Button 
           size="lg" 
           className="bg-primary text-white font-black uppercase italic tracking-widest gap-2 shadow-lg shadow-primary/20 px-10 h-14"
           onClick={handleSave}
           disabled={saving}
         >
            <Save className="h-5 w-5" /> {saving ? "Salvando..." : "Salvar Tudo"}
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Financial Rules */}
         <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 backdrop-blur-xl shadow-xl space-y-8">
            <div className="flex items-center gap-3 mb-2">
               <Zap className="h-5 w-5 text-primary" />
               <h3 className="font-black text-white uppercase italic tracking-widest border-b border-slate-800 pb-2 flex-1">Regras Financeiras</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
               <SettingsInput 
                 label="Taxa Padrão Platform Fee (%)" 
                 value={settings.defaultPlatformFee} 
                 onChange={v => updateField('defaultPlatformFee', parseFloat(v))} 
                 type="number"
                 step="0.01"
                 sub="Aplicada automaticamente em novos players."
               />
               <SettingsInput 
                 label="Taxa de Saque Fixa (R$)" 
                 value={settings.withdrawalFee} 
                 onChange={v => updateField('withdrawalFee', parseFloat(v))} 
                 type="number"
                 step="0.01"
               />
               <SettingsInput 
                 label="Valor Mínimo para Saque (R$)" 
                 value={settings.minWithdrawalAmount} 
                 onChange={v => updateField('minWithdrawalAmount', parseFloat(v))} 
                 type="number"
                 step="1"
               />
               <div className="grid grid-cols-2 gap-4">
                  <SettingsInput 
                    label="Retenção Saldo (Dias)" 
                    value={settings.balanceRetentionDays} 
                    onChange={v => updateField('balanceRetentionDays', parseInt(v))} 
                    type="number"
                    sub="Período de segurança"
                  />
                  <SettingsInput 
                    label="Mínimo Dias Saque" 
                    value={settings.minWithdrawalDays} 
                    onChange={v => updateField('minWithdrawalDays', parseInt(v))} 
                    type="number"
                    sub="Desde o último saque"
                  />
               </div>
            </div>
         </div>

         {/* Maintenance & Environment */}
         <div className="space-y-8">
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 backdrop-blur-xl shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <Lock className="h-5 w-5 text-red-500" />
                  <h3 className="font-black text-white uppercase italic tracking-widest">Modo Manutenção</h3>
               </div>
               <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                  <div>
                     <p className="text-xs font-black text-white uppercase italic tracking-tight">Status do Acesso</p>
                     <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{settings.maintenanceMode ? "Plataforma em Manutenção" : "Sistema Online"}</p>
                  </div>
                  <button 
                    onClick={() => updateField('maintenanceMode', !settings.maintenanceMode)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                  >
                     <div className={`h-6 w-6 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
               </div>
               <SettingsInput 
                 label="Mensagem de Manutenção" 
                 value={settings.maintenanceMessage || ""} 
                 onChange={v => updateField('maintenanceMessage', v)} 
                 sub="Exibida no banner global para todos os usuários."
               />
            </div>

            <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 backdrop-blur-xl shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-black text-white uppercase italic tracking-widest">Configurações de E-mail</h3>
               </div>
               <div className="space-y-4">
                  <SettingsInput 
                    label="Nome do Remetente" 
                    value={settings.emailSenderName || ""} 
                    onChange={v => updateField('emailSenderName', v)} 
                  />
                  <SettingsInput 
                    label="Endereço de E-mail (From)" 
                    value={settings.emailSenderAddress || ""} 
                    onChange={v => updateField('emailSenderAddress', v)} 
                  />
               </div>
            </div>
         </div>

         {/* API Integrations */}
         <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
               <Database className="h-6 w-6 text-primary" />
               <div className="flex-1 border-b border-slate-800 pb-2">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Integração Woovi (OpenPix)</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Credenciais de processamento de pagamentos PIX.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Produção (API KEY)</label>
                  <Input 
                    type="password" 
                    className="h-12 bg-slate-900 border-slate-800 text-sm font-mono tracking-widest"
                    value={settings.wooviProductionKey || ""}
                    onChange={e => updateField('wooviProductionKey', e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
               </div>
               <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <label className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] block mb-3">Sandbox / Testes (API KEY)</label>
                  <Input 
                    type="password" 
                    className="h-12 bg-slate-900 border-slate-800 text-sm font-mono tracking-widest"
                    value={settings.wooviSandboxKey || ""}
                    onChange={e => updateField('wooviSandboxKey', e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function SettingsInput({ label, value, onChange, type = "text", step, sub }: { label: string, value: string | number, onChange: (v: string) => void, type?: string, step?: string, sub?: string }) {
  return (
    <div className="space-y-1.5">
       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block">{label}</label>
       <Input 
         type={type} 
         step={step}
         className="h-12 bg-slate-900/50 border-slate-800 font-bold text-white focus:ring-primary/20 transition-all rounded-xl"
         value={value}
         onChange={e => onChange(e.target.value)}
       />
       {sub && <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic px-1">{sub}</p>}
    </div>
  );
}
