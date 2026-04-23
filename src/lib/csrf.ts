import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-csrf'

export function generateCsrfToken(): string {
  const random = randomBytes(32).toString('hex')
  const hash = createHmac('sha256', SECRET).update(random).digest('hex')
  return `${random}.${hash}`
}

export function validateCsrfToken(token: string): boolean {
  if (!token) return false
  const [random, hash] = token.split('.')
  if (!random || !hash) return false
  
  const expected = createHmac('sha256', SECRET).update(random).digest('hex')
  
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(hash))
  } catch (e) {
    return false
  }
}
