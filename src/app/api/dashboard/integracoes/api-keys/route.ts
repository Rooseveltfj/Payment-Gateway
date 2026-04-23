import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateApiKey } from "@/lib/api-auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, name: true, active: true, lastUsed: true, createdAt: true, key: true },
    orderBy: { createdAt: "desc" },
  });

  const { decrypt, isEncrypted } = await import("@/lib/encryption");

  const formattedKeys = await Promise.all(keys.map(async (k) => {
    let plainKey = "";
    try {
      plainKey = isEncrypted(k.key) ? await decrypt(k.key) : "Legacy Key";
    } catch (e) {
      plainKey = "Error";
    }
    
    return {
      id: k.id,
      name: k.name,
      active: k.active,
      lastUsed: k.lastUsed,
      createdAt: k.createdAt,
      preview: plainKey.substring(0, 10) + "••••••••••••••••",
    };
  }));

  return NextResponse.json(formattedKeys);
}

import { encrypt, hashApiKey } from "@/lib/encryption";

import { audit } from "@/lib/audit";
import { detectSuspiciousActivity } from "@/lib/security-monitor";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const suspicion = await detectSuspiciousActivity(userId, 'API_KEY_CREATED', ip);
  if (suspicion.blocked) {
    return NextResponse.json({ error: suspicion.reason }, { status: 403 });
  }

  const { name, environment = "LIVE" } = await request.json();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const plainKey = generateApiKey(environment as "LIVE" | "TEST");
  const encryptedKey = await encrypt(plainKey);
  const keyHash = hashApiKey(plainKey);

  const created = await prisma.apiKey.create({
    data: {
      userId,
      name,
      key: encryptedKey,
      keyHash,
    },
  });

  await audit('API_KEY_CREATED', userId, { name, environment }, request);

  // Return plaintext key ONCE — it's never retrievable again
  return NextResponse.json({
    id: created.id,
    name: created.name,
    key: plainKey, // shown once
    createdAt: created.createdAt,
  });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { id } = await request.json();

  const key = await prisma.apiKey.findFirst({ where: { id, userId } });
  if (!key) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  await prisma.apiKey.update({ where: { id }, data: { active: false } });

  await audit('API_KEY_REVOKED', userId, { keyId: id, name: key.name }, request);

  return NextResponse.json({ success: true });
}
