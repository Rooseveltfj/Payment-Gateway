import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus, KycStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as UserStatus | null;
    const kycStatus = searchParams.get("kycStatus") as KycStatus | null;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search } }
      ];
    }

    if (status) where.status = status;
    if (kycStatus) where.kycStatus = kycStatus;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Enhance users with volume data
    const enhancedUsers = await Promise.all(users.map(async (u) => {
      try {
        const volume = await prisma.order.aggregate({
          _sum: { amount: true },
          where: { userId: u.id, status: "PAID" }
        });

        return {
          ...u,
          volume: volume._sum.amount || 0,
          productCount: u._count.products,
          _count: undefined
        };
      } catch (err) {
        console.error(`Error enhancing user ${u.id}:`, err);
        return {
          ...u,
          volume: 0,
          productCount: u._count.products,
          _count: undefined
        };
      }
    }));

    return NextResponse.json({
      users: enhancedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });

  } catch (error) {
    console.error("ADMIN_USERS_ERROR", error);
    return NextResponse.json({ 
      error: "Erro interno no servidor ao buscar usuários",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    }, { status: 500 });
  }
}
