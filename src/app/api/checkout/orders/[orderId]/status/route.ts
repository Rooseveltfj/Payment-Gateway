import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processSale } from "@/lib/financial";

export async function GET(_req: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.status === "PENDING" && process.env.NODE_ENV === "development") {
      const history = (order.statusHistory as { status: string; label: string; date: string }[]) || [];
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          statusHistory: [
            ...history,
            { status: "PAID", label: "Pagamento Confirmado (Mock)", date: new Date().toISOString() }
          ]
        }
      });
      await processSale(orderId);
      return NextResponse.json({ status: "PAID" });
    }

    return NextResponse.json({ status: order.status });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar status" }, { status: 500 });
  }
}
