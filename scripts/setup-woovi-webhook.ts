const WOOVI_APP_ID = process.env.WOOVI_APP_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.pulsepay.com.br";
const WEBHOOK_AUTH = process.env.WOOVI_WEBHOOK_AUTH || "";

async function setupWebhook() {
  if (!WOOVI_APP_ID) {
    console.error("❌ WOOVI_APP_ID is not defined in .env");
    process.exit(1);
  }

  console.log("🚀 Registering Woovi Webhook for PulsePay...");
  console.log(`📡 URL: ${APP_URL}/api/webhooks/woovi`);

  try {
    const response = await fetch("https://api.woovi.com/api/openpix/v1/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": WOOVI_APP_ID,
      },
      body: JSON.stringify({
        webhook: {
          name: "PulsePay - Pagamentos Realtime",
          url: `${APP_URL}/api/webhooks/woovi`,
          authorization: WEBHOOK_AUTH,
          isActive: true,
          // Note: To add multiple events (EXPIRED, etc.), 
          // they usually need to be selected in the Woovi Dashboard.
          // This creates the base webhook.
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Webhook registered successfully!");
      console.log("📄 Response:", JSON.stringify(data, null, 2));
    } else {
      console.error("❌ Failed to register webhook.");
      console.error("📄 Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

setupWebhook();
