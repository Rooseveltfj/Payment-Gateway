// ============================================================
// PulsePay — Regras e helpers de assets do Checkout (logo/banner)
// Compartilhado entre CLIENT (validação + sniff) e SERVER (validação).
// Sem imports server-only para poder rodar no browser.
// ============================================================

export const CHECKOUT_ASSETS_BUCKET = "checkout-assets";

export type AssetKind = "logo" | "banner";

export const IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const VIDEO_MIMES = ["video/mp4", "video/webm"] as const;

const MB = 1024 * 1024;

// Limites por tipo de asset
export const ASSET_RULES = {
  logo: {
    label: "Logo",
    mimes: IMAGE_MIMES as readonly string[],
    maxBytes: 2 * MB,
    allowVideo: false,
  },
  banner: {
    label: "Banner",
    mimes: [...IMAGE_MIMES, ...VIDEO_MIMES] as readonly string[],
    maxImageBytes: 5 * MB,
    maxVideoBytes: 50 * MB,
    allowVideo: true,
  },
} as const;

export function isVideoMime(mime: string): boolean {
  return (VIDEO_MIMES as readonly string[]).includes(mime);
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm)(\?|#|$)/i.test(url);
}

/** Extensão canônica a partir do content-type. */
export function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg",
    "video/mp4": "mp4", "video/webm": "webm",
  };
  return map[mime] || "bin";
}

/** Limite de bytes efetivo para um (kind, mime). Retorna null se o mime não é permitido. */
export function maxBytesFor(kind: AssetKind, mime: string): number | null {
  if (kind === "logo") {
    return ASSET_RULES.logo.mimes.includes(mime) ? ASSET_RULES.logo.maxBytes : null;
  }
  // banner
  if (isVideoMime(mime)) return ASSET_RULES.banner.maxVideoBytes;
  if ((IMAGE_MIMES as readonly string[]).includes(mime)) return ASSET_RULES.banner.maxImageBytes;
  return null;
}

export interface ValidationResult { ok: boolean; error?: string; }

/** Validação por metadados (content-type declarado + tamanho). Mensagens pt-BR. */
export function validateAssetMeta(kind: AssetKind, mime: string, size: number): ValidationResult {
  const max = maxBytesFor(kind, mime);
  if (max === null) {
    const permitidos = kind === "logo"
      ? "PNG, JPG, WEBP ou SVG"
      : "PNG, JPG, WEBP, SVG, MP4 ou WEBM";
    return { ok: false, error: `Formato inválido. Use ${permitidos}.` };
  }
  if (size > max) {
    const mb = Math.round(max / MB);
    const tipo = isVideoMime(mime) ? "vídeo" : "imagem";
    return { ok: false, error: `Arquivo muito grande. Máximo de ${mb}MB para ${tipo}.` };
  }
  if (size === 0) return { ok: false, error: "Arquivo vazio." };
  return { ok: true };
}

/** Deriva o path dentro do bucket a partir da URL pública (para cleanup). */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${CHECKOUT_ASSETS_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

// ── Sniff de content-type REAL (magic bytes), no client ──────
// Evita confiar apenas na extensão/File.type.
export async function sniffMime(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const hex = (n: number) => head[n]?.toString(16).padStart(2, "0");
  // PNG 89 50 4E 47
  if (hex(0) === "89" && hex(1) === "50" && hex(2) === "4e" && hex(3) === "47") return "image/png";
  // JPEG FF D8 FF
  if (hex(0) === "ff" && hex(1) === "d8" && hex(2) === "ff") return "image/jpeg";
  // WEBP: RIFF....WEBP
  if (hex(0) === "52" && hex(1) === "49" && hex(2) === "46" && hex(3) === "46" &&
      hex(8) === "57" && hex(9) === "45" && hex(10) === "42" && hex(11) === "50") return "image/webp";
  // WEBM/Matroska EBML 1A 45 DF A3
  if (hex(0) === "1a" && hex(1) === "45" && hex(2) === "df" && hex(3) === "a3") return "video/webm";
  // MP4: 'ftyp' em offset 4
  if (hex(4) === "66" && hex(5) === "74" && hex(6) === "79" && hex(7) === "70") return "video/mp4";
  // SVG: texto contendo "<svg" nos primeiros bytes
  const text = new TextDecoder().decode(head).toLowerCase();
  if (text.includes("<svg") || text.includes("<?xml")) return "image/svg+xml";
  return null;
}
