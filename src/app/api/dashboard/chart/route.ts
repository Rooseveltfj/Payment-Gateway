import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const period = req.nextUrl.searchParams.get("period") ?? "week";
  const now = new Date();
  
  const configs: Record<string, { days: number; type: "day" | "month" }> = {
    today: { days: 1, type: "day" },
    week: { days: 7, type: "day" },
    month: { days: 30, type: "day" },
    year: { days: 12, type: "month" },
  };

  const cfg = configs[period] ?? configs.week;
  const startDate = new Date();
  
  if (cfg.type === "day") {
    startDate.setDate(now.getDate() - cfg.days);
  } else {
    startDate.setFullYear(now.getFullYear() - 1);
  }

  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: "PAID",
      createdAt: { gte: startDate }
    },
    select: {
      amount: true,
      createdAt: true
    },
    orderBy: { createdAt: "asc" }
  });

  const points: { date: string; value: number }[] = [];

  // Agrupamento manual para garantir que todos os dias/meses apareçam, mesmo com 0
  if (cfg.type === "day") {
    for (let i = cfg.days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      
      const total = orders
        .filter(o => o.createdAt.toDateString() === d.toDateString())
        .reduce((acc, curr) => acc + curr.amount, 0);
        
      points.push({ date: label, value: +total.toFixed(2) });
    }
  } else {
    // Por mês para visão anual
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("pt-BR", { month: "short" });
      
      const total = orders
        .filter(o => o.createdAt.getMonth() === d.getMonth() && o.createdAt.getFullYear() === d.getFullYear())
        .reduce((acc, curr) => acc + curr.amount, 0);
        
      points.push({ date: label, value: +total.toFixed(2) });
    }
  }

  return NextResponse.json(points);
}
