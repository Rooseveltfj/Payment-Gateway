"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Zap, 
  TestTube, 
  Globe, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Settings,
  MoreVertical,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ApiKey {
  id: string;
  name: string;
  active: boolean;
  lastUsed: string | null;
  createdAt: string;
  preview: string;
}

interface NewKeyResult {
  id: string;
  name: string;
  key: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export default function IntegracoesPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  
  // API Key State
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<NewKeyResult | null>(null);

  // Webhook State
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [keysRes, hooksRes] = await Promise.all([
        fetch("/api/dashboard/integracoes/api-keys"),
        fetch("/api/dashboard/integracoes/webhooks")
      ]);
      setKeys(await keysRes.json());
      setWebhooks(await hooksRes.json());
    } catch {
      toast.error("Erro ao carregar integrações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const r = await fetch("/api/dashboard/integracoes/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, environment: "LIVE" }),
      });
      const data = await r.json();
      setCreatedKey(data);
      setShowCreateKey(false);
      setNewKeyName("");
      fetchData();
      toast.success("API Key gerada!");
    } catch {
      toast.error("Erro ao gerar chave");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Deseja revogar esta chave? Ela deixará de funcionar imediatamente.")) return;
    await fetch("/api/dashboard/integracoes/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
    toast.success("Chave revogada");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* SECTION: API KEYS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Chaves de API</h2>
            <p className="text-sm text-[#64748b]">Integre seu checkout com sistemas externos via REST API.</p>
          </div>
          <Button onClick={() => setShowCreateKey(true)} variant="primary" className="gap-2 h-11 px-6 font-bold">
            <Plus className="h-5 w-5" />
            Gerar nova API Key
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             [1,2].map(i => <div key={i} className="h-24 bg-[#0f0f1a] border border-white/[0.05] rounded-2xl animate-pulse" />)
          ) : keys.length === 0 ? (
             <Card className="p-12 text-center bg-[#0f0f1a] border-white/[0.05] border-dashed">
                <Key className="h-10 w-10 text-[#64748b] mx-auto mb-4 opacity-20" />
                <p className="text-[#64748b] font-medium">Você ainda não gerou nenhuma API Key.</p>
             </Card>
          ) : (
             keys.map((key) => (
                <Card key={key.id} className="p-6 bg-[#0f0f1a] border-white/[0.05] hover:border-[#8b5cf633] transition-all group">
                   <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-[#8b5cf61a] flex items-center justify-center text-[#8b5cf6]">
                            <Key className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="flex items-center gap-3">
                               <p className="font-bold text-[#f1f5f9]">{key.name}</p>
                               <Badge status="active" label="LIVE" className="bg-emerald-500/10 text-emerald-500 border-none" />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                               <code className="text-xs text-[#64748b] font-mono select-all">{key.preview}</code>
                               <button onClick={() => copyToClipboard(key.preview)} className="text-[#64748b] hover:text-[#f1f5f9]">
                                  <Copy className="h-3 w-3" />
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-10">
                         <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Último uso</p>
                            <p className="text-xs text-[#f1f5f9] mt-0.5">{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Nunca"}</p>
                         </div>
                         <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Criada em</p>
                            <p className="text-xs text-[#f1f5f9] mt-0.5">{new Date(key.createdAt).toLocaleDateString()}</p>
                         </div>
                         <Button 
                           variant="secondary" 
                           onClick={() => handleRevokeKey(key.id)}
                           className="text-red-500 hover:bg-red-500/10 border-white/[0.05] h-9 px-4 text-xs font-bold"
                         >
                           Revogar
                         </Button>
                      </div>
                   </div>
                </Card>
             ))
          )}
        </div>
      </section>

      <div className="h-px bg-white/[0.05]" />

      {/* SECTION: WEBHOOKS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Webhooks</h2>
            <p className="text-sm text-[#64748b]">Receba notificações de eventos em tempo real no seu servidor.</p>
          </div>
          <Button onClick={() => setShowCreateWebhook(true)} variant="primary" className="gap-2 h-11 px-6 font-bold">
            <Plus className="h-5 w-5" />
            Novo Webhook
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             [1].map(i => <div key={i} className="h-24 bg-[#0f0f1a] border border-white/[0.05] rounded-2xl animate-pulse" />)
          ) : webhooks.length === 0 ? (
             <Card className="p-12 text-center bg-[#0f0f1a] border-white/[0.05] border-dashed">
                <Zap className="h-10 w-10 text-[#64748b] mx-auto mb-4 opacity-20" />
                <p className="text-[#64748b] font-medium">Nenhum webhook configurado.</p>
             </Card>
          ) : (
             webhooks.map((wh) => (
                <Card key={wh.id} className="p-6 bg-[#0f0f1a] border-white/[0.05] hover:border-[#8b5cf633] transition-all">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                         <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Zap className="w-5 h-5" />
                         </div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-3">
                               <p className="font-bold text-[#f1f5f9] max-w-[300px] truncate">{wh.url}</p>
                               <Badge status={wh.active ? 'active' : 'inactive'} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                               {wh.events.slice(0, 3).map(e => (
                                 <span key={e} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.03] text-[#64748b] uppercase tracking-wider">{e}</span>
                               ))}
                               {wh.events.length > 3 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.03] text-[#64748b]">+ {wh.events.length - 3}</span>}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="flex flex-col items-center mr-6">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mb-1">Último disparo</p>
                            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                               <Check className="w-3 h-3" />
                               200 OK
                            </div>
                         </div>
                         <Button variant="secondary" className="h-9 px-4 text-xs font-bold border-white/[0.05] gap-2">
                            <Play className="w-3 h-3" />
                            Testar
                         </Button>
                         <Button variant="secondary" className="h-9 w-9 p-0 border-white/[0.05]">
                            <Settings className="w-4 h-4" />
                         </Button>
                         <Button variant="secondary" className="h-9 w-9 p-0 border-white/[0.05] text-red-500 hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4" />
                         </Button>
                         <div className="h-8 w-px bg-white/[0.05] mx-2" />
                         <Switch checked={wh.active} />
                      </div>
                   </div>
                </Card>
             ))
          )}
        </div>
      </section>

      {/* MODAL: NEW API KEY */}
      <Modal isOpen={showCreateKey} onClose={() => setShowCreateKey(false)} title="Nova API Key">
        <div className="space-y-6 py-4">
           <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Nome da Key</label>
              <Input 
                placeholder="Ex: Servidor Produção" 
                value={newKeyName}
                className="h-11"
                onChange={e => setNewKeyName(e.target.value)}
              />
           </div>
           <Button onClick={handleCreateKey} variant="primary" className="w-full h-12 font-bold">Gerar Chave</Button>
        </div>
      </Modal>

      {/* MODAL: CREATED KEY (ONCE) */}
      <Modal isOpen={!!createdKey} onClose={() => setCreatedKey(null)} title="Chave Gerada com Sucesso">
         <div className="space-y-6 py-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
               <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Check className="w-5 h-5" />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-bold text-[#f1f5f9]">Copie sua chave agora</p>
                  <p className="text-xs text-[#64748b]">Por questões de segurança, ela não será exibida novamente.</p>
               </div>
            </div>

            <div className="relative group">
               <div className="w-full bg-[#05050a] border-2 border-emerald-500/30 rounded-2xl p-6 font-mono text-sm text-[#22c55e] break-all leading-relaxed shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  {createdKey?.key}
               </div>
               <button 
                onClick={() => copyToClipboard(createdKey?.key || "")}
                className="absolute top-4 right-4 h-10 w-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all backdrop-blur-md"
               >
                 <Copy className="h-4 w-4" />
               </button>
            </div>

            <Button onClick={() => setCreatedKey(null)} variant="primary" className="w-full h-12 font-bold">Já salvei, fechar</Button>
         </div>
      </Modal>
    </div>
  );
}
