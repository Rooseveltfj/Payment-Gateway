import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { offerId } = await req.json();

    // 1. Verificar se a oferta existe
    const offer = await prisma.affiliateOffer.findUnique({
      where: { id: offerId },
      include: { product: true }
    });

    if (!offer) {
      return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 });
    }

    if (offer.status !== "ACTIVE") {
      return NextResponse.json({ error: "Esta oferta não está mais ativa" }, { status: 403 });
    }

    // 2. Verificar se já é afiliado
    const existing = await prisma.affiliation.findFirst({
      where: {
        offerId,
        affiliateId: session.user.id
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Você já solicitou afiliação para este produto" }, { status: 400 });
    }

    // 3. Criar afiliação
    const affiliateCode = nanoid(8).toUpperCase();
    const status = offer.requiresApproval ? "PENDING" : "APPROVED";
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "pay.pulsepay.com.br";
    const affiliateLink = `https://${baseUrl}/c/${offer.product.slug}?ref=${affiliateCode}`;

    const affiliation = await prisma.affiliation.create({
      data: {
        offerId: offer.id,
        affiliateId: session.user.id,
        status,
        affiliateCode,
        affiliateLink,
        approvedAt: status === "APPROVED" ? new Date() : null
      }
    });

    // 4. Incrementar contador de afiliados se aprovado
    if (status === "APPROVED") {
      await prisma.affiliateOffer.update({
        where: { id: offerId },
        data: { totalAffiliates: { increment: 1 } }
      });
    }

    return NextResponse.json({
      status: affiliation.status,
      affiliateLink: affiliation.affiliateLink,
      message: status === "APPROVED" ? "Afiliação realizada!" : "Solicitação enviada!"
    });

  } catch (error) {
    console.error("Affiliation Creation Error:", error);
    return NextResponse.json({ error: "Erro interno ao processar afiliação" }, { status: 500 });
  }
}
