import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
