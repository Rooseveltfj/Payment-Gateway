"use client";

import { useState } from "react";
import { addDomain, verifyDomain, deleteDomain } from "./actions";
import { Globe, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2, Copy, ExternalLink, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  domains: any[];
}

export function DominiosClient({ domains }: Props) {
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    setLoading(true);
    try {
      await addDomain(newDomain);
      setNewDomain("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const result = await verifyDomain(id);
      alert(result.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Domínios Customizados</h1>
        <p className="text-text-secondary mt-1">Aponte seu próprio domínio para profissionalizar seus checkouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
            <div className="space-y-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Adicionar Domínio
              </h2>
              <p className="text-xs text-text-secondary">Ex: checkout.seunegocio.com.br</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ex: pagar.meudominio.com"
                required
              />
              <button 
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Adicionando..." : "Conectar Domínio"}
              </button>
            </form>

            <div className="pt-4 border-t border-border/50">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary">Dica de Configuração</p>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Recomendamos o uso de subdomínios como <b>checkout</b> ou <b>pagamento</b> para não interferir no seu site principal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domains List & Instructions */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-bold">Meus Domínios</h2>
          
          <div className="space-y-4">
            {domains.length === 0 ? (
              <div className="border border-dashed border-border rounded-3xl p-12 text-center space-y-3">
                <Globe className="w-12 h-12 text-text-secondary/30 mx-auto" />
                <p className="text-text-secondary text-sm">Nenhum domínio configurado ainda.</p>
              </div>
            ) : (
              domains.map((domain) => (
                <div key={domain.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        domain.status === "ACTIVE" ? "bg-green-500/10 text-green-500" :
                        domain.status === "ERROR" ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      )}>
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold flex items-center gap-2">
                          {domain.domain}
                          {domain.status === "ACTIVE" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            domain.status === "ACTIVE" ? "bg-green-500/10 text-green-500" :
                            domain.status === "ERROR" ? "bg-red-500/10 text-red-500" :
                            "bg-yellow-500/10 text-yellow-500"
                          )}>
                            {domain.status === "ACTIVE" ? "Ativo" :
                             domain.status === "PENDING" ? "Aguardando DNS" :
                             domain.status === "ERROR" ? "Erro de Conf." : "Verificado"}
                          </span>
                          <span className="text-[10px] text-text-secondary">Adicionado em {new Date(domain.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleVerify(domain.id)}
                         disabled={verifyingId === domain.id}
                         className="p-2.5 rounded-xl hover:bg-hover transition-all text-text-secondary hover:text-primary border border-border"
                         title="Verificar DNS"
                       >
                         <RefreshCw className={cn("w-4 h-4", verifyingId === domain.id && "animate-spin")} />
                       </button>
                       <button 
                         onClick={() => { if(confirm("Remover este domínio?")) deleteDomain(domain.id) }}
                         className="p-2.5 rounded-xl hover:bg-red-500/10 transition-all text-text-secondary hover:text-red-500 border border-border"
                         title="Excluir"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  {/* DNS Instructions (Visible if not active) */}
                  {domain.status !== "ACTIVE" && (
                    <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-hover/30">
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-primary" />
                          <h4 className="text-xs font-bold uppercase text-primary">Instruções de Apontamento</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-card border border-border rounded-xl p-3 space-y-1 relative">
                            <span className="text-[10px] text-text-secondary uppercase font-bold">Tipo</span>
                            <p className="text-sm font-mono font-bold">CNAME</p>
                          </div>
                          <div className="bg-card border border-border rounded-xl p-3 space-y-1 relative group">
                            <span className="text-[10px] text-text-secondary uppercase font-bold">Valor / Host</span>
                            <p className="text-sm font-mono font-bold">checkouts.pulsepay.com.br</p>
                            <button 
                              onClick={() => copyToClipboard("checkouts.pulsepay.com.br")}
                              className="absolute top-3 right-3 p-1 rounded hover:bg-hover opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            Acesse o painel do seu registrador de domínios (Cloudflare, Registro.br, HostGator, etc.) e crie um registro <b>CNAME</b> apontando <b>{domain.domain}</b> para <b>checkouts.pulsepay.com.br</b>. A propagação pode levar de alguns minutos até 24h.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
