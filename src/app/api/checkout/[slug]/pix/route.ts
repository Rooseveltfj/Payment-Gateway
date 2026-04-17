import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wooviRequest } from "@/lib/woovi";
import { sendPixGeneratedEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { buyerName, buyerEmail, buyerCpf, buyerPhone } = body;

    // 1. Fetch Product and Seller
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { user: true }
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const seller = product.user;

    // 2. Calculate Values (Cents)
    const amountCents = Math.round(product.price * 100);
    const platformFeePercent = seller.platformFeePercent || 9.99;
    const platformFeeCents = Math.round(amountCents * (platformFeePercent / 100));
    const netAmountCents = amountCents - platformFeeCents;

    // 3. Generate IDs
    const correlationID = `order_${crypto.randomUUID()}`;

    // 4. Create Order in DB
    const order = await prisma.order.create({
      data: {
        userId: seller.id,
        productId: product.id,
        buyerName,
        buyerEmail,
        buyerCpf,
        buyerPhone,
        amount: product.price,
        platformFee: platformFeeCents / 100,
        netAmount: netAmountCents / 100,
        status: "PENDING",
        paymentMethod: "PIX",
        wooviCorrelationId: correlationID,
        statusHistory: [
          { status: "PENDING", label: "Aguardando Pagamento (PIX)", date: new Date().toISOString() }
        ]
      }
    });

    // 5. Call Woovi API
    const wooviData = await wooviRequest("/charge", {
      method: "POST",
      body: JSON.stringify({
        value: amountCents,
        correlationID: correlationID,
        comment: `Compra: ${product.name}`,
        customer: {
          name: buyerName,
          email: buyerEmail,
          taxID: buyerCpf || undefined,
          phone: buyerPhone ? `55${buyerPhone.replace(/\D/g, "")}` : undefined
        },
        additionalInfo: [
          { key: "orderId", value: order.id },
          { key: "productName", value: product.name },
          { key: "platform", value: "PulsePay" }
        ]
      })
    });

    const charge = wooviData.charge;

    // 6. Update Order with Woovi Info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        wooviTransactionId: charge.transactionID,
        pixBrCode: charge.brCode,
        pixQrCodeUrl: charge.qrCodeImage,
        pixExpiresAt: new Date(charge.expiresDate)
      }
    });

    // 7. Send Notification Email (Async)
    sendPixGeneratedEmail(
       { email: buyerEmail, name: buyerName },
       product.name,
       product.price,
       charge.brCode,
       charge.qrCodeImage
    ).catch(err => console.error("Error sending initial Pix email:", err));

    // 8. Success Response
    return NextResponse.json({
      orderId: order.id,
      correlationID: correlationID,
      brCode: charge.brCode,
      qrCodeImage: charge.qrCodeImage,
      expiresIn: charge.expiresIn,
      amount: product.price
    });

  } catch (error: any) {
    console.error("PIX Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao gerar cobrança PIX" },
      { status: 500 }
    );
  }
}
