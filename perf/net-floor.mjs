// PERF Fase 1 — Passo 1: piso de rede + inventário do banco (somente leitura)
// Uso: node perf/net-floor.mjs   (a partir da raiz do repo)
// Saídas: perf/raw/net-floor.json, perf/raw/db-inventory.json
import "dotenv/config";
import pg from "pg";
import fs from "node:fs";
import { performance } from "node:perf_hooks";

const OUT_DIR = new URL("./raw/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ssl = { rejectUnauthorized: false }; // espelha src/lib/prisma.ts

const poolerUrl = process.env.DATABASE_URL; // :6543 transaction pooler (o que o app usa)
const directUrl = process.env.DIRECT_URL;   // :5432 direto
// Fallback p/ EXPLAIN/inventário se o direto falhar (IPv6): session pooler = mesmo host do pooler, porta 5432
const sessionPoolerUrl = poolerUrl?.replace(":6543/", ":5432/");

const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const p95 = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(s.length * 0.95) - 1)]; };
const r1 = (n) => Math.round(n * 10) / 10;

async function timedConnectCycle(url, timeoutMs = 10000) {
  const c = new pg.Client({ connectionString: url, ssl, connectionTimeoutMillis: timeoutMs });
  const t0 = performance.now();
  await c.connect();
  const tConn = performance.now();
  await c.query("SELECT 1");
  const tQ = performance.now();
  await c.end();
  return { connectMs: tConn - t0, queryMs: tQ - tConn };
}

async function measureTarget(name, url, { cycles = 10, warmQueries = 20 } = {}) {
  const connects = [], coldQueries = [];
  for (let i = 0; i < cycles; i++) {
    const { connectMs, queryMs } = await timedConnectCycle(url);
    connects.push(connectMs); coldQueries.push(queryMs);
  }
  // RTT warm: 1 conexão persistente
  const c = new pg.Client({ connectionString: url, ssl, connectionTimeoutMillis: 10000 });
  await c.connect();
  const warm = [];
  for (let i = 0; i < warmQueries; i++) {
    const t0 = performance.now();
    await c.query("SELECT 1");
    warm.push(performance.now() - t0);
  }
  await c.end();
  return {
    name, url_host: new URL(url).host,
    connect_median_ms: r1(median(connects)), connect_p95_ms: r1(p95(connects)),
    warm_rtt_median_ms: r1(median(warm)), warm_rtt_p95_ms: r1(p95(warm)),
    connects_raw: connects.map(r1), warm_raw: warm.map(r1),
  };
}

async function inventory(url) {
  const c = new pg.Client({ connectionString: url, ssl, connectionTimeoutMillis: 10000 });
  await c.connect();
  const counts = {};
  for (const t of ["User", "Order", "Transaction", "Withdrawal", "AuditLog", "Product", "PendingBalance", "Affiliation", "AffiliationSale", "KycDocument", "AdminLog", "Notification"]) {
    try {
      const r = await c.query(`SELECT COUNT(*)::int AS n FROM "${t}"`);
      counts[t] = r.rows[0].n;
    } catch (e) { counts[t] = `ERR: ${e.message}`; }
  }
  const stat = await c.query(`SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC`);
  const idx = await c.query(`SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname`);
  await c.end();
  return { counts, pg_stat_user_tables: stat.rows, pg_indexes: idx.rows };
}

const results = { started_at: new Date().toISOString(), targets: [], first_touch: null, notes: [] };

// ── FIRST TOUCH (cold start da reativação, se houver) — via pooler, como o app faz
try {
  const ft = await timedConnectCycle(poolerUrl, 30000);
  results.first_touch = { via: "pooler:6543", connect_ms: r1(ft.connectMs), select1_ms: r1(ft.queryMs) };
  console.log(`first_touch (pooler): connect ${r1(ft.connectMs)}ms, SELECT 1 ${r1(ft.queryMs)}ms`);
} catch (e) {
  results.first_touch = { via: "pooler:6543", error: e.message };
  console.error("first_touch FALHOU:", e.message);
}

// ── PISO: pooler 6543
try {
  const t = await measureTarget("pooler_transaction_6543", poolerUrl);
  results.targets.push(t);
  console.log(`pooler:6543  connect med ${t.connect_median_ms}ms (p95 ${t.connect_p95_ms})  |  SELECT1 warm med ${t.warm_rtt_median_ms}ms (p95 ${t.warm_rtt_p95_ms})`);
} catch (e) { results.notes.push(`pooler 6543 FALHOU: ${e.message}`); console.error("pooler 6543:", e.message); }

// ── PISO: direto 5432, com fallback session pooler
let inventoryUrl = null, directLabel = null;
try {
  const t = await measureTarget("direct_5432", directUrl);
  results.targets.push(t);
  inventoryUrl = directUrl; directLabel = "direct_5432";
  console.log(`direct:5432  connect med ${t.connect_median_ms}ms (p95 ${t.connect_p95_ms})  |  SELECT1 warm med ${t.warm_rtt_median_ms}ms (p95 ${t.warm_rtt_p95_ms})`);
} catch (e) {
  results.notes.push(`direct 5432 falhou (${e.message}) — tentando session pooler 5432`);
  console.error("direct 5432 falhou:", e.message, "→ fallback session pooler");
  try {
    const t = await measureTarget("session_pooler_5432", sessionPoolerUrl);
    results.targets.push(t);
    inventoryUrl = sessionPoolerUrl; directLabel = "session_pooler_5432";
    console.log(`session:5432 connect med ${t.connect_median_ms}ms (p95 ${t.connect_p95_ms})  |  SELECT1 warm med ${t.warm_rtt_median_ms}ms (p95 ${t.warm_rtt_p95_ms})`);
  } catch (e2) { results.notes.push(`session pooler 5432 também falhou: ${e2.message}`); console.error("session pooler:", e2.message); }
}

fs.writeFileSync(`${OUT_DIR}net-floor.json`, JSON.stringify(results, null, 2));

// ── INVENTÁRIO (na melhor conexão 5432 disponível; pooler como último recurso)
const invUrl = inventoryUrl || poolerUrl;
try {
  const inv = await inventory(invUrl);
  inv.via = inventoryUrl ? directLabel : "pooler_6543";
  fs.writeFileSync(`${OUT_DIR}db-inventory.json`, JSON.stringify(inv, null, 2));
  console.log("\n── Row counts ──");
  for (const [t, n] of Object.entries(inv.counts)) console.log(`${t.padEnd(18)} ${n}`);
  console.log(`\nÍndices públicos: ${inv.pg_indexes.length} (detalhe em db-inventory.json)`);
} catch (e) { console.error("inventário FALHOU:", e.message); }

console.log(`\nSaídas: perf/raw/net-floor.json, perf/raw/db-inventory.json`);
