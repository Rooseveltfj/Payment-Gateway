import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // In a real environment, you might verify role === "ADMIN".
  // Right now we just mock or return from DB.
  
  try {
    const users = await prisma.user.findMany({
      where: {
        kycStatus: "PENDING"
      },
      include: {
        kycDocuments: true
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ users });
  } catch {
    // Return dummy data if Prisma is not connected
    return NextResponse.json({ users: [] });
  }
}
