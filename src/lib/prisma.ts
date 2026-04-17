import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn", "info"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
