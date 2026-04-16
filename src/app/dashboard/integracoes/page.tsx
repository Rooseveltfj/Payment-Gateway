"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Copy, Trash2, AlertTriangle, Check, Zap, TestTube } from "lucide-react";

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



export default function IntegracoesPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"LIVE" | "TEST">("LIVE");
  const [createdKey, setCreatedKey] = useState<NewKeyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/integracoes/api-keys");
      setKeys(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const r = await fetch("/api/dashboard/integracoes/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, environment: newKeyEnv }),
      });
      const data = await r.json();
      setCreatedKey(data);
      setShowCreate(false);
      setNewKeyName("");
      fetchKeys();
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    await fetch("/api/dashboard/integracoes/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchKeys();
  };

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#09090b", color: "#e2e8f0" }}>
      <div className="pl-60 pt-14">
        <div className="px-8 py-8 max-w-5xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Integrações</h1>
              <p className="text-slate-400 text-sm mt-1">Gerencie suas API Keys para integrar com sistemas externos.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Nova API Key
            </button>
          </div>

          {/* Auth info */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 mb-7 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Autenticação via Bearer Token</p>
              <code className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                Authorization: Bearer bg_live_...
              </code>
              <p className="text-xs text-slate-500 mt-2">
                Inclua este header em todas as requisições para <code className="text-primary">/api/v1/</code>.
                Consulte a <a href="/docs" className="text-primary underline">documentação</a> completa.
              </p>
            </div>
          </div>

          {/* Keys list */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-900/40 rounded-2xl animate-pulse border border-slate-800" />
              ))
            ) : keys.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma API Key. Crie a primeira para começar a integrar.</p>
              </div>
            ) : (
              keys.map((k) => (
                <div key={k.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-2.5 w-2.5 rounded-full ${k.active ? "bg-emerald-400" : "bg-red-500"}`} />
                    <div>
                      <p className="font-semibold text-white text-sm">{k.name}</p>
                      <code className="text-xs text-slate-500 font-mono">{k.preview}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Último uso</p>
                      <p className="text-xs text-slate-300">
                        {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString("pt-BR") : "Nunca"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Criado em</p>
                      <p className="text-xs text-slate-300">{new Date(k.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    {k.active && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Revogar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Webhook link */}
          <div className="mt-8 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl p-6 text-center">
            <Zap className="h-8 w-8 text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white mb-1">Webhooks</p>
            <p className="text-xs text-slate-500 mb-4">Configure endpoints para receber eventos em tempo real.</p>
            <a
              href="/dashboard/integracoes/webhooks"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Gerenciar Webhooks →
            </a>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-black text-white mb-6">Gerar Nova API Key</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Nome da Key</label>
                <input
                  type="text"
                  placeholder="ex: Produção, Testes, App Mobile"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Ambiente</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["LIVE", "TEST"] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setNewKeyEnv(env)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                        newKeyEnv === env
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {env === "LIVE" ? <Zap className="h-4 w-4" /> : <TestTube className="h-4 w-4" />}
                      {env}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-bold hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={creating || !newKeyName.trim()} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {creating ? "Gerando..." : "Gerar Key"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Created Modal */}
      {createdKey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Copie agora!</h2>
                <p className="text-xs text-amber-400">Esta chave não será exibida novamente.</p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 flex items-center gap-3">
              <code className="text-sm text-emerald-400 font-mono flex-1 break-all">{createdKey.key}</code>
              <button onClick={copyKey} className="flex-shrink-0 p-2 hover:bg-slate-700 rounded-lg transition-colors">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Guarde esta chave em um local seguro como um gerenciador de senhas. Você não poderá visualizá-la novamente.
            </p>

            <button
              onClick={() => setCreatedKey(null)}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Já copiei, fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
