import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false }
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("NOTIFICATION_API_ERROR:", error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
