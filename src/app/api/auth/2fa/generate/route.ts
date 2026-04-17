import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = speakeasy.generateSecret({
    name: `PulsePay (${session.user.email})`,
  });

  const url = await QRCode.toDataURL(secret.otpauth_url!);

  return NextResponse.json({ 
    secret: secret.base32,
    qrCode: url 
  });
}

