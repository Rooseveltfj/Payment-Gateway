"use client";

import { useState } from "react";
import { ChevronRight, Copy, Check, Play, BookOpen, Key, ShoppingBag, Users, DollarSign, Zap, Shield, TestTube } from "lucide-react";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  POST: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

const sections = [
  { id: "auth", label: "Autenticação", icon: Key },
  { id: "products", label: "Produtos", icon: ShoppingBag },
  { id: "orders", label: "Pedidos", icon: BookOpen },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "balance", label: "Financeiro", icon: DollarSign },
  { id: "webhooks", label: "Webhooks", icon: Zap },
  { id: "sandbox", label: "Sandbox", icon: TestTube },
  { id: "signature", label: "Validação de Assinatura", icon: Shield },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
    </button>
  );
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <div className="absolute top-0 right-14 px-2 py-1 text-[10px] uppercase font-bold text-slate-600 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        {lang}
      </div>
      <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm overflow-x-auto">
        <code className="text-slate-300 font-mono leading-relaxed">{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg border ${METHOD_COLORS[method] ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>
      {method}
    </span>
  );
}

function Endpoint({ method, path, desc, params, body, response, curl, node, python, php }: {
  method: string; path: string; desc: string;
  params?: { name: string; type: string; desc: string; required?: boolean }[];
  body?: string; response: string; curl: string; node: string; python: string; php: string;
}) {
  const [tab, setTab] = useState<"curl" | "node" | "python" | "php">("curl");
  const code = { curl, node, python, php };

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden mb-6">
      <div className="p-5 bg-slate-900/30">
        <div className="flex items-center gap-3 mb-3">
          <MethodBadge method={method} />
          <code className="text-sm text-slate-200 font-mono">{path}</code>
        </div>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>

      {params && params.length > 0 && (
        <div className="border-t border-slate-800 p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Parâmetros</p>
          <div className="space-y-2">
            {params.map((p) => (
              <div key={p.name} className="flex items-start gap-3 text-sm">
                <code className="font-mono text-primary w-32 flex-shrink-0">{p.name}</code>
                <span className="text-slate-600 w-16 flex-shrink-0">{p.type}</span>
                {p.required && <span className="text-red-400 text-xs">required</span>}
                <span className="text-slate-400">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {body && (
        <div className="border-t border-slate-800 p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Request Body</p>
          <CodeBlock code={body} lang="json" />
        </div>
      )}

      <div className="border-t border-slate-800 p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Response</p>
        <CodeBlock code={response} lang="json" />
      </div>

      <div className="border-t border-slate-800">
        <div className="flex border-b border-slate-800">
          {(["curl", "node", "python", "php"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === t ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-slate-300"}`}
            >
              {t === "node" ? "Node.js" : t}
            </button>
          ))}
        </div>
        <div className="p-5">
          <CodeBlock code={code[tab]} lang={tab === "curl" ? "bash" : tab} />
        </div>
      </div>
    </div>
  );
}

const BASE = "https://pulsepay.com.br";

export default function DocsPage() {
  const [active, setActive] = useState("auth");
  const [playgroundKey, setPlaygroundKey] = useState("");
  const [playgroundResult, setPlaygroundResult] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  const testBalance = async () => {
    if (!playgroundKey) return;
    setPlaygroundLoading(true);
    try {
      const r = await fetch("/api/v1/balance", {
        headers: { Authorization: `Bearer ${playgroundKey}` },
      });
      const data = await r.json();
      setPlaygroundResult(JSON.stringify(data, null, 2));
    } catch {
      setPlaygroundResult("Erro na requisição.");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#09090b", fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white tracking-tight">PulsePay</p>
              <p className="text-xs text-slate-500">API Docs v1</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActive(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === s.id ? "bg-primary/10 text-primary" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
              {active === s.id && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 mt-4">
          <a href="/dashboard/integracoes" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <Key className="h-3.5 w-3.5" /> Gerar API Key →
          </a>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-10 py-12 overflow-y-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
            v1 — Stable
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">Documentação da API</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Integre o PulsePay na sua aplicação com nossa API RESTful. Todas as respostas são retornadas em JSON.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <code className="text-sm bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-primary font-mono">{BASE}/api/v1/</code>
            <span className="text-slate-600 text-sm">Base URL</span>
          </div>
        </div>

        {/* Auth */}
        <section id="auth" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Autenticação</h2>
          <p className="text-slate-400 mb-6">Todas as requisições para a API pública exigem uma API Key válida enviada no header <code className="text-primary">Authorization</code>.</p>
          <CodeBlock code={`Authorization: Bearer bg_live_SEU_API_KEY`} />
          <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400">
            ⚠️ Nunca exponha sua API Key em código client-side. Use sempre no servidor.
          </div>
        </section>

        {/* Products */}
        <section id="products" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Produtos</h2>
          <p className="text-slate-400 mb-6">Gerencie os produtos da sua conta via API.</p>
          <Endpoint
            method="GET" path="/api/v1/products"
            desc="Lista todos os produtos da sua conta com paginação."
            params={[
              { name: "page", type: "number", desc: "Número da página (0-indexed)" },
              { name: "limit", type: "number", desc: "Itens por página (máx. 100)" },
            ]}
            response={`{\n  "data": [\n    {\n      "id": "clx...",\n      "name": "Curso de Marketing",\n      "price": 297.00,\n      "status": "ACTIVE",\n      "salesCount": 42,\n      "slug": "curso-de-marketing",\n      "createdAt": "2024-01-01T00:00:00.000Z"\n    }\n  ],\n  "meta": { "page": 0, "limit": 20, "total": 5, "pages": 1 }\n}`}
            curl={`curl -X GET "${BASE}/api/v1/products" \\\n  -H "Authorization: Bearer bg_live_..."`}
            node={`const res = await fetch("${BASE}/api/v1/products", {\n  headers: { "Authorization": "Bearer bg_live_..." }\n});\nconst { data } = await res.json();`}
            python={`import requests\nres = requests.get(\n  "${BASE}/api/v1/products",\n  headers={"Authorization": "Bearer bg_live_..."}\n)\nprint(res.json())`}
            php={`<?php\n$ch = curl_init("${BASE}/api/v1/products");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer bg_live_..."]);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$data = json_decode(curl_exec($ch), true);`}
          />
        </section>

        {/* Orders */}
        <section id="orders" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Pedidos</h2>
          <p className="text-slate-400 mb-6">Consulte e gerencie pedidos. Filtros disponíveis por status, produto e período.</p>
          <Endpoint
            method="GET" path="/api/v1/orders"
            desc="Lista pedidos com filtros opcionais."
            params={[
              { name: "status", type: "string", desc: "PENDING | PAID | FAILED | REFUNDED | CHARGEBACK" },
              { name: "product_id", type: "string", desc: "Filtrar por produto" },
              { name: "from", type: "ISO date", desc: "Data de início" },
              { name: "to", type: "ISO date", desc: "Data de fim" },
            ]}
            response={`{\n  "data": [{\n    "id": "ord_...",\n    "buyerName": "João Silva",\n    "buyerEmail": "joao@example.com",\n    "amount": 297.00,\n    "netAmount": 267.33,\n    "status": "PAID",\n    "paymentMethod": "PIX",\n    "paidAt": "2024-01-15T14:22:00.000Z",\n    "product": { "id": "prod_...", "name": "Curso de Marketing" }\n  }],\n  "meta": { "total": 150 }\n}`}
            curl={`curl "${BASE}/api/v1/orders?status=PAID&limit=10" \\\n  -H "Authorization: Bearer bg_live_..."`}
            node={`const res = await fetch("${BASE}/api/v1/orders?status=PAID", {\n  headers: { "Authorization": "Bearer bg_live_..." }\n});`}
            python={`res = requests.get("${BASE}/api/v1/orders",\n  params={"status": "PAID"},\n  headers={"Authorization": "Bearer bg_live_..."})`}
            php={`$url = "${BASE}/api/v1/orders?status=PAID";\n// curl or Guzzle request with Authorization header`}
          />
          <Endpoint
            method="POST" path="/api/v1/orders/:id/refund"
            desc="Solicita o estorno de um pedido com status PAID."
            response={`{ "data": { "id": "ord_...", "status": "REFUNDED", "refundedAt": "..." } }`}
            curl={`curl -X POST "${BASE}/api/v1/orders/ord_123/refund" \\\n  -H "Authorization: Bearer bg_live_..."`}
            node={`await fetch("${BASE}/api/v1/orders/ord_123/refund", {\n  method: "POST",\n  headers: { "Authorization": "Bearer bg_live_..." }\n});`}
            python={`requests.post("${BASE}/api/v1/orders/ord_123/refund",\n  headers={"Authorization": "Bearer bg_live_..."})`}
            php={`// POST request to /api/v1/orders/ord_123/refund`}
          />
        </section>

        {/* Customers */}
        <section id="customers" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Clientes</h2>
          <p className="text-slate-400 mb-6">Acesse dados dos compradores de forma deduplicada por email.</p>
          <Endpoint
            method="GET" path="/api/v1/customers"
            desc="Lista compradores únicos com estatísticas de compra."
            response={`{\n  "data": [{\n    "name": "João Silva",\n    "email": "joao@example.com",\n    "totalOrders": 3,\n    "totalSpent": 594.00,\n    "lastPurchase": "2024-01-15T00:00:00.000Z"\n  }]\n}`}
            curl={`curl "${BASE}/api/v1/customers" \\\n  -H "Authorization: Bearer bg_live_..."`}
            node={`const res = await fetch("${BASE}/api/v1/customers", {\n  headers: { "Authorization": "Bearer bg_live_..." }\n});`}
            python={`res = requests.get("${BASE}/api/v1/customers",\n  headers={"Authorization": "Bearer bg_live_..."})`}
            php={`// GET /api/v1/customers`}
          />
        </section>

        {/* Balance */}
        <section id="balance" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Financeiro</h2>
          <p className="text-slate-400 mb-6">Consulte os saldos da sua conta.</p>
          <Endpoint
            method="GET" path="/api/v1/balance"
            desc="Retorna os saldos atuais da conta autenticada."
            response={`{\n  "data": {\n    "available_balance": 1250.00,\n    "pending_balance": 300.00,\n    "total_earnings": 5000.00,\n    "total_withdrawn": 3450.00,\n    "currency": "BRL"\n  }\n}`}
            curl={`curl "${BASE}/api/v1/balance" \\\n  -H "Authorization: Bearer bg_live_..."`}
            node={`const { data } = await fetch("${BASE}/api/v1/balance", {\n  headers: { "Authorization": "Bearer bg_live_..." }\n}).then(r => r.json());`}
            python={`res = requests.get("${BASE}/api/v1/balance",\n  headers={"Authorization": "Bearer bg_live_..."})`}
            php={`// GET /api/v1/balance`}
          />
        </section>

        {/* Webhooks */}
        <section id="webhooks" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Webhooks</h2>
          <p className="text-slate-400 mb-6">Configure endpoints para receber notificações em tempo real de eventos na plataforma.</p>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 mb-6">
            <p className="text-sm font-bold text-white mb-4">Exemplo de Payload</p>
            <CodeBlock lang="json" code={`{\n  "event": "order.paid",\n  "timestamp": "2024-01-15T14:22:00.000Z",\n  "data": {\n    "order_id": "ord_abc123",\n    "product_id": "prod_xyz456",\n    "amount": 297.00,\n    "net_amount": 267.33,\n    "buyer": {\n      "name": "João Silva",\n      "email": "joao@example.com",\n      "cpf": "000.000.000-00"\n    },\n    "payment_method": "PIX",\n    "paid_at": "2024-01-15T14:22:00.000Z"\n  }\n}`} />
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-bold text-white mb-2">Eventos Disponíveis</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {["order.created","order.paid","order.failed","order.refunded","order.chargeback","withdrawal.requested","withdrawal.completed","withdrawal.failed"].map(e => (
                <code key={e} className="text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-primary font-mono">{e}</code>
              ))}
            </div>
          </div>
        </section>

        {/* Signature */}
        <section id="signature" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Validação de Assinatura</h2>
          <p className="text-slate-400 mb-6">Todo webhook inclui o header <code className="text-primary">X-PulsePay-Signature</code> com uma assinatura HMAC-SHA256. Valide para garantir autenticidade.</p>
          <CodeBlock lang="javascript" code={`// Node.js\nconst crypto = require('crypto');\n\nfunction verifyWebhook(body, signature, secret) {\n  const expected = 'sha256=' + \n    crypto.createHmac('sha256', secret)\n          .update(body)\n          .digest('hex');\n  return crypto.timingSafeEqual(\n    Buffer.from(signature),\n    Buffer.from(expected)\n  );\n}\n\n// Express.js\napp.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {\n  const sig = req.headers['x-pulsepay-signature'];\n  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {\n    return res.status(401).send('Invalid signature');\n  }\n  const event = JSON.parse(req.body);\n  // handle event...\n  res.status(200).send('OK');\n});`} />
        </section>

        {/* Sandbox */}
        <section id="sandbox" className="mb-16 scroll-mt-4">
          <h2 className="text-2xl font-black text-white mb-2">Sandbox</h2>
          <p className="text-slate-400 mb-6">Use chaves prefixadas com <code className="text-primary">pp_test_</code> para fazer testes sem processar pagamentos reais.</p>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Playground — Testar API ao vivo
            </p>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="pp_live_... ou pp_test_..."
                value={playgroundKey}
                onChange={(e) => setPlaygroundKey(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-mono"
              />
              <button
                onClick={testBalance}
                disabled={playgroundLoading || !playgroundKey}
                className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Play className="h-4 w-4" />
                {playgroundLoading ? "..." : "GET /balance"}
              </button>
            </div>
            {playgroundResult && (
              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto">
                  {playgroundResult}
                </pre>
                <CopyButton text={playgroundResult} />
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
