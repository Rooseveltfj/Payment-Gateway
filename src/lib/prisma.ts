import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// No Prisma 7, conexões diretas via driver nativo exigem o uso de um adapter.
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  // Ativa SSL para conexões em produção (Supabase/Neon exigem)
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn", "info"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
