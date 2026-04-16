import { NextRequest, NextResponse } from "next/server";

function generateChartData(period: string) {
  const now = new Date();
  const points: { date: string; value: number }[] = [];

  const configs: Record<string, { days: number; labelFmt: "day" | "week" | "month" }> = {
    today: { days: 24, labelFmt: "day" },
    week: { days: 7, labelFmt: "day" },
    month: { days: 30, labelFmt: "day" },
    quarter: { days: 13, labelFmt: "week" },
    year: { days: 12, labelFmt: "month" },
  };

  const cfg = configs[period] ?? configs.week;
  const base = 2000;

  for (let i = cfg.days - 1; i >= 0; i--) {
    const d = new Date(now);
    if (cfg.labelFmt === "day") d.setDate(d.getDate() - i);
    else if (cfg.labelFmt === "week") d.setDate(d.getDate() - i * 7);
    else d.setMonth(d.getMonth() - i);

    let label = "";
    if (cfg.labelFmt === "day") {
      label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    } else if (cfg.labelFmt === "week") {
      label = `Sem ${cfg.days - i}`;
    } else {
      label = d.toLocaleDateString("pt-BR", { month: "short" });
    }

    const noise = Math.random() * 3000 - 500;
    const trend = (cfg.days - i) * 80;
    points.push({ date: label, value: Math.max(0, Math.round(base + noise + trend)) });
  }
  return points;
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "week";
  const data = generateChartData(period);
  return NextResponse.json(data);
}
