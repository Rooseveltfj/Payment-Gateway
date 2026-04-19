import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      availableBalance: true,
      pendingBalance: true,
      totalWithdrawn: true,
      totalEarnings: true,
      pixKey: true,
      pixKeyType: true,
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // O "Saldo retido" foi removido conforme solicitado pelo usuário.
  // No lugar, podemos mostrar o total acumulado ou apenas as 3 métricas principais.
  // Mantendo a estrutura de 4 cards no dashboard como planejado no UI.

  return NextResponse.json({
    available: user.availableBalance,
    pending: user.pendingBalance,
    withdrawn: user.totalWithdrawn,
    total: user.totalEarnings,
    pixKey: user.pixKey,
    pixKeyType: user.pixKeyType
  });
}
