import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body; // COMPLETED | FAILED

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Saque não encontrado" }, { status: 404 });
    }

    if (withdrawal.status !== "PENDING" && withdrawal.status !== "PROCESSING") {
      return NextResponse.json({ error: "Este saque já foi processado" }, { status: 400 });
    }

    const updated = await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        processedAt: status === "COMPLETED" ? new Date() : null
      }
    });

    return NextResponse.json({ success: true, withdrawal: updated });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar saque" }, { status: 500 });
  }
}
