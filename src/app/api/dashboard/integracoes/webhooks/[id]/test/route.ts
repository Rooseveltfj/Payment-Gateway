import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signPayload } from "@/lib/webhook";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const webhook = await prisma.webhook.findFirst({ where: { id: params.id, userId } });
  if (!webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });

  const testPayload = {
    event: "order.paid",
    timestamp: new Date().toISOString(),
    data: {
      order_id: "test_" + Math.random().toString(36).slice(2, 10),
      product_id: "prod_test123",
      amount: 97.0,
      net_amount: 87.33,
      buyer: { name: "João Test", email: "test@example.com", cpf: "000.000.000-00" },
      payment_method: "PIX",
      paid_at: new Date().toISOString(),
    },
  };

  const body = JSON.stringify(testPayload);
  const signature = signPayload(body, webhook.secret);

  let success = false;
  let statusCode: number | null = null;
  let responseBody = "";

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PulsePay-Signature": signature,
        "X-PulsePay-Event": "order.paid",
        "User-Agent": "PulsePay-Webhooks/1.0 (test)",
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    statusCode = res.status;
    responseBody = await res.text().catch(() => "");
    success = res.ok;
  } catch (err) {
    responseBody = String(err);
  }

  await prisma.webhookLog.create({
    data: {
      webhookId: webhook.id,
      event: "order.paid",
      payload: testPayload as object,
      statusCode,
      response: responseBody.substring(0, 500),
      success,
    },
  });

  return NextResponse.json({ success, statusCode, response: responseBody.substring(0, 200) });
}
