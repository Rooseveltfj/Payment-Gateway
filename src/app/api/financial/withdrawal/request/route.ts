import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestWithdrawal } from "@/lib/financial";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, pixKey, pixKeyType } = body;

    // Validações básicas
    if (!amount || amount < 30) {
      return NextResponse.json({ error: "Valor mínimo para saque é R$ 30,00" }, { status: 400 });
    }

    if (!pixKey || !pixKeyType) {
      return NextResponse.json({ error: "Dados de recebimento incompletos" }, { status: 400 });
    }

    // Verificar KYC
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.kycStatus !== "APPROVED") {
      return NextResponse.json({ 
        error: "Sua conta precisa estar com o KYC aprovado para realizar saques." 
      }, { status: 403 });
    }

    const withdrawal = await requestWithdrawal(
      session.user.id,
      amount,
      pixKey,
      pixKeyType
    );

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar saque" }, { status: 500 });
  }
}
