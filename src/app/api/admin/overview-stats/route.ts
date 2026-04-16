import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalVolume, totalFees, transactionsToday, volumeToday, platformRevenueToday] = await Promise.all([
    // Volume total acumulado
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true }
    }),
    // Taxas totais
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { platformFee: true }
    }),
    // Transações hoje
    prisma.order.count({
      where: {
        createdAt: { gte: today }
      }
    }),
    // Volume hoje
    prisma.order.aggregate({
      where: { 
        status: "PAID",
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    }),
    // Receita da plataforma hoje
    prisma.order.aggregate({
      where: { 
        status: "PAID",
        createdAt: { gte: today }
      },
      _sum: { platformFee: true }
    })
  ]);

  return NextResponse.json({
    totalVolume: totalVolume._sum.amount || 0,
    totalFees: totalFees._sum.platformFee || 0,
    transactionsToday,
    volumeToday: volumeToday._sum.amount || 0,
    platformRevenueToday: platformRevenueToday._sum.platformFee || 0
  });
}
