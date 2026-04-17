import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendNewSaleEmail, sendBadgeEarnedEmail, sendNewOrderNotificationEmail } from "@/lib/email";

/**
 * Woovi Webhook Handler
 * Endpoint: /api/webhooks/woovi
 * 
 * To solve the "status 200" requirement, this route always returns a success code 
 * quickly, while processing the payment event asynchronously or within the request.
 */

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";

    // 1. Validation (MVP-friendly as requested)
    if (!signature || signature.length === 0) {
      console.warn("[Webhook] Missing x-webhook-signature header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, charge, pix } = payload;

    // 2. Ignore tests or invalid payloads
    if (!charge?.correlationID) {
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Payment Confirmation
    const isPaid = [
      "OPENPIX:CHARGE_COMPLETED",
      "woovi:CHARGE_COMPLETED",
      "woovi:TRANSACTION_RECEIVED",
    ].includes(event);

    if (isPaid) {
      console.log(`[Webhook] Payment Confirmed: ${charge?.correlationID} (${event})`);
      await handleChargePaid(payload);
    } else if (event === "woovi:CHARGE_CREATED" || event === "OPENPIX:CHARGE_CREATED") {
      console.log(`[Webhook] Charge Created: ${charge?.correlationID}`);
      await handleChargeCreated(charge);
    } else if (event === "OPENPIX:CHARGE_EXPIRED" || event === "woovi:CHARGE_EXPIRED") {
      console.log(`[Webhook] Charge Expired: ${charge?.correlationID}`);
      await handleChargeExpired(charge);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    // Still return 200 to Woovi to avoid retries on failure during processing
    return NextResponse.json({ ok: true });
  }
}

async function handleChargePaid(payload: any) {
  const { charge, pix } = payload;
  const correlationID = charge.correlationID;

  // 1. Find Order
  const order = await prisma.order.findUnique({
    where: { wooviCorrelationId: correlationID },
    include: { 
      user: { include: { badges: true } },
      product: true 
    }
  });

  if (!order || order.status === "PAID") return;

  const seller = order.user;
  const product = order.product;

  // 2. Update Order Status
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

  // 3. Financial Logic & Maturity
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + 14);

  await prisma.$transaction([
    // Create Pending Balance
    prisma.pendingBalance.create({
      data: {
        userId: seller.id,
        orderId: order.id,
        amount: order.netAmount,
        availableAt: maturityDate
      }
    }),
    // Update Product Stats
    prisma.product.update({
      where: { id: product.id },
      data: {
        salesCount: { increment: 1 },
        revenue: { increment: order.amount }
      }
    }),
    // Update User cumulative earnings (Gross for badges as per user request)
    prisma.user.update({
      where: { id: seller.id },
      data: {
        totalEarnings: { increment: order.amount },
        pendingBalance: { increment: order.netAmount }
      }
    })
  ]);

  // 4. Badge Logic (Gross Amount)
  await checkAndGrantBadges(seller.id, seller.totalEarnings + order.amount, seller.badges);

  // 5. Emails
  await Promise.all([
    sendOrderConfirmationEmail({ email: order.buyerEmail, name: order.buyerName }, product.name, order.amount),
    sendNewSaleEmail({ email: seller.email, name: seller.name }, product.name, order.amount, order.netAmount)
  ]).catch(err => console.error("Email sending Error:", err));

  // 6. Player Webhooks Output (Optional robustness)
  await dispatchPlayerWebhooks(seller.id, "order.paid", {
    order_id: order.id,
    product_slug: product.slug,
    amount: order.amount,
    net_amount: order.netAmount,
    buyer: {
      name: order.buyerName,
      email: order.buyerEmail,
      cpf: order.buyerCpf
    },
    paid_at: paidAt.toISOString()
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
        await sendBadgeEarnedEmail(user, threshold.label);
      }
    }
  }
}

async function dispatchPlayerWebhooks(userId: string, event: string, payload: any) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId, active: true, events: { has: event } }
    });

    for (const webhook of webhooks) {
      // Basic robust delivery
      fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-PulsePay-Signature": webhook.secret },
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

async function handleChargeCreated(charge: any) {
  const order = await prisma.order.findUnique({
    where: { wooviCorrelationId: charge.correlationID },
    include: { user: true, product: true }
  });

  if (order) {
    await sendNewOrderNotificationEmail(
      { email: order.user.email, name: order.user.name },
      order.product.name,
      order.amount
    ).catch(err => console.error("Error sending New Order Notification:", err));
  }
}
