import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Fallback em memória se Upstash não estiver configurado
const createRateLimiter = (requests: number, window: string) => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(requests, window as any),
      })
    } catch (e) {
      console.error('Failed to initialize Upstash Redis:', e)
    }
  }
  
  // Fallback: Map em memória (não persiste entre deploys, mas protege)
  const map = new Map<string, { count: number; reset: number }>()
  return {
    limit: async (key: string) => {
      const now = Date.now()
      // Simple window parsing (e.g., '15m', '1m', '60m')
      const unit = window.slice(-1)
      const value = parseInt(window.slice(0, -1))
      const windowMs = value * (unit === 'm' ? 60000 : unit === 'h' ? 3600000 : 1000)
      
      const entry = map.get(key)
      if (!entry || entry.reset < now) {
        map.set(key, { count: 1, reset: now + windowMs })
        return { success: true }
      }
      if (entry.count >= requests) return { success: false }
      entry.count++
      return { success: true }
    }
  }
}

export const rateLimits = {
  // Autenticação: 5 tentativas por 15 minutos por IP
  auth: createRateLimiter(5, '15m'),
  // Criação de pedidos: 10 por minuto por IP
  checkout: createRateLimiter(10, '1m'),
  // Webhook da Woovi: 100 por minuto (volume real)
  webhook: createRateLimiter(100, '1m'),
  // API pública dos players: 60 por minuto por key
  api: createRateLimiter(60, '1m'),
  // Reset de senha: 3 por hora por email
  passwordReset: createRateLimiter(3, '60m'),
  // KYC submit: 3 por hora por user
  kyc: createRateLimiter(3, '60m'),
}
