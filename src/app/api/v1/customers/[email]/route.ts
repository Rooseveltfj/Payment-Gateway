import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { email: string } }) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const email = decodeURIComponent(params.email);

  const orders = await prisma.order.findMany({
    where: { userId: auth.user.userId, buyerEmail: email },
    include: { product: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (!orders.length) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const totalSpent = orders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.amount, 0);

  return NextResponse.json({
    data: {
      name: orders[0].buyerName,
      email,
      totalOrders: orders.length,
      totalSpent,
      lastPurchase: orders[0].createdAt,
      orders: orders.map((o) => ({
        id: o.id,
        product: o.product.name,
        amount: o.amount,
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
    },
  });
}
