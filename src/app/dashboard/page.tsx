"use client";

import { useState, useEffect, useCallback } from "react";
import { MetricsGrid, MetricsGridSkeleton } from "@/components/dashboard/MetricsGrid";
import { RevenueChart, RevenueChartSkeleton } from "@/components/dashboard/RevenueChart";
import { PixConversion, PixConversionSkeleton } from "@/components/dashboard/PixConversion";
import { TransactionsTable, TransactionsTableSkeleton } from "@/components/dashboard/TransactionsTable";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
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
  
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const fetchAll = useCallback(async (p: string) => {
    setLoadingMetrics(true);
    setLoadingChart(true);
    setLoadingTransactions(true);
    
    // Independent fetches
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/dashboard/metrics?period=${p}`);
        const data = await res.json();
        setMetrics(data);
      } catch (e) {
        console.error("Metrics fetch error:", e);
      } finally {
        setLoadingMetrics(false);
      }
    };

    const fetchChart = async () => {
      try {
        const res = await fetch(`/api/dashboard/chart?period=${p}`);
        const data = await res.json();
        setChartData(data);
      } catch (e) {
        console.error("Chart fetch error:", e);
      } finally {
        setLoadingChart(false);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/dashboard/transactions?page=0`);
        const data = await res.json();
        setTransactions(data.transactions);
        setTxHasMore(data.hasMore);
      } catch (e) {
        console.error("Transactions fetch error:", e);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchMetrics();
    fetchChart();
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchAll(period);
  }, [period, fetchAll]);

  return (
    <div className="w-full relative">
      <OnboardingChecklist />

      <div className="space-y-6">
          {/* Metrics */}
          <section>
            {loadingMetrics || !metrics ? (
              <MetricsGridSkeleton />
            ) : (
              <MetricsGrid metrics={metrics} />
            )}
          </section>

          {/* PIX Conversion + Chart row */}
          <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
            {loadingMetrics || !metrics ? (
              <PixConversionSkeleton />
            ) : (
              <PixConversion rate={metrics.pixConversionRate} />
            )}

            {loadingChart ? (
              <RevenueChartSkeleton />
            ) : (
              <RevenueChart data={chartData} />
            )}
          </section>

          {/* Transactions */}
          <section>
            {loadingTransactions ? (
              <TransactionsTableSkeleton />
            ) : (
              <TransactionsTable initial={transactions} initialHasMore={txHasMore} />
            )}
          </section>

        </div>
    </div>
  );
}
