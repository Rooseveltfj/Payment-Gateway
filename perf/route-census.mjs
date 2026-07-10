// PERF Fase 1 — Passo 2: censo de queries por rota (dev :3000)
// Uso: SESSION_COOKIE="<valor>" node perf/route-census.mjs
// Lê perf/raw/queries.ndjson (instrumentação temporária em src/lib/prisma.ts)
// Saída: perf/raw/census.json + resumo no console
import fs from "node:fs";
import { performance } from "node:perf_hooks";

const NDJSON = "perf/raw/queries.ndjson";
const BASE = "http://localhost:3000";
const COOKIE = process.env.SESSION_COOKIE;
if (!COOKIE) { console.error("Defina SESSION_COOKIE"); process.exit(1); }

const ROUTES = [
  "/api/admin/metrics",
  "/api/admin/users?page=1&limit=10",
  "/api/admin/overview-stats",
  "/api/admin/transactions",
  "/api/admin/kyc",
  "/api/admin/withdrawals",
  "/api/dashboard/metrics",
];

const size = () => { try { return fs.statSync(NDJSON).size; } catch { return 0; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r1 = (n) => Math.round(n * 10) / 10;

async function waitQuiet(quietMs = 3000, maxMs = 20000) {
  let last = size(); const t0 = Date.now(); let lastChange = Date.now();
  while (Date.now() - t0 < maxMs) {
    await sleep(300);
    const s = size();
    if (s !== last) { last = s; lastChange = Date.now(); }
    else if (Date.now() - lastChange >= quietMs) return;
  }
}

function readSlice(fromByte) {
  if (!fs.existsSync(NDJSON)) return [];
  const buf = fs.readFileSync(NDJSON);
  return buf.slice(fromByte).toString("utf8").trim().split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function analyze(slice) {
  if (!slice.length) return { n: 0 };
  const sum = slice.reduce((a, e) => a + e.ms, 0);
  const starts = slice.map((e) => e.t - e.ms);
  const span = Math.max(...slice.map((e) => e.t)) - Math.min(...starts);
  const slowest = slice.reduce((a, e) => (e.ms > a.ms ? e : a));
  return {
    n: slice.length,
    sum_ms: r1(sum),
    wall_span_ms: r1(span),
    concurrency: r1(sum / Math.max(span, 1)), // ~1 = sequencial; >1.5 = paralelo
    slowest: { ms: r1(slowest.ms), q: slowest.q.slice(0, 160), p: slowest.p },
  };
}

const results = [];
for (const route of ROUTES) {
  for (let run = 1; run <= 3; run++) {
    const offset = size();
    const t0 = performance.now();
    let status, ttfb;
    try {
      const res = await fetch(BASE + route, { headers: { cookie: `authjs.session-token=${COOKIE}` } });
      ttfb = r1(performance.now() - t0); // headers recebidos ≈ TTFB
      status = res.status;
      await res.text();
    } catch (e) { status = `ERR ${e.message}`; ttfb = null; }
    await waitQuiet();
    const slice = readSlice(offset);
    const a = analyze(slice);
    const row = { route, run, status, ttfb_dev_ms: ttfb, ...a };
    results.push(row);
    fs.writeFileSync(`perf/raw/slice-${route.replace(/[/?&=]/g, "_")}-run${run}.json`, JSON.stringify(slice, null, 2));
    console.log(`${route} [run${run}] HTTP ${status}  TTFB ${ttfb}ms  queries=${a.n}  sum=${a.sum_ms}ms  span=${a.wall_span_ms}ms  conc=${a.concurrency}  slowest=${a.slowest?.ms}ms`);
    if (status === 401) { console.error("401 — cookie inválido/expirado. Abortando."); process.exit(1); }
  }
}
fs.writeFileSync("perf/raw/census.json", JSON.stringify(results, null, 2));
console.log("\nSaída: perf/raw/census.json");
