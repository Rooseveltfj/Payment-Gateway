"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, Plus, Trash2, Play, Check, X, ChevronDown, ChevronUp, Clock, Globe } from "lucide-react";

const ALL_EVENTS = [
  { id: "order.created", label: "Pedido criado", group: "Pedidos" },
  { id: "order.paid", label: "Pedido pago", group: "Pedidos" },
  { id: "order.failed", label: "Pagamento falhou", group: "Pedidos" },
  { id: "order.refunded", label: "Estorno realizado", group: "Pedidos" },
  { id: "order.chargeback", label: "Chargeback", group: "Pedidos" },
  { id: "withdrawal.requested", label: "Saque solicitado", group: "Saques" },
  { id: "withdrawal.completed", label: "Saque concluído", group: "Saques" },
  { id: "withdrawal.failed", label: "Saque falhou", group: "Saques" },
];

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

interface WebhookLog {
  id: string;
  event: string;
  success: boolean;
  statusCode: number | null;
  response: string | null;
  sentAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["order.paid"]);
  const [creating, setCreating] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<Record<string, WebhookLog[]>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, boolean | null>>({});

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/integracoes/webhooks");
      setWebhooks(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const handleCreate = async () => {
    if (!newUrl || !newEvents.length) return;
    setCreating(true);
    try {
      await fetch("/api/dashboard/integracoes/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, events: newEvents }),
      });
      setShowCreate(false);
      setNewUrl("");
      setNewEvents(["order.paid"]);
      fetchWebhooks();
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/dashboard/integracoes/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    await fetch(`/api/dashboard/integracoes/webhooks/${id}`, { method: "DELETE" });
    fetchWebhooks();
  };

  const fetchLogs = async (id: string) => {
    if (expandedLogs === id) { setExpandedLogs(null); return; }
    const r = await fetch(`/api/dashboard/integracoes/webhooks/${id}/logs`);
    const data = await r.json();
    setLogs((prev) => ({ ...prev, [id]: data.data }));
    setExpandedLogs(id);
  };

  const testWebhook = async (id: string) => {
    setTestingId(id);
    try {
      const r = await fetch(`/api/dashboard/integracoes/webhooks/${id}/test`, { method: "POST" });
      const data = await r.json();
      setTestResult((prev) => ({ ...prev, [id]: data.success }));
      setTimeout(() => setTestResult((prev) => ({ ...prev, [id]: null })), 3000);
    } finally {
      setTestingId(null);
    }
  };

  const toggleEvent = (e: string) => {
    setNewEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  };

  return (
    <div className="min-h-screen" style={{ background: "#09090b", color: "#e2e8f0" }}>
      <div className="pl-60 pt-14">
        <div className="px-8 py-8 max-w-5xl">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Webhooks</h1>
              <p className="text-slate-400 text-sm mt-1">Receba eventos em tempo real no seu servidor.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Novo Endpoint
            </button>
          </div>

          {/* Webhooks List */}
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-900/40 rounded-2xl animate-pulse border border-slate-800" />
              ))
            ) : webhooks.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum webhook configurado ainda.</p>
              </div>
            ) : (
              webhooks.map((wh) => (
                <div key={wh.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${wh.active ? "bg-emerald-400" : "bg-slate-600"}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-3.5 w-3.5 text-slate-500" />
                          <code className="text-sm text-white font-mono">{wh.url}</code>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {wh.events.map((ev) => (
                            <span key={ev} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{ev}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Test Button */}
                      <button
                        onClick={() => testWebhook(wh.id)}
                        disabled={testingId === wh.id}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                          testResult[wh.id] === true ? "bg-emerald-500/20 text-emerald-400" :
                          testResult[wh.id] === false ? "bg-red-500/20 text-red-400" :
                          "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {testResult[wh.id] === true ? <Check className="h-3.5 w-3.5" /> :
                         testResult[wh.id] === false ? <X className="h-3.5 w-3.5" /> :
                         <Play className="h-3.5 w-3.5" />}
                        {testingId === wh.id ? "Testando..." : "Testar"}
                      </button>
                      {/* Logs Button */}
                      <button
                        onClick={() => fetchLogs(wh.id)}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold transition-colors"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Logs
                        {expandedLogs === wh.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      {/* Toggle */}
                      <button
                        onClick={() => toggleActive(wh.id, wh.active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                          wh.active ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                        }`}
                      >
                        {wh.active ? "Ativo" : "Inativo"}
                      </button>
                      {/* Delete */}
                      <button onClick={() => deleteWebhook(wh.id)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Logs Panel */}
                  {expandedLogs === wh.id && (
                    <div className="border-t border-slate-800 bg-slate-950/50">
                      <div className="p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Últimos disparos</p>
                        {!logs[wh.id] || logs[wh.id].length === 0 ? (
                          <p className="text-xs text-slate-600 text-center py-4">Nenhum disparo registrado.</p>
                        ) : (
                          <div className="space-y-2">
                            {logs[wh.id].map((log) => (
                              <div key={log.id} className="flex items-center gap-3 text-xs">
                                <span className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${log.success ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                                  {log.success ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-red-400" />}
                                </span>
                                <span className="font-mono text-slate-400">{log.event}</span>
                                <span className={`font-bold ${log.statusCode && log.statusCode < 300 ? "text-emerald-400" : "text-red-400"}`}>
                                  {log.statusCode ?? "ERR"}
                                </span>
                                <span className="text-slate-600 flex-1 truncate">{log.response}</span>
                                <span className="text-slate-600">{new Date(log.sentAt).toLocaleString("pt-BR")}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-black text-white mb-6">Novo Endpoint Webhook</h2>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">URL do Endpoint</label>
                <input
                  type="url"
                  placeholder="https://seusite.com/webhooks/PulsePay"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 block">Eventos a receber</label>
                <div className="grid grid-cols-1 gap-2">
                  {["Pedidos", "Saques"].map((group) => (
                    <div key={group}>
                      <p className="text-xs text-slate-600 uppercase font-bold tracking-widest mb-1.5">{group}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {ALL_EVENTS.filter((e) => e.group === group).map((ev) => (
                          <button
                            key={ev.id}
                            onClick={() => toggleEvent(ev.id)}
                            className={`flex items-center gap-2 text-xs p-2.5 rounded-lg border transition-all text-left ${
                              newEvents.includes(ev.id)
                                ? "border-primary/50 bg-primary/10 text-primary"
                                : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400"
                            }`}
                          >
                            <div className={`h-3.5 w-3.5 rounded flex items-center justify-center border ${newEvents.includes(ev.id) ? "bg-primary border-primary" : "border-slate-600"}`}>
                              {newEvents.includes(ev.id) && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <span className="font-mono">{ev.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-bold hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={creating || !newUrl || !newEvents.length} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {creating ? "Criando..." : "Criar Endpoint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
