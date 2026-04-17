import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export type WebhookEvent =
  | "order.created"
  | "order.paid"
  | "order.failed"
  | "order.refunded"
  | "order.chargeback"
  | "withdrawal.requested"
  | "withdrawal.completed"
  | "withdrawal.failed";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

function signPayload(payload: string, secret: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  payload: WebhookPayload,
  attempt: number = 1
): Promise<void> {
  const body = JSON.stringify(payload);
  const signature = signPayload(body, secret);

  let success = false;
  let statusCode: number | null = null;
  let responseBody = "";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PulsePay-Signature": signature,
        "X-PulsePay-Event": payload.event,
        "User-Agent": "PulsePay-Webhooks/1.0",
      },
      body,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    statusCode = res.status;
    responseBody = await res.text().catch(() => "");
    success = res.ok;
  } catch (err) {
    responseBody = String(err);
    success = false;
  }

  // Log the attempt
  await prisma.webhookLog.create({
    data: {
      webhookId,
      event: payload.event,
      payload: payload as object,
      statusCode,
      response: responseBody.substring(0, 500),
      success,
    },
  });

  // Retry logic with exponential backoff (1min, 5min, 30min)
  if (!success && attempt < 3) {
    const delays = [60_000, 300_000, 1_800_000];
    const delay = delays[attempt - 1] ?? 60_000;
    setTimeout(() => {
      deliverWebhook(webhookId, url, secret, payload, attempt + 1);
    }, delay);
  }
}

/**
 * Dispatch a webhook event to all active webhooks for a user.
 * Call this from payment confirmation, withdrawal status changes, etc.
 */
export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      userId,
      active: true,
      events: { has: event },
    },
  });

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  for (const webhook of webhooks) {
    // Fire and forget (don't await to avoid blocking the request)
    deliverWebhook(webhook.id, webhook.url, webhook.secret, payload).catch(console.error);
  }
}

export { signPayload };
