import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const topUsers = await prisma.user.findMany({
    where: { totalEarnings: { gt: 0 } },
    orderBy: { totalEarnings: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      totalEarnings: true,
      badges: {
        orderBy: { earnedAt: "desc" },
        take: 1,
        select: { badge: true },
      },
    },
  });

  // Formata os nomes para privacidade: "Fulano D.***"
  const formattedUsers = topUsers.map((u) => {
    const parts = u.name.split(" ");
    const firstName = parts[0];
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return {
      ...u,
      name: `${firstName} ${lastInitial ? lastInitial + "." : ""}***`,
      currentBadge: u.badges[0]?.badge ?? null,
    };
  });

  return NextResponse.json(formattedUsers);
}
