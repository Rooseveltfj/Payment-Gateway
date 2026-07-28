import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { rateLimits } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { WOOVI_ENABLED } from "@/lib/features";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

const schema = z.object({
  amount: z.number().int().positive().max(10_000_000),   // máx R$100k em centavos
  correlationID: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  customer: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    taxID: z.string().regex(/^\d{11}$/).optional(),
  }),
});

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export async function POST(request: Request) {
  // Integração Woovi desativada por enquanto — não geramos PIX.
  if (!WOOVI_ENABLED) {
    return json({ error: "Pagamento via PIX temporariamente indisponível." }, 503);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = await validateApiKey(request);
  if ("error" in auth) {
    // Patch CORS onto the error response
    const err = auth.error;
    corsHeaders["Access-Control-Allow-Origin"] && err.headers.set("Access-Control-Allow-Origin", "*");
    return auth.error;
  }

  // ── Rate limit (keyed by API key id) ──────────────────────────────────────
  const { success } = await rateLimits.api.limit(auth.user.keyId);
  if (!success) {
    return json({ error: "Limite de requisições atingido. Tente em instantes." }, 429);
  }

  // ── Parse & validate body ─────────────────────────────────────────────────
  let body: z.infer<typeof schema>;
  try {
    const raw = await request.json();
    body = schema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return json({ error: "Dados inválidos", details: err.flatten().fieldErrors }, 422);
    }
    return json({ error: "Body inválido" }, 400);
  }

  const { amount: amountCents, correlationID, description, customer } = body;

  // ── Load user (owner of the API key) ─────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: { id: true, platformFeePercent: true, pixKey: true, pixKeyType: true, status: true },
  });

  if (!user || user.status === "SUSPENDED") {
    return json({ error: "Conta inativa ou suspensa" }, 403);
  }

  // ── Idempotency check ─────────────────────────────────────────────────────
  const existing = await prisma.order.findFirst({
    where: { userId: user.id, externalCorrelationId: correlationID },
  });

  if (existing) {
    return json({
      success: true,
      charge: {
        id: existing.id,
        correlationID,
        status: existing.status,
        amount: Math.round(existing.amount * 100),
        amountFormatted: formatBRL(Math.round(existing.amount * 100)),
        pixCopyPaste: existing.pixCopyPaste,
        qrCodeImage: existing.pixQrCodeUrl,
        expiresAt: existing.pixExpiresAt,
        expiresInSeconds: null,
      },
    });
  }

  // ── Calculate fees ────────────────────────────────────────────────────────
  const platformFeePercent = user.platformFeePercent ?? 9.99;
  const platformFeeCents = Math.round(amountCents * (platformFeePercent / 100));
  const netAmountCents = amountCents - platformFeeCents;

  // ── Create Order (PENDING) ────────────────────────────────────────────────
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      buyerName: customer.name,
      buyerEmail: customer.email,
      buyerCpf: customer.taxID,
      amount: amountCents / 100,
      platformFee: platformFeeCents / 100,
      netAmount: netAmountCents / 100,
      status: "PENDING",
      paymentMethod: "PIX",
      externalCorrelationId: correlationID,
    },
  });

  // ── Create Woovi PIX charge ───────────────────────────────────────────────
  let wooviCharge: any;
  try {
    const wooviPayload: any = {
      value: amountCents,
      correlationID: `order_${order.id}`,
      comment: description,
      customer: {
        name: customer.name,
        email: customer.email,
        ...(customer.taxID ? { taxID: customer.taxID } : {}),
      },
      expiresIn: 3600, // 1 hour
    };

    // Attach split only when the user has a PIX key configured
    if (user.pixKey) {
      wooviPayload.splits = [
        {
          pixKey: user.pixKey,
          value: netAmountCents,
          splitType: "SPLIT_SUB_ACCOUNT",
        },
      ];
    }

    const wooviRes = await fetch("https://api.woovi.com/api/v1/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.WOOVI_APP_ID!,
      },
      body: JSON.stringify(wooviPayload),
    });

    const wooviData = await wooviRes.json();

    if (!wooviRes.ok || !wooviData?.charge) {
      throw new Error(wooviData?.error ?? `Woovi HTTP ${wooviRes.status}`);
    }

    wooviCharge = wooviData.charge;
  } catch (err: any) {
    console.error("[PIX Charge] Woovi error:", err?.message ?? err);

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });

    return json({ error: "Falha ao gerar PIX junto ao processador de pagamento" }, 502);
  }

  // ── Persist Woovi data onto Order ─────────────────────────────────────────
  await prisma.order.update({
    where: { id: order.id },
    data: {
      wooviCorrelationId: wooviCharge.correlationID,
      pixCopyPaste: wooviCharge.brCode,
      pixQrCodeUrl: wooviCharge.qrCodeImage,
      pixExpiresAt: wooviCharge.expiresDate ? new Date(wooviCharge.expiresDate) : null,
    },
  });

  // ── Audit ─────────────────────────────────────────────────────────────────
  await audit("ORDER_CREATED", user.id, { correlationID, amountCents });

  // ── Response ──────────────────────────────────────────────────────────────
  return json(
    {
      success: true,
      charge: {
        id: order.id,
        correlationID,
        status: "PENDING",
        amount: amountCents,
        amountFormatted: formatBRL(amountCents),
        pixCopyPaste: wooviCharge.brCode,
        qrCodeImage: wooviCharge.qrCodeImage,
        expiresAt: wooviCharge.expiresDate ?? null,
        expiresInSeconds: wooviCharge.expiresIn ?? null,
      },
    },
    201
  );
}
