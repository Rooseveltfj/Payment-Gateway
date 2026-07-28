// ============================================================
// Feature flags — pagamentos/Woovi DESATIVADOS por enquanto.
// A integração Woovi foi mantida no código, apenas desligada. Para RELIGAR
// quando reintegrar o provedor de pagamento, defina as envs como "true":
//   WOOVI_ENABLED=true                 (servidor — rotas de PIX/webhook/refund)
//   NEXT_PUBLIC_PAYMENTS_ENABLED=true  (cliente — seção de pagamento do checkout)
// ============================================================

/** Servidor: habilita as chamadas à API Woovi (geração de PIX, webhook, refund). */
export const WOOVI_ENABLED = process.env.WOOVI_ENABLED === "true";

/** Cliente: habilita a seção de pagamento na página pública de checkout. */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
