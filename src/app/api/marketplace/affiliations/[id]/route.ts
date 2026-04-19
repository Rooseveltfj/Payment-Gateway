import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { status } = await req.json(); // "APPROVED" ou "REJECTED"
    const affiliationId = params.id;

    // 1. Buscar afiliação e verificar se o usuário atual é o PRODUTOR (dono da oferta)
    const affiliation = await prisma.affiliation.findUnique({
      where: { id: affiliationId },
      include: {
        offer: true
      }
    });

    if (!affiliation) {
      return NextResponse.json({ error: "Afiliação não encontrada" }, { status: 404 });
    }

    if (affiliation.offer.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Você não tem permissão para gerenciar esta afiliação" }, { status: 403 });
    }

    // 2. Atualizar status
    const updated = await prisma.affiliation.update({
      where: { id: affiliationId },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : null
      }
    });

    // 3. Se aprovado, incrementar totalAffiliates
    if (status === "APPROVED" && affiliation.status !== "APPROVED") {
      await prisma.affiliateOffer.update({
        where: { id: affiliation.offerId },
        data: { totalAffiliates: { increment: 1 } }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Affiliation Approval Error:", error);
    return NextResponse.json({ error: "Erro interno ao processar afiliação" }, { status: 500 });
  }
}
