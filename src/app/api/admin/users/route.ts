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

    // Duas leituras independentes: Promise.all em vez de $transaction
    // (a transação custava BEGIN + q1 + q2 + COMMIT em série = 4 round-trips).
    const [users, total] = await Promise.all([
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

    // Volume por usuário em UMA query (antes: um aggregate por usuário — N+1).
    const volumeByUser = new Map<string, number>();
    try {
      const volumes = await prisma.order.groupBy({
        by: ['userId'],
        _sum: { amount: true },
        where: { userId: { in: users.map(u => u.id) }, status: "PAID" }
      });
      for (const v of volumes) volumeByUser.set(v.userId, v._sum.amount || 0);
    } catch (err) {
      console.error("Error aggregating user volumes:", err);
      // fallback: volumes ficam 0, como no tratamento de erro anterior
    }

    const enhancedUsers = users.map((u) => ({
      ...u,
      volume: volumeByUser.get(u.id) || 0,
      productCount: u._count.products,
      _count: undefined
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
