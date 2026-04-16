import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId: auth.user.userId },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json({ data: product });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId: auth.user.userId },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  try {
    const body = await request.json();
    const { name, description, price, status } = body;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
