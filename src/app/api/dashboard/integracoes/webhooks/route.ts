import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const webhooks = await prisma.webhook.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(webhooks);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const { url, events } = await request.json();
  if (!url || !events?.length) {
    return NextResponse.json({ error: "url and events are required" }, { status: 400 });
  }

  const secret = "whs_" + crypto.randomBytes(20).toString("hex");

  const webhook = await prisma.webhook.create({
    data: {
      userId: userId!,
      url,
      events,
      secret,
    },
  });

  return NextResponse.json({ ...webhook, secret }); // Return secret once
}
