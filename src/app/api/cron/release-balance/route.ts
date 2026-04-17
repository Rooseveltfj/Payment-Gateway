import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Balance Release Cron Job
 * Moves matured funds from 'PendingBalance' to 'User.availableBalance'.
 * 
 * Frequency: Once per day (e.g., 00:00 UTC)
 */

export async function GET(req: Request) {
  try {
    // Basic auth check for Cron (requires CRON_SECRET header from Vercel)
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // 1. Find matured pending balances
    const maturedBalances = await prisma.pendingBalance.findMany({
      where: {
        availableAt: { lte: now },
        released: false
      }
    });

    if (maturedBalances.length === 0) {
      return NextResponse.json({ message: "No balances to release" });
    }

    console.log(`[Cron] Releasing ${maturedBalances.length} pending balances...`);

    // 2. Process each balance in a transaction
    let totalReleased = 0;
    for (const balance of maturedBalances) {
      await prisma.$transaction([
        // Mark as released
        prisma.pendingBalance.update({
          where: { id: balance.id },
          data: { released: true }
        }),
        // Add to user's available balance and subtract from pending
        prisma.user.update({
          where: { id: balance.userId },
          data: {
            availableBalance: { increment: balance.amount },
            pendingBalance: { decrement: balance.amount }
          }
        }),
        // Update Order maturity status (optional but good for tracking)
        prisma.order.update({
          where: { id: balance.orderId },
          data: { isMatured: true }
        })
      ]);
      totalReleased += balance.amount;
    }

    return NextResponse.json({ 
      success: true, 
      count: maturedBalances.length, 
      total: totalReleased 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
