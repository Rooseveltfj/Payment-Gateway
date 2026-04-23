import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { secret, token } = await req.json();

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1
  });

  if (!verified) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorMethod: "TOTP",
    }
  });

  await audit("2FA_ENABLED", session.user.id, { method: "TOTP" }, req);

  return NextResponse.json({ success: true });
}

