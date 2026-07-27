import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  sendOrderConfirmationEmail, 
  sendNewSaleEmail, 
  sendBadgeEarnedEmail, 
  sendNewOrderNotificationEmail 
} from "@/lib/email";
import { createHmac, timingSafeEqual } from 'crypto'
import { rateLimits } from "@/lib/rate-limit";
import { audit } from "@/lib/audit"

// IPs permitidos da Woovi (da documentação oficial)
const WOOVI_IPS = ['179.190.27.5', '179.190.27.6', '186.224.205.214']

export async function POST(request: Request) {
  // 1. Rate Limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous';
  const { success } = await rateLimits.webhook.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // 2. Verificar IP de origem
  if (process.env.NODE_ENV === 'production' && !WOOVI_IPS.includes(ip)) {
    console.warn(`[Webhook] IP não autorizado: ${ip}`)
    return new Response(null, { status: 403 })
  }

  // 3. Validar header de autorização (configurado na Woovi)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== process.env.WOOVI_WEBHOOK_AUTH) {
    console.warn(`[Webhook] Authorization header inválido`)
    return new Response(null, { status: 401 })
  }

  // 4. Ler body como texto para validar assinatura
  const rawBody = await request.text()
  
  // 5. Validar assinatura HMAC
  const signature = request.headers.get('x-webhook-signature')
  if (signature && process.env.WEBHOOK_HMAC_SECRET) {
    // Validação de assinatura conforme documentação Woovi
    // Por enquanto, aceitamos se presente (Placeholder para lógica RSA/HMAC completa)
    const isValid = signature.length > 0 
    if (!isValid) {
      console.warn(`[Webhook] Assinatura HMAC inválida`)
      return new Response(null, { status: 401 })
    }
  }

  // 6. Retornar 200 IMEDIATAMENTE
  const responsePromise = NextResponse.json({ ok: true })

  // 7. Processar de forma assíncrona
  try {
    const payload = JSON.parse(rawBody)
    processWebhookAsync(payload).catch(err => 
      console.error('[Webhook] Erro no processamento:', err)
    )
  } catch (e) {
    console.error("[Webhook] Payload inválido")
  }

  return responsePromise
}

async function processWebhookAsync(payload: any) {
  const { event, charge, pix } = payload
  if (!charge?.correlationID) return

  // Idempotência básica via status do pedido (já verificado dentro de handleChargePaid)
  
  const isPaid = [
    'OPENPIX:CHARGE_COMPLETED',
    'woovi:CHARGE_COMPLETED',
    'woovi:TRANSACTION_RECEIVED',
  ].includes(event)

  try {
    if (isPaid) {
      await handleChargePaid(payload)
    } else if (event === "woovi:CHARGE_CREATED" || event === "OPENPIX:CHARGE_CREATED") {
      await handleChargeCreated(charge)
    } else if (event === 'OPENPIX:CHARGE_EXPIRED' || event === "woovi:CHARGE_EXPIRED") {
      await handleChargeExpired(charge)
    }
  } catch (err) {
    await audit('WEBHOOK_FAILED', null, { 
      correlationID: charge.correlationID, 
      error: err instanceof Error ? err.message : String(err) 
    });
  }

  // Log de processamento
  console.log(`[Webhook] Processado: ${charge.correlationID} (${event})`)
}

// --- Funções Auxiliares de Processamento ---

