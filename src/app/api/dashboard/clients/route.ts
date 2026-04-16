import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  // O Prisma não tem um "groupBy" fácil que retorne objetos completos, 
  // então buscaremos todos os pedidos pagos e processaremos no JS para dedupar, 
  // ou usaremos uma query específica.
  const user = session?.user as { id: string } | undefined;
  
  const where: { userId: string; status: OrderStatus; OR?: { buyerName?: { contains: string; mode: "insensitive" }; buyerEmail?: { contains: string; mode: "insensitive" } }[] } = { 
    userId: user?.id || "",
    status: "PAID"
  };

  if (search) {
    where.OR = [
      { buyerName: { contains: search, mode: "insensitive" } },
      { buyerEmail: { contains: search, mode: "insensitive" } }
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      buyerName: true,
      buyerEmail: true,
      amount: true,
      createdAt: true
    }
  });

  // Dedup e Agrupamento
  const clientsMap = new Map();

  orders.forEach(o => {
    if (!clientsMap.has(o.buyerEmail)) {
      clientsMap.set(o.buyerEmail, {
        name: o.buyerName,
        email: o.buyerEmail,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: o.createdAt
      });
    }
    const client = clientsMap.get(o.buyerEmail);
    client.totalOrders += 1;
    client.totalSpent += o.amount;
    if (new Date(o.createdAt) > new Date(client.lastOrderAt)) {
      client.lastOrderAt = o.createdAt;
    }
  });

  const clients = Array.from(clientsMap.values());

  return NextResponse.json({ clients });
}
