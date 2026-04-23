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

  const { hashApiKey } = await import("@/lib/encryption");
  const keyHash = hashApiKey(rawKey);

  const matchedKey = await prisma.apiKey.findUnique({
    where: { 
      keyHash: keyHash,
      active: true 
    },
    select: { id: true, userId: true },
  });

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
