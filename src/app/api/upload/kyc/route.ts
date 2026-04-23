import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import sharp from "sharp";
import { audit } from "@/lib/audit";

// USAR SERVICE ROLE — nunca expor ao cliente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const docType = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }

    // 1. Validar tipo MIME real (Magic Bytes)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const magicBytes = buffer.slice(0, 4);
    const isJpeg = magicBytes[0] === 0xFF && magicBytes[1] === 0xD8;
    const isPng = magicBytes[0] === 0x89 && magicBytes[1] === 0x50;
    const isWebp = buffer.slice(8, 12).toString() === "WEBP";
    
    if (!isJpeg && !isPng && !isWebp) {
      await audit("SUSPICIOUS_ACTIVITY", session.user.id, {
        reason: "Upload com tipo de arquivo forjado ou não permitido",
        claimedType: file.type
      });
      return NextResponse.json({ error: "Tipo de arquivo não permitido (apenas JPG, PNG, WEBP)" }, { status: 400 });
    }

    // 2. Validar tamanho
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 10MB)" }, { status: 400 });
    }

    // 3. Reprocessar imagem com sharp (remove metadados EXIF, normaliza)
    // Protege contra exploits em imagens malformadas e remove GPS/info pessoal
    const safeBuffer = await sharp(buffer)
      .rotate() // corrige orientação automática baseada em EXIF
      .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true, chromaSubsampling: "4:4:4" })
      .toBuffer();

    // 4. Nome de arquivo seguro com prefixo do usuário e subdiretório do tipo
    const safeFilename = `${session.user.id}/${docType}/${randomBytes(16).toString("hex")}.jpg`;

    // 5. Upload no bucket privado via service role
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from("kyc-documents")
      .upload(safeFilename, safeBuffer, {
        contentType: "image/jpeg",
        upsert: false,
        cacheControl: "3600"
      });

    if (uploadError) {
      console.error("[KYC Upload] Supabase Error:", uploadError);
      return NextResponse.json({ error: "Falha ao salvar no storage" }, { status: 500 });
    }

    // 6. Salvar referência no banco (usar filePath interno)
    await prisma.kycDocument.create({
      data: {
        userId: session.user.id,
        type: docType as any,
        filePath: safeFilename,
        status: "PENDING",
      }
    });

    // Atualizar status do KYC do usuário se necessário
    await prisma.user.update({
      where: { id: session.user.id },
      data: { kycStatus: "PENDING" }
    });

    await audit("KYC_SUBMITTED", session.user.id, { docType, filePath: safeFilename });

    return NextResponse.json({ 
      success: true, 
      message: "Documento enviado com sucesso e aguardando revisão." 
    });

  } catch (error) {
    console.error("[KYC Upload] Error:", error);
    return NextResponse.json({ error: "Erro interno no processamento do upload" }, { status: 500 });
  }
}
