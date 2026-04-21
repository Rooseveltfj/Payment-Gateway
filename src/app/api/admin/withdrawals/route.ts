import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        status: { in: ["PENDING", "PROCESSING"] }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ withdrawals });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar saques" }, { status: 500 });
  }
}
