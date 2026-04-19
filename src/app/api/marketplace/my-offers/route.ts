import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();
    const { 
      productId, title, commissionType, 
      commissionValue, cookieDays, requiresApproval, category 
    } = data;

    // 1. Verificar se o produto existe e pertence ao usuário
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.userId !== session.user.id) {
      return NextResponse.json({ error: "Produto inválido ou não pertence a você" }, { status: 403 });
    }

    // 2. Verificar se já existe anúncio para este produto
    const existing = await prisma.affiliateOffer.findFirst({
      where: { productId }
    });

    if (existing) {
      return NextResponse.json({ error: "Este produto já possui um anúncio ativo" }, { status: 400 });
    }

    // 3. Criar a oferta
    const offer = await prisma.affiliateOffer.create({
      data: {
        productId,
        ownerId: session.user.id,
        title,
        description: product.description,
        commissionType,
        commissionValue,
        cookieDays,
        requiresApproval,
        category,
        imageUrl: product.imageUrl,
        status: "ACTIVE"
      }
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Create Offer Error:", error);
    return NextResponse.json({ error: "Erro interno ao criar anúncio" }, { status: 500 });
  }
}
