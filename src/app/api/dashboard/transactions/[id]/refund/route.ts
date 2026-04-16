import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      },
      include: { user: true }
    });

    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    if (order.status !== "PAID") return NextResponse.json({ error: "Apenas pedidos pagos podem ser estornados" }, { status: 400 });

    const netAmount = order.netAmount;
    const history = (order.statusHistory as { status: string; label: string; date: string }[]) || [];

    // Realiza o estorno no saldo e banco
    await prisma.$transaction([
      // 1. Atualiza o Pedido
      prisma.order.update({
        where: { id: params.id },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          statusHistory: [
            ...history,
            { status: "REFUNDED", label: "Venda Estornada", date: new Date().toISOString() }
          ]
        }
      }),
      // 2. Debita do Saldo do Usuário
      // Se já estiver maduro, remove do disponível. Se não, do pendente.
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          availableBalance: { decrement: order.isMatured ? netAmount : 0 },
          pendingBalance: { decrement: order.isMatured ? 0 : netAmount },
          totalEarnings: { decrement: netAmount }
        }
      }),
      // 3. Cria registro no extrato (Movimentação negativa)
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "REFUND",
          amount: -netAmount,
          balance: order.user.availableBalance + order.user.pendingBalance - netAmount,
          description: `Estorno de venda (Pedido: ${order.id})`
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar estorno" }, { status: 500 });
  }
}
