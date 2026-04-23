import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestWithdrawal } from "@/lib/financial";
import { audit } from "@/lib/audit";
import { detectSuspiciousActivity } from "@/lib/security-monitor";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, pixKey, pixKeyType } = body;

    if (!amount || amount < 30) {
      return NextResponse.json({ error: "Valor mínimo para saque é R$ 30,00" }, { status: 400 });
    }

    if (!pixKey || !pixKeyType) {
      return NextResponse.json({ error: "Dados de recebimento incompletos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.kycStatus !== "APPROVED") {
      return NextResponse.json({
        error: "Sua conta precisa estar com o KYC aprovado para realizar saques."
      }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const suspicion = await detectSuspiciousActivity(session.user.id, 'WITHDRAWAL_REQUESTED', ip);
    if (suspicion.blocked) {
      return NextResponse.json({ error: suspicion.reason }, { status: 403 });
    }

    const withdrawal = await requestWithdrawal(
      session.user.id,
      amount,
      pixKey,
      pixKeyType
    );

    await audit('WITHDRAWAL_REQUESTED', session.user.id, { amount, pixKey, pixKeyType }, req);

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar saque" }, { status: 500 });
  }
}
