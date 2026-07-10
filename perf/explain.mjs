// PERF Fase 1 — Passo 5: EXPLAIN (ANALYZE, BUFFERS) das queries mais lentas do censo
// Uso: node perf/explain.mjs   — conecta via session pooler :5432 (nunca 6543)
import "dotenv/config";
import pg from "pg";
import fs from "node:fs";

const sessionPoolerUrl = process.env.DATABASE_URL.replace(":6543/", ":5432/");
const ssl = { rejectUnauthorized: false };

// 1. Coletar queries de todos os slices, dedupe por shape, top-6 por duração
const slices = fs.readdirSync("perf/raw").filter((f) => f.startsWith("slice-") && f.endsWith(".json"));
const all = slices.flatMap((f) => JSON.parse(fs.readFileSync(`perf/raw/${f}`, "utf8")).map((e) => ({ ...e, src: f })));
const skip = /^(BEGIN|COMMIT|ROLLBACK|SET|DEALLOCATE)/i;
const byShape = new Map();
for (const e of all) {
  if (skip.test(e.q)) continue;
  const cur = byShape.get(e.q);
  if (!cur || e.ms > cur.ms) byShape.set(e.q, e);
}
const top = [...byShape.values()].sort((a, b) => b.ms - a.ms).slice(0, 6);

const c = new pg.Client({ connectionString: sessionPoolerUrl, ssl, connectionTimeoutMillis: 15000 });
await c.connect();
let report = `EXPLAIN via session pooler :5432 — ${new Date().toISOString()}\n`;

for (const [i, e] of top.entries()) {
  let params = [];
  try { params = typeof e.p === "string" ? JSON.parse(e.p) : e.p || []; } catch { /* sem params */ }
  report += `\n${"═".repeat(90)}\n[${i + 1}] client-observed: ${e.ms.toFixed(1)}ms  (fonte: ${e.src})\n${e.q}\nparams: ${JSON.stringify(params)}\n\n`;
  try {
    const r = await c.query(`EXPLAIN (ANALYZE, BUFFERS) ${e.q}`, params);
    const plan = r.rows.map((row) => row["QUERY PLAN"]).join("\n");
    report += plan + "\n";
    const exec = plan.match(/Execution Time: ([\d.]+) ms/)?.[1];
    const planT = plan.match(/Planning Time: ([\d.]+) ms/)?.[1];
    report += `\n→ DB executou em ${exec}ms (planning ${planT}ms) vs ${e.ms.toFixed(1)}ms observados no cliente ⇒ rede/pooler = ${(e.ms - parseFloat(exec ?? 0)).toFixed(1)}ms\n`;
    console.log(`[${i + 1}] exec=${exec}ms plan=${planT}ms client=${e.ms.toFixed(1)}ms  ${e.q.slice(0, 70)}...`);
  } catch (err) {
    report += `EXPLAIN FALHOU: ${err.message}\n`;
    console.error(`[${i + 1}] FALHOU: ${err.message}`);
  }
}
await c.end();
fs.writeFileSync("perf/raw/explain.txt", report);
console.log("\nSaída: perf/raw/explain.txt");
