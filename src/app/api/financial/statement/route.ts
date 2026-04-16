import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const type = searchParams.get("type");
  const limit = 20;
  const skip = (page - 1) * limit;

  const user = session?.user as { id: string } | undefined;
  const where: { userId: string; type?: TransactionType } = { userId: user?.id || "" };
  if (type && type !== "ALL") {
    where.type = type as TransactionType;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where })
  ]);

  return NextResponse.json({
    transactions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  });
}
