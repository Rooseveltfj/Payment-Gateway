import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as ProductStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: { status?: ProductStatus; OR: Array<{ name?: { contains: string; mode: 'insensitive' }; user?: { name?: { contains: string; mode: 'insensitive' } } | { email?: { contains: string; mode: 'insensitive' } } }> } = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    };

    if (status) where.status = status;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });

  } catch (error) {
    console.error("ADMIN_PRODUCTS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: { status },
    });

    await prisma.adminLog.create({
      data: {
        adminId: user?.id || "",
        targetId: id,
        action: "PRODUCT_STATUS_CHANGE",
        details: `Admin changed product status to ${status}`
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("ADMIN_PRODUCT_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
