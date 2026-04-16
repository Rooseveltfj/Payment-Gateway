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
      className="rounded-xl px-4 py-3 text-xs shadow-2xl"
      style={{
        background: "#1a1a1f",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="mb-1 font-medium text-text-primary">{label}</p>
      <p className="text-primary font-bold text-sm">
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
    <div
      className="rounded-xl p-5"
      style={{
        background: "#111113",
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Histórico de faturamento</h3>
          <p className="text-xs text-text-secondary mt-0.5">Receita bruta ao longo do período</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          <YAxis
            tickFormatter={formatBRL}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(124,58,237,0.3)", strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#7c3aed"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#7c3aed",
              stroke: "#111113",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div
      className="h-80 animate-pulse rounded-xl"
      style={{ background: "#111113", border: "0.5px solid rgba(255,255,255,0.08)" }}
    />
  );
}
