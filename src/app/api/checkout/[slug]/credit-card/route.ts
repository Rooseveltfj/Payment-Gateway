import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPagarMeCardCharge } from "@/lib/payments";
import { processSale } from "@/lib/financial";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, cardToken } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const payment = await createPagarMeCardCharge(order.amount, order.id, cardToken);

    const history = (order.statusHistory as { status: string; label: string; date: string }[]) || [];
    const isPaid = payment.status === "paid";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: isPaid ? "PAID" : "FAILED",
        externalId: payment.id,
        paidAt: isPaid ? new Date() : null,
        statusHistory: [
          ...history,
          { 
            status: isPaid ? "PAID" : "FAILED", 
            label: isPaid ? "Pagamento Aprovado" : "Pagamento Recusado", 
            date: new Date().toISOString() 
          }
        ]
      }
    });

    if (isPaid) {
      await processSale(orderId);
    }

    return NextResponse.json({ 
      success: true, 
      status: payment.status 
    });
  } catch {
    return NextResponse.json({ error: "Erro ao processar cartão" }, { status: 500 });
  }
}