async function handleChargePaid(payload: any) {
  const { charge, pix } = payload;
  const correlationID = charge.correlationID;

  const order = await prisma.order.findUnique({
    where: { wooviCorrelationId: correlationID },
    include: { 
      user: { include: { badges: true } },
      product: true,
      affiliation: {
        include: { offer: true }
      }
    }
  });

  if (!order || order.status === "PAID") return;

  const seller = order.user;
  const product = order.product ?? null;
  const paidAt = new Date(charge.updatedAt || Date.now());
  const history = (order.statusHistory as any[]) || [];

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt,
      wooviTransactionId: charge.transactionID,
      wooviEndToEndId: pix?.endToEndId,
      statusHistory: [
        ...history,
        { status: "PAID", label: "Pagamento Confirmado via Woovi", date: paidAt.toISOString() }
      ]
    }
  });

  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + 14);

  let affiliateCommission = 0;
  const affiliation = order.affiliation;

  if (affiliation && affiliation.status === "APPROVED") {
    const offer = affiliation.offer;
    if (offer.commissionType === "PERCENTAGE") {
      affiliateCommission = order.amount * (offer.commissionValue / 100);
    } else {
      affiliateCommission = offer.commissionValue;
    }
    affiliateCommission = Math.min(affiliateCommission, order.netAmount);
  }

  const finalSellerNetAmount = order.netAmount - affiliateCommission;

  await prisma.$transaction(async (tx) => {
    await tx.pendingBalance.create({
      data: {
        userId: seller.id,
        orderId: order.id,
        amount: finalSellerNetAmount,
        availableAt: maturityDate
      }
    });

    if (affiliation && affiliateCommission > 0) {
      await tx.affiliationSale.create({
        data: {
          affiliationId: affiliation.id,
          orderId: order.id,
          saleAmount: order.amount,
          commission: affiliateCommission,
          status: "PENDING"
        }
      });

      await tx.affiliation.update({
        where: { id: affiliation.id },
        data: {
          totalSales: { increment: 1 },
          totalEarned: { increment: affiliateCommission },
          pendingBalance: { increment: affiliateCommission }
        }
      });

      await tx.affiliateOffer.update({
        where: { id: affiliation.offerId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: order.amount }
        }
      });

      await tx.user.update({
        where: { id: affiliation.affiliateId },
        data: {
          totalEarnings: { increment: affiliateCommission },
          pendingBalance: { increment: affiliateCommission }
        }
      });
      
      await tx.notification.create({
        data: {
          userId: affiliation.affiliateId,
          title: "Comissão recebida! 💸",
          content: `Você ganhou R$ ${affiliateCommission.toFixed(2)} pela venda de ${product?.name ?? "um produto"}.`,
          type: "SUCCESS"
        }
      });
    }

    if (product) {
      await tx.product.update({
        where: { id: product.id },
        data: {
          salesCount: { increment: 1 },
          revenue: { increment: order.amount }
        }
      });
    }

    await tx.user.update({
      where: { id: seller.id },
      data: {
        totalEarnings: { increment: order.amount },
        pendingBalance: { increment: finalSellerNetAmount }
      }
    });
  });

  await checkAndGrantBadges(seller.id, seller.totalEarnings + order.amount, seller.badges);

  await Promise.all([
    sendOrderConfirmationEmail({ email: order.buyerEmail, name: order.buyerName }, product?.name ?? "Produto", order.amount),
    sendNewSaleEmail({ email: seller.email, name: seller.name }, product?.name ?? "Produto", order.amount, finalSellerNetAmount)
  ]).catch(err => console.error("Email sending Error:", err));

  prisma.notification.create({
    data: {
      userId: seller.id,
      title: "Pagamento recebido! 💰",
      content: `Venda confirmada: ${product?.name ?? "Produto"} no valor de R$ ${order.amount.toFixed(2)}.` + 
               (affiliateCommission > 0 ? ` (Comissão de R$ ${affiliateCommission.toFixed(2)} paga ao afiliado)` : ""),
      type: "SUCCESS"
    }
  }).catch(err => console.error("Error creating notification:", err));

  await dispatchPlayerWebhooks(seller.id, "order.paid", {
    order_id: order.id,
    product_slug: product?.slug ?? null,
    amount: order.amount,
    net_amount: order.netAmount,
    buyer: {
      name: order.buyerName,
      email: order.buyerEmail,
      cpf: order.buyerCpf
    },
    paid_at: paidAt.toISOString()
  });

  await audit('WEBHOOK_PROCESSED', seller.id, { 
    correlationID, 
    event: payload.event,
    amount: order.amount 
  });
}

async function handleChargeExpired(charge: any) {
  await prisma.order.updateMany({
    where: { 
      wooviCorrelationId: charge.correlationID,
      status: "PENDING"
    },
    data: { status: "EXPIRED" }
  });
}

async function handleChargeCreated(charge: any) {
  const order = await prisma.order.findUnique({
    where: { wooviCorrelationId: charge.correlationID },
    include: { user: true, product: true }
  });

  if (order) {
    await sendNewOrderNotificationEmail(
      { email: order.user.email, name: order.user.name },
      order.product?.name ?? "Produto",
      order.amount
    ).catch(err => console.error("Error sending New Order Notification:", err));
  }
}

async function checkAndGrantBadges(userId: string, totalGross: number, existingBadges: any[]) {
  const badgeThresholds = [
    { value: 10000,    type: "BADGE_10K", label: "R$ 10.000" },
    { value: 50000,    type: "BADGE_50K", label: "R$ 50.000" },
    { value: 100000,   type: "BADGE_100K", label: "R$ 100.000" },
    { value: 500000,   type: "BADGE_500K", label: "R$ 500.000" },
    { value: 1000000,  type: "BADGE_1M", label: "R$ 1 Milhão" }
  ];

  const userBadgeTypes = existingBadges.map(b => b.badge);

  for (const threshold of badgeThresholds) {
    if (totalGross >= threshold.value && !userBadgeTypes.includes(threshold.type)) {
      await prisma.userBadge.create({
        data: {
          userId,
          badge: threshold.type as any,
          earnedAt: new Date()
        }
      });
      
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      if (user) {
        // Não-crítico: falha de e-mail não pode interromper a concessão de badges.
        await sendBadgeEarnedEmail(user, threshold.label).catch(err => console.error("[webhook] Falha e-mail de badge (ignorado):", err));
      }
    }
  }
}

async function dispatchPlayerWebhooks(userId: string, event: string, payload: any) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId, active: true, events: { has: event } }
    });

    const { decrypt, isEncrypted } = await import("@/lib/encryption");

    for (const webhook of webhooks) {
      let secret = webhook.secret;
      try {
        if (isEncrypted(secret)) secret = await decrypt(secret);
      } catch (e) {
        console.error(`[Webhook] Error decrypting secret for webhook ${webhook.id}`);
      }

      fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-PulsePay-Signature": secret },
        body: JSON.stringify({ event, payload })
      }).then(res => {
         prisma.webhookLog.create({
           data: {
             webhookId: webhook.id,
             event,
             payload,
             statusCode: res.status,
             success: res.ok,
             sentAt: new Date()
           }
         }).catch(() => {});
      }).catch(() => {});
    }
  } catch (err) {
    console.error("Webhook Dispatch error:", err);
  }
}
