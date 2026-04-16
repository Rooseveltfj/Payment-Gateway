import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  const products = await prisma.product.findMany({
    where: { userId: auth.user.userId },
    skip: page * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      type: true,
      status: true,
      slug: true,
      salesCount: true,
      revenue: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.product.count({ where: { userId: auth.user.userId } });

  return NextResponse.json({
    data: products,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { name, description, price, type } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "name and price are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Math.random().toString(36).slice(2, 6);

    const product = await prisma.product.create({
      data: {
        userId: auth.user.userId,
        name,
        description,
        price: parseFloat(price),
        type: type ?? "SINGLE",
        slug,
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
