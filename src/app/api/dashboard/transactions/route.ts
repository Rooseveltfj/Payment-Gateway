import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paginate } from "@/lib/pagination";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const method = searchParams.get("method");
  const productId = searchParams.get("productId");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  
  const where: any = { userId: session.user.id };

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

  const result = await paginate(prisma.order, {
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      paymentMethod: true,
      amount: true,
      status: true,
      createdAt: true,
      buyerName: true,
      buyerEmail: true,
      product: { select: { name: true } }
    }
  }, { page, pageSize: 15 });

  return NextResponse.json({
    transactions: result.data,
    pagination: {
      total: result.total,
      pages: result.totalPages,
      currentPage: result.page,
      hasMore: result.hasMore
    }
  });
}

