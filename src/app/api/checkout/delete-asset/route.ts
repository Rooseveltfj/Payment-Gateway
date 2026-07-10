import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CHECKOUT_ASSETS_BUCKET, pathFromPublicUrl } from "@/lib/checkout-assets";

export const dynamic = "force-dynamic";

// POST /api/checkout/delete-asset
// body: { url: string }  (URL pública do asset a remover)
// Só remove assets da PRÓPRIA pasta {userId}/... do usuário autenticado.
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { url?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const path = body.path || (body.url ? pathFromPublicUrl(body.url) : null);
  if (!path) {
    // URL externa ou não pertencente ao bucket — nada a remover, não é erro.
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Ownership: o path DEVE começar com "{userId}/".
  if (!path.startsWith(`${userId}/`)) {
    return NextResponse.json({ error: "Sem permissão para remover este arquivo." }, { status: 403 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    console.error("DELETE_ASSET_CONFIG_ERROR:", (e as Error).message);
    return NextResponse.json({ error: "Storage não configurado no servidor." }, { status: 500 });
  }

  const { error } = await admin.storage.from(CHECKOUT_ASSETS_BUCKET).remove([path]);
  if (error) {
    console.error("DELETE_ASSET_ERROR:", error.message);
    return NextResponse.json({ error: "Falha ao remover o arquivo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
