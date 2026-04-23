import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

import { rateLimits } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const { success } = await rateLimits.api.limit(auth.user.keyId);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  // Deduplicate buyers by email
  const rawOrders = await prisma.order.findMany({
    where: { userId: auth.user.userId, status: "PAID" },
    select: {
      buyerName: true,
      buyerEmail: true,
      amount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const customerMap = new Map<
    string,
    { name: string; email: string; totalOrders: number; totalSpent: number; lastPurchase: Date }
  >();

  for (const o of rawOrders) {
    const existing = customerMap.get(o.buyerEmail);
    if (existing) {
      existing.totalOrders++;
      existing.totalSpent += o.amount;
    } else {
      customerMap.set(o.buyerEmail, {
        name: o.buyerName,
        email: o.buyerEmail,
        totalOrders: 1,
        totalSpent: o.amount,
        lastPurchase: o.createdAt,
      });
    }
  }

  const all = Array.from(customerMap.values());
  const paginated = all.slice(page * limit, (page + 1) * limit);

  return NextResponse.json({
    data: paginated,
    meta: { page, limit, total: all.length, pages: Math.ceil(all.length / limit) },
  });
}
