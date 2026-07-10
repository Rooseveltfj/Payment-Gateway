#!/usr/bin/env bash
# PERF Fase 1 — Passo 4: TTFB oficial em produção (:3001)
# Uso: SESSION_COOKIE="..." bash perf/ttfb.sh
set -u
BASE="http://localhost:3001"
OUT="perf/raw/ttfb-prod.txt"
: > "$OUT"

ROUTES=(
  "/api/admin/metrics"
  "/api/admin/users?page=1&limit=10"
  "/api/admin/overview-stats"
  "/api/admin/transactions"
  "/api/admin/kyc"
  "/api/admin/withdrawals"
  "/api/dashboard/metrics"
)

hit() { # $1 = rota → imprime "ttfb_segundos http_code"
  curl -s -o /dev/null \
    -H "Cookie: authjs.session-token=$SESSION_COOKIE" \
    -w "%{time_starttransfer} %{http_code}" \
    "$BASE$1"
}

for r in "${ROUTES[@]}"; do
  # aquecimento (3, descartados — absorve cold de rota e enche o pool)
  for i in 1 2 3; do hit "$r" > /dev/null; done
  # amostras oficiais (12, back-to-back)
  for i in $(seq 1 12); do
    s=$(hit "$r")
    echo "$r $s" >> "$OUT"
  done
  echo "done: $r"
done

# ── Probe de pool idle: 5× (15s parado > idleTimeoutMillis 10s → 1 hit) em /api/admin/kyc
for i in $(seq 1 5); do
  sleep 15
  s=$(hit "/api/admin/kyc")
  echo "IDLE /api/admin/kyc $s" >> "$OUT"
  echo "idle probe $i: $s"
done
echo "OK → $OUT"
