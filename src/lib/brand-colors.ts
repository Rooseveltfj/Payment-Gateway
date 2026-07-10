// Cores de MARCA de terceiros. NÃO são tokens de tema do checkout — são
// identidades fixas (WhatsApp, etc.) e nunca mudam com o template escolhido.
// Mantidas fora dos componentes de render para que estes fiquem 100% dirigidos
// por var(--checkout-*), sem cor hardcoded.
export const BRAND = {
  whatsapp: "#25D366",
} as const;
