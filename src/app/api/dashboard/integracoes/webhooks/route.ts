import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const webhooks = await prisma.webhook.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const { decrypt, isEncrypted } = await import("@/lib/encryption");

  const formattedWebhooks = await Promise.all(webhooks.map(async (w) => {
    let plainSecret = w.secret;
    try {
      if (isEncrypted(w.secret)) plainSecret = await decrypt(w.secret);
    } catch (e) {
      plainSecret = "Error decrypting";
    }
    return { ...w, secret: plainSecret };
  }));

  return NextResponse.json(formattedWebhooks);
}

import { validateCsrfToken } from "@/lib/csrf";
import { encrypt } from "@/lib/encryption";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  // CSRF Validation
  const csrfToken = request.headers.get("X-CSRF-Token");
  if (!csrfToken || !validateCsrfToken(csrfToken)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { url, events } = await request.json();
  if (!url || !events?.length) {
    return NextResponse.json({ error: "url and events are required" }, { status: 400 });
  }

  const rawSecret = "whs_" + crypto.randomBytes(20).toString("hex");
  const encryptedSecret = await encrypt(rawSecret);

  const webhook = await prisma.webhook.create({
    data: {
      userId: userId!,
      url,
      events,
      secret: encryptedSecret,
    },
  });

  return NextResponse.json({ ...webhook, secret: rawSecret }); // Return plaintext once
}
