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

  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: {
      availableBalance: true,
      pendingBalance: true,
      totalEarnings: true,
      totalWithdrawn: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      available_balance: user.availableBalance,
      pending_balance: user.pendingBalance,
      total_earnings: user.totalEarnings,
      total_withdrawn: user.totalWithdrawn,
      currency: "BRL",
    },
  });
}
