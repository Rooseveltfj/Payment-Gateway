import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { audit } from "@/lib/audit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await auth();
  
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id, docId } = params;

  try {
    const doc = await prisma.kycDocument.findFirst({
      where: { 
        id: docId,
        userId: id 
      }
    });

    if (!doc) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // Gerar URL assinada que expira em 5 minutos (300 segundos)
    // Isso garante que o documento nunca seja exposto via URL pública permanente
    const { data, error } = await supabaseAdmin.storage
      .from("kyc-documents")
      .createSignedUrl(doc.filePath ?? "", 300);

    if (error || !data?.signedUrl) {
      console.error("[Admin KYC] Error generating signed URL:", error);
      return NextResponse.json({ error: "Falha ao gerar link de visualização" }, { status: 500 });
    }

    await audit("SUSPICIOUS_ACTIVITY", session.user.id!, {
      action: "ADMIN_KYC_DOCUMENT_VIEWED",
      targetUserId: id,
      docId: docId,
      docType: doc.type
    }, request);

    return NextResponse.json({ url: data.signedUrl });

  } catch (error) {
    console.error("[Admin KYC] Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
