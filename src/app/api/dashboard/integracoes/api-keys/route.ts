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

  // Return masked keys (show only prefix)
  return NextResponse.json(
    keys.map((k) => ({
      id: k.id,
      name: k.name,
      active: k.active,
      lastUsed: k.lastUsed,
      createdAt: k.createdAt,
      preview: k.key.substring(0, 16) + "••••••••••••••••",
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const { name, environment = "LIVE" } = await request.json();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const plainKey = generateApiKey(environment as "LIVE" | "TEST");
  const hashedKey = await bcrypt.hash(plainKey, 10);

  const created = await prisma.apiKey.create({
    data: {
      userId: userId!,
      name,
      key: hashedKey,
    },
  });

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
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const { id } = await request.json();

  const key = await prisma.apiKey.findFirst({ where: { id, userId } });
  if (!key) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  await prisma.apiKey.update({ where: { id }, data: { active: false } });

  return NextResponse.json({ success: true });
}
