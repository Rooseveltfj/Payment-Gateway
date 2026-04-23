import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'

type AuditAction =
  | 'USER_LOGIN' | 'USER_LOGIN_FAILED' | 'USER_LOGOUT'
  | 'USER_REGISTERED' | 'PASSWORD_CHANGED' | 'PASSWORD_RESET_REQUESTED'
  | '2FA_ENABLED' | '2FA_DISABLED' | '2FA_FAILED'
  | 'KYC_SUBMITTED' | 'KYC_APPROVED' | 'KYC_REJECTED'
  | 'PRODUCT_CREATED' | 'PRODUCT_UPDATED' | 'PRODUCT_DELETED'
  | 'ORDER_CREATED' | 'ORDER_PAID' | 'ORDER_REFUNDED'
  | 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED'
  | 'API_KEY_CREATED' | 'API_KEY_REVOKED'
  | 'WEBHOOK_CREATED' | 'WEBHOOK_DELETED'
  | 'WEBHOOK_PROCESSED' | 'WEBHOOK_FAILED'
  | 'ADMIN_USER_SUSPENDED' | 'ADMIN_USER_ACTIVATED' | 'ADMIN_FEE_CHANGED'
  | 'SUSPICIOUS_ACTIVITY'

export async function audit(
  action: AuditAction,
  userId: string | null,
  metadata: Record<string, any> = {},
  request?: Request
) {
  const ip = request?.headers.get('x-forwarded-for')?.split(',')[0] ?? 'server'
  const ua = request?.headers.get('user-agent') ?? 'unknown'

  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId || undefined, // Prisma CUID requires a string or undefined for nullable relations
        ipAddress: ip,
        userAgent: ua,
        metadata: metadata,
        createdAt: new Date(),
      }
    })
  } catch (err) {
    console.error('[Audit] Falha ao registrar:', err)
  }

  // Alertas automáticos para ações críticas
  const criticalActions: AuditAction[] = [
    'USER_LOGIN_FAILED', '2FA_FAILED', 'SUSPICIOUS_ACTIVITY',
    'ADMIN_USER_SUSPENDED', 'WITHDRAWAL_REQUESTED'
  ]
  
  if (criticalActions.includes(action)) {
    await triggerSecurityAlert(action, userId, metadata, ip)
  }
}

async function triggerSecurityAlert(
  action: string,
  userId: string | null,
  metadata: any,
  ip: string
) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL
  if (!adminEmail) return

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h2 style="color: #d32f2f;">🚨 Alerta de Segurança [PulsePay]</h2>
      <p><strong>Ação:</strong> ${action}</p>
      <p><strong>Usuário:</strong> ${userId ?? 'Anônimo'}</p>
      <p><strong>IP:</strong> ${ip}</p>
      <p><strong>Data:</strong> ${new Date().toISOString()}</p>
      <hr />
      <p><strong>Detalhes:</strong></p>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${JSON.stringify(metadata, null, 2)}</pre>
    </div>
  `

  await sendEmail({
    to: adminEmail,
    subject: `🚨 [Security Alert] ${action}`,
    html: html
  })
}
