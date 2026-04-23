import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { rateLimits } from "@/lib/rate-limit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = await validateApiKey(request);
  if ("error" in auth) return auth.error;

  // ── Rate limit ────────────────────────────────────────────────────────────
  const { success } = await rateLimits.api.limit(auth.user.keyId);
  if (!success) {
    return json({ error: "Limite de requisições atingido. Tente em instantes." }, 429);
  }

  const { id } = params;

  // ── Fetch order (scoped to this API key owner) ────────────────────────────
  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: auth.user.userId,
    },
    select: {
      id: true,
      externalCorrelationId: true,
      status: true,
      amount: true,
      paidAt: true,
      createdAt: true,
      pixCopyPaste: true,
      pixQrCodeUrl: true,
      pixExpiresAt: true,
    },
  });

  if (!order) {
    return json({ error: "Cobrança não encontrada" }, 404);
  }

  return json({
    success: true,
    charge: {
      id: order.id,
      correlationID: order.externalCorrelationId ?? null,
      status: order.status,
      amount: Math.round(order.amount * 100),
      paidAt: order.paidAt ?? null,
      createdAt: order.createdAt,
      // Include PIX details so partner can show QR to end-user even via polling
      pixCopyPaste: order.pixCopyPaste ?? null,
      qrCodeImage: order.pixQrCodeUrl ?? null,
      expiresAt: order.pixExpiresAt ?? null,
    },
  });
}
