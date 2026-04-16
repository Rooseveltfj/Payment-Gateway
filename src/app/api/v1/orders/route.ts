import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const status = searchParams.get("status");
  const productId = searchParams.get("product_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.OrderWhereInput = {
    userId: auth.user.userId,
    ...(status && { status: status as Prisma.EnumOrderStatusFilter }),
    ...(productId && { productId }),
    ...(from || to
      ? {
          createdAt: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: page * limit,
      take: limit,
      select: {
        id: true,
        buyerName: true,
        buyerEmail: true,
        amount: true,
        platformFee: true,
        netAmount: true,
        status: true,
        paymentMethod: true,
        paidAt: true,
        createdAt: true,
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
