import { prisma } from "./prisma";
import { PixKeyType } from "@/generated/prisma/client";

/**
 * Processa a entrada de uma nova venda no saldo pendente do usuário.
 */
export async function processSale(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!order || order.status !== "PAID") return;

  const netAmount = order.netAmount;

  await prisma.$transaction([
    // Incrementa ganhos totais e saldo pendente
    prisma.user.update({
      where: { id: order.userId },
      data: {
        totalEarnings: { increment: netAmount },
        pendingBalance: { increment: netAmount }
      }
    }),
    // Cria registro no extrato
    prisma.transaction.create({
      data: {
        userId: order.userId,
        type: "SALE",
        amount: netAmount,
        balance: order.user.availableBalance + order.user.pendingBalance + netAmount,
        description: `Venda do produto: ${order.productId} (Pedido: ${order.id})`
      }
    })
  ]);
}

/**
 * Migra saldos pendentes para disponíveis após o período de maturação (14 dias).
 * Deve ser chamado por um cron job.
 */
export async function processMaturity() {
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() - 14);

  const matureOrders = await prisma.order.findMany({
    where: {
      status: "PAID",
      isMatured: false,
      paidAt: { lte: maturityDate }
    },
    include: { user: true }
  });

  for (const order of matureOrders) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: order.userId },
        data: {
          availableBalance: { increment: order.netAmount },
          pendingBalance: { decrement: order.netAmount }
        }
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { isMatured: true }
      })
    ]);
  }

  return matureOrders.length;
}

/**
 * Calcula a taxa de saque: R$ 3,50 fixos + 5% sobre o valor.
 */
export function calculateWithdrawalFee(amount: number) {
  return 3.5 + (amount * 0.05);
}

/**
 * Registra uma solicitação de saque.
 */
export async function requestWithdrawal(userId: string, amount: number, pixKey: string, pixKeyType: PixKeyType) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.availableBalance < amount) {
    throw new Error("Saldo disponível insuficiente");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Debita o valor total do saldo disponível
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        availableBalance: { decrement: amount },
        totalWithdrawn: { increment: amount }
      }
    });

    // 2. Cria a solicitação de saque
    const withdrawal = await tx.withdrawal.create({
      data: {
        userId,
        amount,
        pixKey,
        pixKeyType,
        status: "PENDING"
      }
    });

    // 3. Cria o registro no extrato (Movimentação negativa)
    await tx.transaction.create({
      data: {
        userId,
        type: "WITHDRAWAL",
        amount: -amount,
        balance: updatedUser.availableBalance + updatedUser.pendingBalance,
        description: `Solicitação de saque PIX (ID: ${withdrawal.id})`
      }
    });

    return withdrawal;
  });
}
