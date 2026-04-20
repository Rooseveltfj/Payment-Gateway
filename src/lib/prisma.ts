import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// No Prisma 7, a configuração do cliente gerado pode exigir um driver adapter explicitamente.
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000, 
  max: 20, // Aumentado para lidar com requisições concorrentes na dashboard
  allowExitOnIdle: true,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
