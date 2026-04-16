import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: { OR?: Array<{ buyerName?: { contains: string; mode: "insensitive" }; buyerEmail?: { contains: string; mode: "insensitive" }; user?: { name: { contains: string; mode: "insensitive" } } }> } = {};
  if (search) {
    where.OR = [
      { buyerName: { contains: search, mode: "insensitive" } },
      { buyerEmail: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } }
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        product: { select: { name: true } },
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.order.count({ where })
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
