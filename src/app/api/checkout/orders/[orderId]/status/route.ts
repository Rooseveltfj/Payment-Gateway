import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        paidAt: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      status: order.status,
      paidAt: order.paidAt
    });
  } catch (error) {
    console.error("Order Status Error:", error);
    return NextResponse.json({ error: "Erro ao consultar status" }, { status: 500 });
  }
}
