import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export interface ApiUser {
  userId: string;
  keyId: string;
  environment: "LIVE" | "TEST";
}

export async function validateApiKey(
  request: Request
): Promise<{ user: ApiUser } | { error: NextResponse }> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header. Use: Authorization: Bearer [api_key]" },
        { status: 401 }
      ),
    };
  }

  const rawKey = authHeader.replace("Bearer ", "").trim();

  if (!rawKey || rawKey.length < 10) {
    return {
      error: NextResponse.json({ error: "Invalid API key format" }, { status: 401 }),
    };
  }

  // Keys are stored as a prefix + hash. Prefix is the first 8 chars (bg_live_ or bg_test_)
  const keys = await prisma.apiKey.findMany({
    where: { active: true },
    select: { id: true, key: true, userId: true, name: true },
  });

  let matchedKey: (typeof keys)[0] | null = null;

  for (const k of keys) {
    // key field stores bcrypt hash
    const isMatch = await bcrypt.compare(rawKey, k.key);
    if (isMatch) {
      matchedKey = k;
      break;
    }
  }

  if (!matchedKey) {
    return {
      error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
    };
  }

  // Update lastUsed timestamp
  await prisma.apiKey.update({
    where: { id: matchedKey.id },
    data: { lastUsed: new Date() },
  });

  const environment = rawKey.startsWith("bg_test_") ? "TEST" : "LIVE";

  return {
    user: {
      userId: matchedKey.userId,
      keyId: matchedKey.id,
      environment,
    },
  };
}

/** Generate a new API key string (plaintext, shown once) */
export function generateApiKey(environment: "LIVE" | "TEST"): string {
  const prefix = environment === "LIVE" ? "bg_live_" : "bg_test_";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let rand = "";
  for (let i = 0; i < 40; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + rand;
}
