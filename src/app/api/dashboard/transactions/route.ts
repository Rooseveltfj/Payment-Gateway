import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const method = searchParams.get("method");
  const productId = searchParams.get("productId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId: session.user.id };

  if (status && status !== "ALL") where.status = status;
  if (method && method !== "ALL") where.paymentMethod = method;
  if (productId && productId !== "ALL") where.productId = productId;
  
  if (search) {
    where.OR = [
      { buyerName: { contains: search, mode: "insensitive" } },
      { buyerEmail: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } }
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        product: { select: { name: true } }
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
