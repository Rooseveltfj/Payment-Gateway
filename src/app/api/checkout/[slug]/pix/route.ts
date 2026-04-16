import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWooviPixCharge } from "@/lib/payments";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const pixData = await createWooviPixCharge(order.amount, order.id);

    const history = (order.statusHistory as { status: string; label: string; date: string }[]) || [];

    await prisma.order.update({
      where: { id: orderId },
      data: {
        pixQrCode: pixData.qrCode,
        pixCopyPaste: pixData.copyPaste,
        externalId: pixData.id,
        statusHistory: [
          ...history,
          { status: "PENDING", label: "Pagamento Gerado (PIX)", date: new Date().toISOString() }
        ]
      }
    });

    return NextResponse.json({ 
      success: true, 
      qrCode: pixData.qrCode, 
      copyPaste: pixData.copyPaste 
    });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
  }
}
