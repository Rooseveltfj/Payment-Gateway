import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        kycStatus: true,
        name: true,
        document: true,
        phone: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Se estiver rejeitado, buscar o motivo no documento mais recente que foi rejeitado
    let rejectionReason = null;
    if (user.kycStatus === "REJECTED") {
      const rejectedDoc = await prisma.kycDocument.findFirst({
        where: { 
          userId: session.user.id,
          status: "REJECTED"
        },
        orderBy: { reviewedAt: "desc" }
      });
      rejectionReason = rejectedDoc?.reviewNote || "Seus documentos não atendem aos critérios de segurança.";
    }

    return NextResponse.json({
      status: user.kycStatus,
      rejectionReason,
      userData: {
        name: user.name,
        document: user.document,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("KYC Status API Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
