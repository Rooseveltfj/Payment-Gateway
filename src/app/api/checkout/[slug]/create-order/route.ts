import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Validate product slug if needed
    const body = await req.json();
    const { buyerName, buyerEmail, buyerCpf, buyerPhone, buyerData, productId, paymentMethod } = body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { user: true }
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const platformFeePercent = product.user.platformFeePercent || 9.99;
    const amount = product.price;
    const platformFee = amount * (platformFeePercent / 100);
    const netAmount = amount - platformFee;

    const order = await prisma.order.create({
      data: {
        userId: product.userId,
        productId: product.id,
        buyerName,
        buyerEmail,
        buyerCpf,
        buyerPhone,
        buyerData: buyerData || {},
        amount,
        platformFee,
        netAmount,
        status: "PENDING",
        paymentMethod: paymentMethod || "PIX",
        installments: 1,
        statusHistory: [
          { status: "PENDING", label: "Pedido Criado", date: new Date().toISOString() }
        ]
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch {
    return NextResponse.json({ error: "Erro interno ao criar pedido" }, { status: 500 });
  }
}
