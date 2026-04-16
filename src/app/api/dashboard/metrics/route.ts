import { NextRequest, NextResponse } from "next/server";

// Mock data — replace with real Prisma queries once DB is connected
function getMetrics(period: string) {
  const multipliers: Record<string, number> = {
    today: 0.1,
    week: 1,
    month: 4.3,
    quarter: 13,
    year: 52,
  };
  const m = multipliers[period] ?? 1;

  return {
    availableBalance: +(12847.5 * m).toFixed(2),
    pendingBalance: +(3240.0 * m).toFixed(2),
    retainedBalance: +(890.0 * m).toFixed(2),
    netProfit: +(9607.5 * m).toFixed(2),
    totalTransactions: Math.round(342 * m),
    averageTicket: +(187.55).toFixed(2),
    pixConversionRate: 78.4,
  };
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "week";
  const data = getMetrics(period);
  return NextResponse.json(data);
}
