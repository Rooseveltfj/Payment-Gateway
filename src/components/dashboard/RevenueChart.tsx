"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

interface ChartPoint {
  date: string;
  value: number;
}

function formatBRL(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return `R$ ${value.toFixed(2)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[12px] px-4 py-3 text-[12px] shadow-2xl bg-[#141422] border border-white/[0.08] backdrop-blur-[12px]"
    >
      <p className="mb-1 font-medium text-[#f1f5f9]">{label}</p>
      <p className="text-[#a78bfa] font-bold text-[14px]">
        {payload[0].value !== undefined
          ? payload[0].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "—"}
      </p>
    </div>
  );
}

interface RevenueChartProps {
  data: ChartPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card padding={0} className="w-full">
      <CardHeader className="px-6 py-5">
        <CardTitle>Histórico de faturamento</CardTitle>
        <CardDescription>Receita bruta ao longo do período</CardDescription>
      </CardHeader>

      <div className="px-2 pb-6">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            <YAxis
              tickFormatter={formatBRL}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: "rgba(139,92,246,0.2)", strokeWidth: 1 }} 
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#8b5cf6",
                stroke: "#0f0f1a",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function RevenueChartSkeleton() {
  return (
    <Card className="h-[340px] animate-pulse opacity-50" />
  );
}
