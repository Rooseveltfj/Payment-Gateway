import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { secret, token } = await req.json();

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1 // +/- 30 seconds
  });

  if (!verified) {
    return NextResponse.json({ error: "Cdigo invlido" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    }
  });

  await createAuditLog({
    userId: session.user.id,
    action: "2FA_ENABLED",
    details: "Usurio ativou a autenticao de dois fatores."
  });

  return NextResponse.json({ success: true });
}

