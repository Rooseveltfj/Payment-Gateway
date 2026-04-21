import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const users = await prisma.user.findMany({
      where: {
        kycStatus: "PENDING"
      },
      include: {
        kycDocuments: true
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("ADMIN_KYC_FETCH_ERROR", error);
    return NextResponse.json({ 
      error: "Erro ao buscar fila de KYC",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    }, { status: 500 });
  }
}
