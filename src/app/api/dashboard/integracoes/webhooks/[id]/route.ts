import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const webhook = await prisma.webhook.findFirst({ where: { id: params.id, userId } });
  if (!webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });

  const { active, events, url } = await request.json();

  const updated = await prisma.webhook.update({
    where: { id: params.id },
    data: {
      ...(active !== undefined && { active }),
      ...(events && { events }),
      ...(url && { url }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const webhook = await prisma.webhook.findFirst({ where: { id: params.id, userId } });
  if (!webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });

  await prisma.webhook.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
