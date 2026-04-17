import { sendEmail } from "./mail";
import { 
  getWelcomeEmailTemplate, 
  getOrderConfirmationTemplate, 
  getNewSaleTemplate, 
  getKycApprovedTemplate,
  getBadgeEarnedTemplate,
  getPixGeneratedTemplate,
  getNewOrderGeneratedTemplate
} from "./email-templates";

/**
 * PulsePay Transactional Email Helpers
 * Centralizes all Resend-based notifications.
 */

export async function sendWelcomeEmail(user: { email: string; name: string }) {
  return sendEmail({
    to: user.email,
    subject: "Bem-vindo à Elite PulsePay 🚀",
    html: getWelcomeEmailTemplate(user.name),
  });
}

export async function sendOrderConfirmationEmail(
  buyer: { email: string; name: string }, 
  productName: string, 
  amount: number
) {
  return sendEmail({
    to: buyer.email,
    subject: "Sua compra foi confirmada! ✅",
    html: getOrderConfirmationTemplate(buyer.name, productName, amount),
  });
}

export async function sendNewSaleEmail(
  user: { email: string; name: string }, 
  productName: string, 
  amount: number, 
  netAmount: number
) {
  return sendEmail({
    to: user.email,
    subject: `🎉 Nova venda realizada! R$ ${netAmount.toFixed(2).replace('.', ',')}`,
    html: getNewSaleTemplate(user.name, productName, amount, netAmount),
  });
}

export async function sendKycApprovedEmail(user: { email: string; name: string }) {
  return sendEmail({
    to: user.email,
    subject: "Seu KYC foi aprovado! 💎",
    html: getKycApprovedTemplate(user.name),
  });
}

export async function sendBadgeEarnedEmail(user: { email: string; name: string }, badgeLabel: string) {
  return sendEmail({
    to: user.email,
    subject: `🏆 Nova conquista: Plaquinha de ${badgeLabel}!`,
    html: getBadgeEarnedTemplate(user.name, badgeLabel),
  });
}

export async function sendPixGeneratedEmail(
  to: { email: string; name: string },
  productName: string,
  amount: number,
  brCode: string,
  qrCodeUrl: string
) {
  return sendEmail({
    to: to.email,
    subject: `Seu PIX para ${productName} está pronto! ⚡`,
    html: getPixGeneratedTemplate(to.name, productName, amount, brCode, qrCodeUrl),
  });
}
export async function sendNewOrderNotificationEmail(user: { email: string; name: string }, productName: string, amount: number) {
  return sendEmail({
    to: user.email,
    subject: `🔥 Novo interesse: ${productName}`,
    html: getNewOrderGeneratedTemplate(user.name, productName, amount),
  });
}
