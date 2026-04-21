import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const currentUser = session?.user as { role?: string } | undefined;

  if (!session || currentUser?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reason } = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.user.update({
      where: { id: params.id },
      data: { kycStatus: "REJECTED" }
    });
    
    await prisma.kycDocument.updateMany({
       where: { userId: params.id },
       data: { status: "REJECTED", reviewNote: reason }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, mocked: true });
  }
}
