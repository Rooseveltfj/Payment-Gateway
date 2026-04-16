export enum BadgeType {
  BADGE_10K = "BADGE_10K",
  BADGE_50K = "BADGE_50K",
  BADGE_100K = "BADGE_100K",
  BADGE_500K = "BADGE_500K",
  BADGE_1M = "BADGE_1M",
  BADGE_5M = "BADGE_5M",
}

export const BADGE_THRESHOLDS: Record<string, number> = {
  [BadgeType.BADGE_10K]: 10000,
  [BadgeType.BADGE_50K]: 50000,
  [BadgeType.BADGE_100K]: 100000,
  [BadgeType.BADGE_500K]: 500000,
  [BadgeType.BADGE_1M]: 1000000,
  [BadgeType.BADGE_5M]: 5000000,
};

export const BADGE_ORDER: BadgeType[] = [
  BadgeType.BADGE_10K,
  BadgeType.BADGE_50K,
  BadgeType.BADGE_100K,
  BadgeType.BADGE_500K,
  BadgeType.BADGE_1M,
  BadgeType.BADGE_5M,
];
