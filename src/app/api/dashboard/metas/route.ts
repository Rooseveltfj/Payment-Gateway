import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGE_THRESHOLDS, BADGE_ORDER } from "@/lib/constants/badges";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { badges: { orderBy: { earnedAt: "asc" } } },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const earnedTypes = new Set(user.badges.map((b) => b.badge));
  
  // Encontra o próximo badge
  let nextBadge = null;
  for (const b of BADGE_ORDER) {
    if (!earnedTypes.has(b)) {
      nextBadge = b;
      break;
    }
  }

  const nextThreshold = nextBadge ? BADGE_THRESHOLDS[nextBadge] : null;
  const progress = nextThreshold ? Math.min((user.totalEarnings / nextThreshold) * 100, 100) : 100;

  return NextResponse.json({
    totalEarnings: user.totalEarnings,
    badges: user.badges,
    nextBadge,
    nextThreshold,
    progress,
  });
}
