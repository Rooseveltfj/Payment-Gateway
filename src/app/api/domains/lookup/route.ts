import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  try {
    const customDomain = await prisma.customDomain.findUnique({
      where: { domain },
      include: { user: { select: { username: true } } }
    });

    if (!customDomain || customDomain.status !== "ACTIVE") {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({ 
      active: true, 
      username: customDomain.user.username 
    });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
