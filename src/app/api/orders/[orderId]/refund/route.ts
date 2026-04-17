import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wooviRequest } from "@/lib/woovi";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    const body = await req.json();
    const { amount } = body; // Optional partial refund

    // 1. Find Order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // 2. Permission check (Owner or Admin)
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json({ error: "Apenas pedidos pagos podem ser reembolsados" }, { status: 400 });
    }

    const refundValueCents = amount ? Math.round(amount * 100) : Math.round(order.amount * 100);
    const refundID = `refund_${crypto.randomUUID()}`;

    // 3. Call Woovi Refund API
    await wooviRequest(`/charge/${order.wooviCorrelationId}/refund`, {
      method: "POST",
      body: JSON.stringify({
        correlationID: refundID,
        value: refundValueCents,
        comment: "Reembolso solicitado pelo vendedor"
      })
    });

    // 4. Update Order in DB
    const history = (order.statusHistory as any[]) || [];
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
        statusHistory: [
          ...history,
          { status: "REFUNDED", label: "Pedido Reembolsado manualmente", date: new Date().toISOString() }
        ]
      }
    });

    // 5. Adjust Seller Balance (Optional: Debiting available balance if already matured)
    // Note: In MVP, refunds are usually handled manually or by debiting the player's balance.
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        availableBalance: { decrement: order.netAmount }
      }
    });

    return NextResponse.json({ success: true, refundID });
  } catch (error: any) {
    console.error("Refund Error:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar reembolso" }, { status: 500 });
  }
}
