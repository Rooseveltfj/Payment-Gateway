import { prisma } from '@/lib/prisma'
import { audit } from './audit'

export async function detectSuspiciousActivity(userId: string | null, action: string, ip: string) {
  const window = new Date(Date.now() - 15 * 60 * 1000) // últimos 15 min

  // 1. Múltiplas falhas de login do mesmo IP
  if (action === 'USER_LOGIN_FAILED') {
    const failCount = await prisma.auditLog.count({
      where: {
        action: 'USER_LOGIN_FAILED',
        ipAddress: ip,
        createdAt: { gte: window }
      }
    })
    if (failCount >= 10) {
      await audit('SUSPICIOUS_ACTIVITY', null, {
        reason: 'Múltiplas falhas de login',
        ip,
        count: failCount
      })
      // Em um cenário real, poderíamos bloquear o IP via Redis ou tabela de banimentos
      return { blocked: true, reason: 'IP temporariamente bloqueado por excesso de tentativas.' }
    }
  }

  // Se não houver userId, não podemos fazer verificações baseadas em usuário
  if (!userId) return { blocked: false }

  // 2. Múltiplas tentativas de saque em sequência
  if (action === 'WITHDRAWAL_REQUESTED') {
    const withdrawalCount = await prisma.auditLog.count({
      where: {
        action: 'WITHDRAWAL_REQUESTED',
        userId,
        createdAt: { gte: window }
      }
    })
    if (withdrawalCount >= 3) {
      await audit('SUSPICIOUS_ACTIVITY', userId, {
        reason: 'Múltiplas solicitações de saque em curto intervalo',
        count: withdrawalCount
      })
      return { blocked: true, reason: 'Limite de saques atingido. Contate o suporte para liberar.' }
    }
  }

  // 3. IP diferente do último login + ação sensível
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastLoginIp: true, email: true, name: true }
  })
  
  const sensitiveActions = ['WITHDRAWAL_REQUESTED', 'API_KEY_CREATED', 'PASSWORD_CHANGED']
  if (user?.lastLoginIp && user.lastLoginIp !== ip && sensitiveActions.includes(action)) {
    await audit('SUSPICIOUS_ACTIVITY', userId, {
      reason: 'Ação sensível de IP diferente do último login',
      lastIp: user.lastLoginIp,
      currentIp: ip,
      action
    })
    
    // Aqui poderíamos enviar um email de alerta para o usuário
    // sendSecurityAlertEmail(user.email, action, ip)
  }

  return { blocked: false }
}
