import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPagarMeBoletoCharge } from "@/lib/payments";

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

    // Gerar Boleto via PagarMe
    const payment = await createPagarMeBoletoCharge(order.amount, order.id);

    // Atualizar pedido
    await prisma.order.update({
      where: { id: orderId },
      data: {
        boletoUrl: payment.url,
        boletoBarcode: payment.barcode,
        externalId: payment.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: payment.url,
      barcode: payment.barcode
    });
  } catch (error) {
    console.error("Error generating boleto:", error);
    return NextResponse.json({ error: "Erro ao gerar boleto" }, { status: 500 });
  }
}
