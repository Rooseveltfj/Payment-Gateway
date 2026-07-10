# PERF_BASELINE — PulsePay Admin (Fase 1: só medição, nada otimizado)

- **Data:** 2026-07-10 · **Commit:** `11d142b` (main) · **Node** v24.14.1 · **Next** 14.2.35 · **Prisma** 7.7.0 (`@prisma/adapter-pg`, pg.Pool)
- **DB:** Supabase Postgres us-east-1 (free tier, reativado em ~2026-07-09), acesso runtime via transaction pooler `:6543`
- **Máquina de teste:** Windows 10 local (localhost), admin logado

## 1. Metodologia

- **Baseline oficial de TTFB:** `next build` + `next start -p 3001` (produção). Por rota: 3 hits de aquecimento descartados + 12 amostras back-to-back → mediana e p95 (curl `%{time_starttransfer}`, cookie de sessão real do admin).
- **Censo de queries:** dev `:3000` com log event-based temporário do Prisma (duração + SQL + params → NDJSON). 3 runs/rota; run 1 (compile+pool frio) descartado; contagens idênticas nos runs 2–3 em 7/7 rotas (censo íntegro; abas do app fechadas → sem poluição de polling).
- **Exclusões:** first-touch e probes de pool idle reportados em linhas próprias, nunca nas medianas.
- **EXPLAIN (ANALYZE, BUFFERS):** via session pooler `:5432` (extended protocol com os params reais capturados). `DIRECT_URL` do .env **não resolve DNS** (host IPv6-only) — além de não ser usada por nenhum código.

## 2. Piso de rede (localhost → Supabase us-east-1)

| Caminho | first-touch | connect mediana/p95 | SELECT 1 warm mediana/p95 |
|---|---|---|---|
| transaction pooler :6543 (o que o app usa) | 880ms connect + 142ms query | **845ms** / 859ms | **140ms** / 142ms |
| session pooler :5432 | — | 845ms / 894ms | 141ms / 142ms |
| direto db.*.supabase.co:5432 | — | **ENOTFOUND** (IPv6-only) | — |

- **F (piso por query, conexão quente): ≈ 141ms** — pura distância geográfica; ICMP bloqueado pela AWS, piso medido via `SELECT 1`.
- **C (taxa de conexão nova: TCP+TLS+auth): ≈ 845ms.**
- Cold start de reativação do projeto: **não observado** nesta sessão (first_touch ≈ connect normal). Banco já estava acordado.
- Relevância do C: [src/lib/prisma.ts](src/lib/prisma.ts) usa `idleTimeoutMillis: 10000` + `allowExitOnIdle: true` → **o pool esvazia após 10s sem tráfego**; navegação intermitente (o padrão real de uso do admin) paga C de novo a cada clique.

## 3. Tamanho das tabelas e índices

| Tabela | Linhas | Índices |
|---|---|---|
| Order | 518 | 5 (uniques + userId+status, createdAt, wooviCorrelationId) |
| Product | 12 | 4 |
| User | 11 | 3 (pk, email, username) |
| KycDocument | 8 | 1 (pk) |
| AuditLog | 6 | 4 |
| AdminLog | 3 | 1 (pk) |
| Transaction / Withdrawal / PendingBalance / Affiliation* | **0** | só pk |

> **Caveat central:** com esses volumes, seq scan é o plano ótimo. **Nenhum índice ausente é gargalo hoje** (comprovado no §4: exec ≤0,16ms). Índices ausentes (`Order.status` isolado, `User.status/kycStatus/createdAt`, Transaction/Withdrawal sem nenhum, FKs de afiliação) são **risco de escala futuro**, categoria CODE, prioridade baixa nesta fase.

## 4. Baseline por rota

TTFB prod = mediana de 12 amostras (p95); TTFB dev = média runs 2–3 (fidelidade ao sintoma); previsto = `F × cadeias_sequenciais` (modelo).

| Rota | TTFB prod med (p95) | TTFB dev | Queries (seq/estrutura) | Query mais lenta (warm) | Previsto | Veredito |
|---|---|---|---|---|---|---|
| `GET /api/admin/metrics` | **1432ms** (1489) | 1450ms | **10 / 10 sequenciais** (conc=1,0) | 143ms (groupBy Order) — exec DB 0,05ms | 10×141=1410 | **RTT-bound: 98,5% do TTFB é round-trip serial** |
| `GET /api/admin/users` | **722ms** (767) | 748ms | 13 / $transaction(findMany+count)=~4 RTT + 10 aggregates N+1 em paralelo | 150ms — exec DB 0,15ms | ~5×141=705 | RTT-bound; N+1 já paralelo, mas tx serializa 4 hops |
| `GET /api/admin/overview-stats` | **151ms** (155) | 178ms | 5 / **todas paralelas** (conc=5,0) | 145ms | 1×141 | ✅ **prova do conserto: 5 queries ≈ 1 RTT** |
| `GET /api/admin/transactions` | 293ms (304) | 346ms | 4 / 2 pares (conc=2,0) | 201ms — exec DB 0,15ms | 2×141=282 | RTT-bound |
| `GET /api/admin/kyc` | 292ms (300) | 311ms | 2 / sequenciais | 143ms | 282 | RTT-bound |
| `GET /api/admin/withdrawals` | 291ms (339) | 333ms | 2 / sequenciais | 175ms | 282 | RTT-bound |
| `GET /api/dashboard/metrics` | 294ms (298) | 318ms | 4 / 2 pares (conc=2,0) | 148ms | 282 | RTT-bound |
| **Probe pool idle** (15s parado → `/api/admin/kyc`) | **1143ms** (1278) | — | mesmas 2 queries | 1ª query paga connect | 282+845=1127 | **taxa de reconexão ≈ +851ms por clique intermitente** |

