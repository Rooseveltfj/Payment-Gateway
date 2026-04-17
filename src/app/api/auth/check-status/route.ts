import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { status: true }
    });

    if (!user) {
      return NextResponse.json({ status: "NOT_FOUND" });
    }

    return NextResponse.json({ status: user.status });
  } catch (error) {
    console.error("[Auth] Status check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
