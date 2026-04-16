import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        products: { take: 5, orderBy: { createdAt: 'desc' } },
        kycDocuments: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sales = await prisma.order.findMany({
      where: { userId: params.id, status: "PAID" },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const adminLogs = await prisma.adminLog.findMany({
      where: { targetId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      user,
      sales,
      adminLogs
    });

  } catch (error) {
    console.error("ADMIN_USER_DETAIL_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  const user = session?.user as { role?: string; id: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, platformFeePercent, note } = body;

    const oldUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!oldUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        platformFeePercent: platformFeePercent !== undefined ? parseFloat(platformFeePercent) : undefined
      }
    });

    // Log the action
    if (status && status !== oldUser.status) {
      await prisma.adminLog.create({
        data: {
          adminId: user?.id || "",
          targetId: params.id,
          action: "USER_STATUS_CHANGE",
          details: `Changed status from ${oldUser.status} to ${status}. ${note || ""}`
        }
      });
    }

    if (platformFeePercent !== undefined && platformFeePercent !== oldUser.platformFeePercent) {
      await prisma.adminLog.create({
        data: {
          adminId: user?.id || "",
          targetId: params.id,
          action: "USER_FEE_CHANGE",
          details: `Changed fee from ${oldUser.platformFeePercent}% to ${platformFeePercent}%. ${note || ""}`
        }
      });
    }

    if (note && !status && platformFeePercent === undefined) {
      await prisma.adminLog.create({
        data: {
          adminId: user?.id || "",
          targetId: params.id,
          action: "ADMIN_NOTE",
          details: note
        }
      });
    }

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("ADMIN_USER_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
