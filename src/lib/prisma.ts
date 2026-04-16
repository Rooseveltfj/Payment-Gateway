import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL || "prisma://accelerate.net/?api_key=mock",
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
