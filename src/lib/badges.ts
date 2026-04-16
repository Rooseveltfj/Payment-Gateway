import { prisma } from "./prisma";
import { BadgeType } from "./constants/badges";
import { BADGE_ORDER, BADGE_THRESHOLDS } from "./constants/badges";

/**
 * Verifica e concede badges com base no faturamento total do usuário.
 * Retorna os novos badges conquistados nesta execução.
 */
export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { badges: true },
  });

  if (!user) return [];

  const earnedBadgeTypes = new Set(user.badges.map((b) => b.badge));
  const newBadges: BadgeType[] = [];

  for (const badgeType of BADGE_ORDER) {
    const threshold = BADGE_THRESHOLDS[badgeType];
    
    // Se o usuário atingiu o marco e ainda não tem o badge
    if (user.totalEarnings >= threshold && !earnedBadgeTypes.has(badgeType)) {
      newBadges.push(badgeType);
    }
  }

  if (newBadges.length > 0) {
    await prisma.userBadge.createMany({
      data: newBadges.map((badge) => ({
        userId,
        badge,
      })),
    });
  }

  return newBadges;
}
