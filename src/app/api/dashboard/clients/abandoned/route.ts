import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Lógica de abandono: Pedidos PENDING com mais de 1 hora
  const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);

  const abandonedCarts = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: "PENDING",
      createdAt: { lte: oneHourAgo },
    },
    include: {
      product: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Cálculo da taxa de abandono (últimos 30 dias)
  const last30Days = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const totalOrders = await prisma.order.count({
    where: { 
      userId: session.user.id,
      createdAt: { gte: last30Days }
    }
  });

  const abandonedCount = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: "PENDING",
      createdAt: { gte: last30Days, lte: oneHourAgo }
    }
  });

  const abandonmentRate = totalOrders > 0 ? (abandonedCount / totalOrders) * 100 : 0;

  return NextResponse.json({ 
    abandonedCarts,
    stats: {
      totalOrders,
      abandonedCount,
      abandonmentRate: Math.round(abandonmentRate)
    }
  });
}
