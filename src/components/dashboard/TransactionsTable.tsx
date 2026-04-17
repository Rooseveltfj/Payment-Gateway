"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CreditCard, QrCode, FileText, ChevronDown, Loader2 } from "lucide-react";

type TxStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "CHARGEBACK";
type PayMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

interface Transaction {
  id: string;
  method: PayMethod;
  product: { name: string };
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: TxStatus;
  createdAt: string;
}

const STATUS_MAP: Record<TxStatus, { label: string; cls: string }> = {
  PAID: { label: "Pago", cls: "bg-success/15 text-success" },
  PENDING: { label: "Pendente", cls: "bg-warning/15 text-warning" },
  FAILED: { label: "Falhou", cls: "bg-error/15 text-error" },
  REFUNDED: { label: "Reembolsado", cls: "bg-primary/15 text-primary" },
  CHARGEBACK: { label: "Chargeback", cls: "bg-error/15 text-error" },
};

function MethodIcon({ method }: { method: PayMethod }) {
  if (method === "PIX")
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-success/15">
        <QrCode className="h-3.5 w-3.5 text-success" />
      </div>
    );
  if (method === "CREDIT_CARD")
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15">
        <CreditCard className="h-3.5 w-3.5 text-primary" />
      </div>
    );
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/15">
      <FileText className="h-3.5 w-3.5 text-warning" />
    </div>
  );
}



interface TransactionsTableProps {
  initial: Transaction[];
  initialHasMore: boolean;
}

export function TransactionsTable({ initial, initialHasMore }: TransactionsTableProps) {
  const [rows, setRows] = useState<Transaction[]>(initial);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const next = page + 1;
    try {
      const res = await fetch(`/api/dashboard/transactions?page=${next}`);
      const data = await res.json();
      setRows((prev) => [...prev, ...data.transactions]);
      setHasMore(data.hasMore);
      setPage(next);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#111113",
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <h3 className="text-sm font-semibold text-text-primary">Últimas transações</h3>
        <p className="text-xs text-text-secondary mt-0.5">Movimentações mais recentes da sua conta</p>
      </div>

      {/* Table header */}
      <div className="hidden lg:grid grid-cols-[48px_1fr_1fr_1fr_110px_110px_120px] gap-3 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-text-secondary"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <span>Método</span>
        <span>Produto</span>
        <span>Comprador</span>
        <span>Email</span>
        <span className="text-right">Valor</span>
        <span className="text-center">Status</span>
        <span className="text-right">Data</span>
      </div>

      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {rows.map((tx) => {
          const status = STATUS_MAP[tx.status] ?? STATUS_MAP.PENDING;
          const date = new Date(tx.createdAt);
          const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
          const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

          return (
            <div
              key={tx.id}
              className="grid grid-cols-[48px_1fr] gap-3 px-5 py-3.5 transition-colors duration-150 cursor-pointer lg:grid-cols-[48px_1fr_1fr_1fr_110px_110px_120px] hover:bg-hover"
            >
              {/* Method */}
              <div className="flex items-center gap-2">
                <MethodIcon method={tx.method} />
              </div>

              {/* Product */}
              <div className="flex flex-col justify-center lg:col-auto">
                <span className="text-xs font-medium text-text-primary line-clamp-1">{tx.product.name}</span>
                <span className="text-[10px] text-text-secondary mt-0.5 lg:hidden">{tx.buyerName}</span>
                {/* Mobile: show all inline */}
                <div className="flex items-center gap-2 mt-1 lg:hidden">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", status.cls)}>
                    {status.label}
                  </span>
                  <span className="text-[10px] text-text-secondary">{dateStr}</span>
                  <span className="ml-auto text-xs font-semibold text-text-primary">
                    {tx.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </div>

              {/* Buyer — desktop only */}
              <div className="hidden lg:flex items-center">
                <span className="text-xs text-text-secondary line-clamp-1">{tx.buyerName}</span>
              </div>

              {/* Email — desktop only */}
              <div className="hidden lg:flex items-center">
                <span className="text-xs text-text-secondary line-clamp-1">{tx.buyerEmail}</span>
              </div>

              {/* Amount — desktop only */}
              <div className="hidden lg:flex items-center justify-end">
                <span className="text-xs font-semibold text-text-primary">
                  {tx.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>

              {/* Status — desktop only */}
              <div className="hidden lg:flex items-center justify-center">
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", status.cls)}>
                  {status.label}
                </span>
              </div>

              {/* Date — desktop only */}
              <div className="hidden lg:flex flex-col items-end justify-center">
                <span className="text-xs text-text-primary">{dateStr}</span>
                <span className="text-[10px] text-text-secondary">{timeStr}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <div
          className="flex justify-center px-5 py-4"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-border bg-hover px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {loading ? "Carregando..." : "Ver mais transações"}
          </button>
        </div>
      )}
    </div>
  );
}

export function TransactionsTableSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#111113",
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div className="h-4 w-40 animate-pulse rounded-md bg-hover" />
        <div className="mt-1.5 h-3 w-64 animate-pulse rounded-md bg-hover" />
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5"
          style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
        >
          <div className="h-7 w-7 animate-pulse rounded-md bg-hover" />
          <div className="flex-1 h-4 animate-pulse rounded-md bg-hover" />
          <div className="h-4 w-20 animate-pulse rounded-md bg-hover" />
          <div className="h-4 w-16 animate-pulse rounded-full bg-hover" />
          <div className="h-4 w-16 animate-pulse rounded-md bg-hover" />
        </div>
      ))}
    </div>
  );
}
