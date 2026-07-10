import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Client Supabase com service_role — SOMENTE server-side.
// NUNCA importar em componentes client: usa a service_role key (bypassa RLS).
// Importado apenas por route handlers (src/app/api/**).
// ============================================================

let cached: SupabaseClient | null = null;

/** Decodifica o role do JWT da chave (para detectar chave anon no lugar da service_role). */
function keyRole(key: string): string | null {
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64").toString()).role || null;
  } catch {
    return null;
  }
}

/**
 * Retorna o client admin. Lança erro CLARO se a service_role key estiver
 * ausente ou for na verdade a anon key (bug #1 do audit) — nada de falha
 * silenciosa: as rotas convertem isso em 500 com mensagem acionável.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL ausente.");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente.");

  const role = keyRole(key);
  if (role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY inválida: o JWT tem role "${role}", esperado "service_role". ` +
      `Cole a service_role real (Supabase Dashboard → Settings → API → service_role) no .env.`
    );
  }

  if (!cached) {
    cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return cached;
}

export function isServiceRoleConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!key && keyRole(key) === "service_role";
}
