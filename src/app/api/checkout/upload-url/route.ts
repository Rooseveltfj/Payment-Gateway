import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  CHECKOUT_ASSETS_BUCKET,
  AssetKind,
  validateAssetMeta,
  extFromMime,
} from "@/lib/checkout-assets";

export const dynamic = "force-dynamic";

// POST /api/checkout/upload-url
// body: { kind: "logo"|"banner", contentType: string, size: number }
// resp: { path, token, signedUrl, publicUrl }
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { kind?: string; contentType?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const kind = body.kind as AssetKind;
  const contentType = String(body.contentType || "");
  const size = Number(body.size || 0);

  if (kind !== "logo" && kind !== "banner") {
    return NextResponse.json({ error: "Tipo de asset inválido." }, { status: 400 });
  }

  // Validação server-side (content-type declarado + tamanho). O bucket também
  // impõe allowed_mime_types no upload real (checagem dupla).
  const v = validateAssetMeta(kind, contentType, size);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }

  // Path escopado ao userId — o usuário só recebe URL assinada para a PRÓPRIA pasta.
  const path = `${userId}/${kind}-${randomUUID()}.${extFromMime(contentType)}`;

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    // Bug #1 do audit: service_role ausente/errada. Mensagem acionável, sem falha silenciosa.
    console.error("UPLOAD_URL_CONFIG_ERROR:", (e as Error).message);
    return NextResponse.json(
      { error: "Storage não configurado no servidor. Contate o suporte.", detail: (e as Error).message },
      { status: 500 }
    );
  }

  const { data, error } = await admin.storage
    .from(CHECKOUT_ASSETS_BUCKET)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) {
    console.error("CREATE_SIGNED_UPLOAD_URL_ERROR:", error?.message);
    return NextResponse.json({ error: "Falha ao preparar o upload. Tente novamente." }, { status: 500 });
  }

  const { data: pub } = admin.storage.from(CHECKOUT_ASSETS_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: pub.publicUrl,
  });
}
