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

  // Filtro de tempo baseado no período
  const now = new Date();
  let startDate = new Date();
  if (period === "today") startDate.setHours(0, 0, 0, 0);
  else if (period === "week") startDate.setDate(now.getDate() - 7);
  else if (period === "month") startDate.setDate(now.getDate() - 30);
  else if (period === "quarter") startDate.setDate(now.getDate() - 90);
  else if (period === "year") startDate.setDate(now.getDate() - 365);

  const [user, stats, pixStats] = await Promise.all([
    // Saldo do usuário
    prisma.user.findUnique({
      where: { id: userId },
      select: { availableBalance: true, pendingBalance: true }
    }),
    // Agregação de pedidos pagos no período
    prisma.order.aggregate({
      where: {
        userId,
        status: "PAID",
        createdAt: { gte: startDate }
      },
      _sum: { netAmount: true, amount: true },
      _count: { id: true },
      _avg: { amount: true }
    }),
    // Estatísticas para conversão de PIX
    prisma.order.groupBy({
      by: ["status"],
      where: {
        userId,
        paymentMethod: "PIX",
        createdAt: { gte: startDate }
      },
      _count: { id: true }
    })
  ]);

  const pixPaid = pixStats.find(s => s.status === "PAID")?._count.id || 0;
  const pixTotal = pixStats.reduce((acc, curr) => acc + curr._count.id, 0);
  const pixConversionRate = pixTotal > 0 ? (pixPaid / pixTotal) * 100 : 0;

  return NextResponse.json({
    availableBalance: user?.availableBalance || 0,
    pendingBalance: user?.pendingBalance || 0,
    retainedBalance: 0, // Implementar lógica de retenção se necessário
    netProfit: stats._sum.netAmount || 0,
    totalTransactions: stats._count.id || 0,
    averageTicket: stats._avg.amount || 0,
    pixConversionRate: +pixConversionRate.toFixed(1),
  });
}
