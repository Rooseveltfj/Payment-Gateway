import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const transaction = await prisma.order.findUnique({
    where: { 
      id: params.id,
      userId: session.user.id // Segurança: apenas pedidos do usuário
    },
    include: {
      product: true
    }
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ transaction });
}
