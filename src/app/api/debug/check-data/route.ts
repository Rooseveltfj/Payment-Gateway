// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ 
      where: { email: 'rooseveltyyy@gmail.com' },
      select: { 
        id: true, 
        availableBalance: true, 
        totalEarnings: true,
        _count: { select: { orders: true } }
      }
    });

    const recentOrders = await prisma.order.findMany({
        where: { userId: user?.id, status: 'PAID' },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ user, recentOrders });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
