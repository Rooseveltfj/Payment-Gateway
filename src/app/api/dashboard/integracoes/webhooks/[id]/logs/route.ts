import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const webhook = await prisma.webhook.findFirst({ where: { id: params.id, userId } });
  if (!webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const limit = 20;

  const [logs, total] = await Promise.all([
    prisma.webhookLog.findMany({
      where: { webhookId: params.id },
      skip: page * limit,
      take: limit,
      orderBy: { sentAt: "desc" },
    }),
    prisma.webhookLog.count({ where: { webhookId: params.id } }),
  ]);

  return NextResponse.json({ data: logs, meta: { page, limit, total } });
}
