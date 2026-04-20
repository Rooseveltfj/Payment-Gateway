import { prisma } from "@/lib/prisma";

export async function isIpTrusted(userId: string, ip: string) {
  const trusted = await prisma.trustedDevice.findUnique({
    where: {
      userId_ipAddress: {
        userId,
        ipAddress: ip
      }
    }
  });

  if (!trusted) return false;

  // Check expiry (e.g. 30 days)
  if (new Date() > trusted.expires) {
    await prisma.trustedDevice.delete({ where: { id: trusted.id } });
    return false;
  }

  return true;
}

export async function trustIp(userId: string, ip: string, userAgent?: string) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.trustedDevice.upsert({
    where: {
      userId_ipAddress: {
        userId,
        ipAddress: ip
      }
    },
    update: {
      expires,
      userAgent
    },
    create: {
      userId,
      ipAddress: ip,
      userAgent,
      expires
    }
  });
}
