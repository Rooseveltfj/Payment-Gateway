import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let settings = await prisma.platformSetting.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.platformSetting.create({
        data: { id: "global" }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("ADMIN_SETTINGS_GET_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Remove ID if present in body to prevent update issues
    delete data.id;

    const settings = await prisma.platformSetting.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data }
    });

    await prisma.adminLog.create({
      data: {
        adminId: user?.id || "",
        action: "SETTINGS_UPDATE",
        details: `Platform settings updated`
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("ADMIN_SETTINGS_PATCH_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
