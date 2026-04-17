"use client";

import { useState, useEffect, useCallback } from "react";
import { MetricsGrid, MetricsGridSkeleton } from "@/components/dashboard/MetricsGrid";
import { RevenueChart, RevenueChartSkeleton } from "@/components/dashboard/RevenueChart";
import { PixConversion, PixConversionSkeleton } from "@/components/dashboard/PixConversion";
import { TransactionsTable, TransactionsTableSkeleton } from "@/components/dashboard/TransactionsTable";
import { useDashboard } from "@/lib/dashboard-context";

interface Metrics {
  availableBalance: number;
  pendingBalance: number;
  retainedBalance: number;
  netProfit: number;
  totalTransactions: number;
  averageTicket: number;
  pixConversionRate: number;
}

interface ChartPoint {
  date: string;
  value: number;
}

interface Transaction {
  id: string;
  method: "PIX" | "CREDIT_CARD" | "BOLETO";
  product: string;
  buyer: string;
  buyerEmail: string;
  amount: number;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "CHARGEBACK";
  createdAt: string;
}

export default function DashboardPage() {
  const { period } = useDashboard();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txHasMore, setTxHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const [metricsRes, chartRes, txRes] = await Promise.all([
        fetch(`/api/dashboard/metrics?period=${p}`),
        fetch(`/api/dashboard/chart?period=${p}`),
        fetch(`/api/dashboard/transactions?page=0`),
      ]);
      const [m, c, tx] = await Promise.all([
        metricsRes.json(),
        chartRes.json(),
        txRes.json(),
      ]);
      setMetrics(m);
      setChartData(c);
      setTransactions(tx.transactions);
      setTxHasMore(tx.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(period);
  }, [period, fetchAll]);

  return (
    <div className="w-full">
      {/* Topbar is now in Layout */}

      <div className="space-y-6">

          {/* Metrics */}
          <section>
            {loading || !metrics ? (
              <MetricsGridSkeleton />
            ) : (
              <MetricsGrid metrics={metrics} />
            )}
          </section>

          {/* PIX Conversion + Chart row */}
          <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
            {loading || !metrics ? (
              <>
                <PixConversionSkeleton />
                <RevenueChartSkeleton />
              </>
            ) : (
              <>
                <PixConversion rate={metrics.pixConversionRate} />
                <RevenueChart data={chartData} />
              </>
            )}
          </section>

          {/* Transactions */}
          <section>
            {loading ? (
              <TransactionsTableSkeleton />
            ) : (
              <TransactionsTable initial={transactions} initialHasMore={txHasMore} />
            )}
          </section>

        </div>
    </div>
  );
}
