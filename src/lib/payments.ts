// ============================================================
// Black Gate — Payment Adapters (Woovi & PagarMe)
// ============================================================

export interface PixChargeResponse {
  id: string;
  qrCode: string;
  copyPaste: string;
}

export interface CardChargeResponse {
  id: string;
  status: "paid" | "failed" | "pending";
}

export interface BoletoChargeResponse {
  id: string;
  url: string;
  barcode: string;
}

// ─── Woovi Adapter (PIX) ───────────────────────────────────
export async function createWooviPixCharge(amount: number, orderId: string): Promise<PixChargeResponse> {
  const appId = process.env.WOOVI_APP_ID;
  console.log(`Creating Woovi charge for order ${orderId} amount ${amount}`);
  
  if (!appId || appId === "mock") {
    return {
      id: `woovi_${orderId}`,
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=blackgate_mock_pix_payload",
      copyPaste: "00020101021226850014br.gov.bcb.pix0121blackgate_mock_payload52040000530398654041.005802BR5913BLACKGATE_CORP6009SAO_PAULO62070503***6304EFA1"
    };
  }

  return { id: "...", qrCode: "...", copyPaste: "..." };
}

// ─── PagarMe Adapter (Card/Boleto) ─────────────────────────
export async function createPagarMeCardCharge(amount: number, orderId: string, cardToken: string): Promise<CardChargeResponse> {
  const apiKey = process.env.PAGARME_API_KEY;
  console.log(`Processing card for order ${orderId} amount ${amount} token ${cardToken.substring(0, 5)}...`);

  if (!apiKey || apiKey === "mock") {
    return { id: `pagarme_${orderId}`, status: "paid" };
  }

  return { id: "...", status: "paid" };
}

export async function createPagarMeBoletoCharge(amount: number, orderId: string): Promise<BoletoChargeResponse> {
  const apiKey = process.env.PAGARME_API_KEY;
  console.log(`Creating boleto for order ${orderId} amount ${amount}`);

  if (!apiKey || apiKey === "mock") {
    return {
      id: `pagarme_boleto_${orderId}`,
      url: "https://www.google.com",
      barcode: "00190.50095 40144.816069 06809.350314 3 37370000000100"
    };
  }

  return { id: "...", url: "...", barcode: "..." };
}