**Validação do modelo:** previsto vs medido fecha com erro <5% em 8/8 linhas. O TTFB é integralmente explicado por `F × profundidade_sequencial (+ C se pool idle)`. Sobra de compute do app: 10–25ms.

**EXPLAIN (top-6 queries do censo):** execução no servidor entre **0,02ms e 0,16ms** (planning ≤0,63ms). Diferença cliente-observado ↔ execução = 141–1010ms = rede + (quando pool frio) conexão. **Zero evidência de query lenta, plano ruim ou compute do free tier saturado.**

## 5. Gargalos priorizados (impacto ÷ risco) — NADA foi corrigido nesta fase

| # | Gargalo | Evidência | Impacto estimado | Risco de correção |
|---|---|---|---|---|
| 1 | **10 queries sequenciais em `/api/admin/metrics`** ([route.ts:21-90](src/app/api/admin/metrics/route.ts)) | conc=1,0; 1410 de 1432ms | 1432→~300ms (−79%) com `Promise.all` (mesma técnica já usada em overview-stats) | Baixo: rota read-only, sem lógica de negócio |
| 2 | **Pool descarta conexões a cada 10s idle** (`idleTimeoutMillis:10000`, `allowExitOnIdle:true` em [prisma.ts](src/lib/prisma.ts)) | probe: +851ms em todo primeiro clique após pausa | remove ~850ms do "primeiro clique" — o sintoma mais sentido na navegação real | Baixo/médio: subir idle timeout + keepAlive; atenção ao limite de conexões do pooler free tier |
| 3 | **`$transaction` para 2 leituras independentes em `/api/admin/users`** ([route.ts:38-51](src/app/api/admin/users/route.ts)) + N+1 de aggregates | tx = ~4 RTT serializados; 13 statements onde 2 bastariam (`Promise.all` + `groupBy`) | 722→~300ms (−58%) | Baixo: leituras puras |
| 4 | Duplas de queries sequenciais nas demais rotas admin (kyc, withdrawals, transactions, dashboard/metrics) | 2 hops onde 1 basta | ~290→~160ms cada | Baixo |
| 5 | Páginas admin são `"use client"` + fetch em useEffect (documento → JS → API em série) | não medido além do TTFB da API; navegação real soma os hops | a quantificar se Fase 3 aprovar | Médio (refactor de rendering) |
| 6 | Índices ausentes (§3) | exec ≤0,16ms hoje | **zero hoje**; relevante a partir de ~10⁴–10⁵ linhas | Baixo, mas **sem número que o sustente agora** |

## 6. CODE vs INFRA — separação explícita

**INFRA (não é culpa do código; refactor NÃO resolve):**
- **F ≈ 141ms/query** de RTT desta máquina → us-east-1. É geografia. Num deploy Vercel us-east (mesma região do banco) esse piso cai para ~1–5ms e TODOS os números da coluna TTFB encolhem ~30–100×.
- **C ≈ 845ms** de handshake TCP+TLS+auth no Supavisor — idem, distância.
- Compute do free tier: **inocentado** (exec sub-ms em tudo). Cold start de reativação: não observado.

**CODE (multiplica o piso da infra — custa em QUALQUER região, e domina o sintoma local):**
- Cadeias sequenciais: metrics ×10, kyc/withdrawals ×2, transactions/dashboard ×2 — vs overview-stats ×1 (paralelo, mesmo padrão de dados).
- `$transaction` usado para leituras independentes (4 RTT); N+1 em users (13 statements).
- Config do pool que joga fora conexões quentes a cada 10s — transforma C de custo único em custo recorrente.
- (Futuro, sem impacto atual: índices do §3; rendering client-side do §5.6.)

**Nota de due diligence:** o sintoma em localhost é amplificado pela geografia, mas os padrões de código são reais e mensuráveis: numa região com RTT 3ms, `/api/admin/metrics` ainda seria ~10× mais lento que o necessário — só que 30ms em vez de 1,4s. O código multiplica o que a infra cobrar.

## 7. O ÚNICO gargalo dominante

> **Round-trips sequenciais ao banco.** TTFB de cada rota = 141ms (piso de rede) × profundidade da cadeia de queries do código. Aritmética no pior caso: `/api/admin/metrics` = 10 queries seriais × 141ms = **1410ms dos 1432ms medidos (98,5%)** — enquanto o banco executa cada uma em <0,2ms. O mesmo mecanismo, na variante "conexão", explica o resto do sintoma: +851ms no primeiro clique após 10s de inatividade (pool descartado). Não há empate: queries, índices, compute, auth e RLS foram medidos e inocentados.

## 8. Dados brutos (`perf/raw/` — não commitar; NDJSON contém params reais)

| Arquivo | Conteúdo |
|---|---|
| `net-floor.json` | piso de rede (connects, RTTs, first_touch) |
| `db-inventory.json` | row counts, pg_stat_user_tables, 55 índices |
| `census.json` + `slice-*.json` | censo por rota, queries individuais com duração/params |
| `ttfb-prod.txt` / `ttfb-summary.json` | 12 amostras/rota em produção + probe idle |
| `explain.txt` | planos EXPLAIN ANALYZE completos das top-6 |
| `build.log`, `dev-server.log`, `prod-server.log` | logs dos servidores |

Instrumentação temporária em `src/lib/prisma.ts` **revertida** (`git checkout`) após a coleta. Scripts de medição preservados em `perf/*.mjs`/`ttfb.sh` para re-medição idêntica na Fase 3 (exigência: antes/depois por correção).

---
**FIM DA FASE 2. Nenhuma otimização aplicada. Aguardando aprovação para a Fase 3** (ordem proposta: gargalo #1 → #2 → #3, re-medindo com os mesmos scripts após cada commit).
