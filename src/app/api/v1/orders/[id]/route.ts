import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: auth.user.userId },
    include: { product: { select: { id: true, name: true } } },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({ data: order });
}
