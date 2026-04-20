import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { getKycApprovedTemplate } from "@/lib/email-templates";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { kycStatus: "APPROVED" }
    });
    
    // Auto-approve docs too
    await prisma.kycDocument.updateMany({
       where: { userId: params.id },
       data: { status: "APPROVED" }
    });

    // Send congratulatory email
    try {
      await sendEmail({
        to: user.email,
        subject: "Sua conta PulsePay foi verificada! 💎",
        html: getKycApprovedTemplate(user.name.split(' ')[0])
      });
    } catch (emailError) {
      console.error("[KYC_EMAIL_ERROR]", emailError);
      // Don't fail the whole request if only email fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[KYC_APPROVE_ERROR]", error);
    return NextResponse.json({ error: "Erro ao aprovar KYC" }, { status: 500 });
  }
}
