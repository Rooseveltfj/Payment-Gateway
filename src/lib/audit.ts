import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function createAuditLog({
  userId,
  action,
  details,
}: {
  userId: string;
  action: string;
  details?: string;
}) {
  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
