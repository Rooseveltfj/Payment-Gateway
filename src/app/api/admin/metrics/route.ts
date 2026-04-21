import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);

    // 1. Basic Stats
    const activeUsers = await prisma.user.count({ where: { status: "ACTIVE" } });
    
    const volumeData = await prisma.order.aggregate({
      _sum: { amount: true, platformFee: true },
      where: { status: "PAID" }
    });

    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" }
    });

    const transactionsToday = await prisma.order.count({
      where: { createdAt: { gte: today } }
    });

    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: today } }
    });

    const pendingKyc = await prisma.user.count({
      where: { kycStatus: "PENDING" }
    });

    // 2. Volume Timeline (30 days)
    const salesTimeline = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Process timeline to group by day (since createdAt is full timestamp)
    const timelineByDay: Record<string, number> = {};
    salesTimeline.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      timelineByDay[date] = (timelineByDay[date] || 0) + (item._sum.amount || 0);
    });

    const chartTimeline = Object.entries(timelineByDay).map(([date, amount]) => ({
      date,
      volume: amount
    }));

    // 3. Payment Methods Distribution
    const paymentMethods = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: true,
      where: { status: "PAID" }
    });

    const chartPayments = paymentMethods.map(item => ({
      name: item.paymentMethod,
      value: item._count
    }));

    // 4. Top 10 Players
    const topPlayersRaw = await prisma.order.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      where: { status: "PAID" },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });

    const userIds = topPlayersRaw.map(p => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });

    const chartTopPlayers = topPlayersRaw.map(p => {
      const u = users.find(user => user.id === p.userId);
      return {
        name: u?.name || "Desconhecido",
        revenue: p._sum.amount || 0
      };
    });

    return NextResponse.json({
      metrics: {
        activeUsers,
        totalVolume: volumeData._sum.amount || 0,
        platformRevenue: volumeData._sum.platformFee || 0,
        pendingWithdrawals: pendingWithdrawals._sum.amount || 0,
        transactionsToday,
        newUsersToday,
        pendingKyc
      },
      charts: {
        timeline: chartTimeline,
        payments: chartPayments,
        topPlayers: chartTopPlayers
      }
    });

  } catch (error) {
    console.error("ADMIN_METRICS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
