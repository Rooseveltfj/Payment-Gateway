"use client";

import { useState, useCallback, useMemo } from "react";
import { CreditCard, QrCode, FileText, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge, BadgeStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

function MethodIcon({ method }: { method: PayMethod }) {
  if (method === "PIX")
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#22c55e1f]">
        <QrCode className="h-3.5 w-3.5 text-[#22c55e]" />
      </div>
    );
  if (method === "CREDIT_CARD")
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#8b5cf61f]">
        <CreditCard className="h-3.5 w-3.5 text-[#a78bfa]" />
      </div>
    );
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eab3081f]">
      <FileText className="h-3.5 w-3.5 text-[#facc15]" />
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

  const columns = useMemo<Column<Transaction>[]>(() => [
    {
      header: "Método",
      accessor: (tx) => <MethodIcon method={tx.method} />,
      width: "48px"
    },
    {
      header: "Produto",
      accessor: (tx) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#f1f5f9]">{tx.product.name}</span>
          <span className="text-[12px] text-[#64748b] lg:hidden">{tx.buyerName}</span>
        </div>
      )
    },
    {
      header: "Comprador",
      className: "hidden lg:table-cell",
      accessor: (tx) => (
        <div className="flex flex-col">
          <span className="text-[#f1f5f9]">{tx.buyerName}</span>
          <span className="text-[12px] text-[#64748b]">{tx.buyerEmail}</span>
        </div>
      )
    },
    {
      header: "Valor",
      className: "text-right",
      accessor: (tx) => (
        <span className="font-semibold text-[#f1f5f9]">
          {tx.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      )
    },
    {
      header: "Status",
      className: "text-center",
      accessor: (tx) => {
        const status = tx.status.toLowerCase() as BadgeStatus;
        return <Badge status={status === 'chargeback' ? 'failed' : status} />
      }
    },
    {
      header: "Data",
      className: "text-right hidden lg:table-cell",
      accessor: (tx) => {
        const date = new Date(tx.createdAt);
        return (
          <div className="flex flex-col items-end">
            <span className="text-[#f1f5f9]">
              {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
            <span className="text-[10px] text-[#64748b]">
              {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )
      }
    }
  ], []);

  return (
    <Card padding={0} className="w-full">
      <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
        <CardTitle>Últimas transações</CardTitle>
        <CardDescription>Movimentações mais recentes da sua conta</CardDescription>
      </CardHeader>
      
      <DataTable 
        columns={columns} 
        data={rows} 
        loading={false} // Loading handled by "load more" button for pagination
      />

      {hasMore && (
        <div className="flex justify-center p-4 border-t border-white/[0.05]">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadMore}
            isLoading={loading}
            icon={<ChevronDown className="w-3.5 h-3.5" />}
          >
            Ver mais transações
          </Button>
        </div>
      )}
    </Card>
  );
}

export function TransactionsTableSkeleton() {
  return (
    <Card padding={0}>
      <CardHeader className="px-6 py-5 border-b border-white/[0.05]">
        <div className="h-5 w-40 animate-pulse rounded-md bg-white/[0.04]" />
        <div className="mt-1.5 h-3.5 w-64 animate-pulse rounded-md bg-white/[0.04]" />
      </CardHeader>
      <div className="p-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.03] last:border-0"
          >
            <div className="h-8 w-8 animate-pulse rounded-md bg-white/[0.04]" />
            <div className="flex-1 h-4 animate-pulse rounded-md bg-white/[0.04]" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-white/[0.04]" />
            <div className="h-4 w-20 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </Card>
  );
}
