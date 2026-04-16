import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { dispatchWebhook } from "@/lib/webhook";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: auth.user.userId },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "PAID")
    return NextResponse.json({ error: "Only PAID orders can be refunded" }, { status: 400 });

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });

  // Dispatch webhook event
  await dispatchWebhook(auth.user.userId, "order.refunded", {
    order_id: order.id,
    product_id: order.productId,
    amount: order.amount,
    buyer: { name: order.buyerName, email: order.buyerEmail },
    refunded_at: updated.refundedAt?.toISOString(),
  });

  return NextResponse.json({ data: updated });
}
