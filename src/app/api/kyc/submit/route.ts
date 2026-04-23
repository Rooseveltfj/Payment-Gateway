import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { rateLimits } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await rateLimits.kyc.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // In a real scenario we use transactions, here we just mock the update or save gracefully.
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        kycStatus: "PENDING",
        document: data.cpf,
        phone: data.phone,
      }
    });

    const docs = [];
    if (data.frontIdUrl) docs.push({ type: "IDENTITY_FRONT", fileUrl: data.frontIdUrl, userId: session.user.id });
    if (data.backIdUrl) docs.push({ type: "IDENTITY_BACK", fileUrl: data.backIdUrl, userId: session.user.id });
    if (data.selfieUrl) docs.push({ type: "SELFIE", fileUrl: data.selfieUrl, userId: session.user.id });
    if (data.residencyUrl) docs.push({ type: "PROOF_OF_ADDRESS", fileUrl: data.residencyUrl, userId: session.user.id });

    if (docs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.kycDocument.createMany({ data: docs as any });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("KYC_SUBMIT_ERROR", error);
    return NextResponse.json({ error: "Erro ao processar submissão KYC. Tente novamente mais tarde." }, { status: 500 });
  }
}
