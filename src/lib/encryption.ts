import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

/**
 * ENCRYPTION_KEY deve ter 32 bytes (64 chars hex)
 * Gerar: openssl rand -hex 32
 */
const getKey = async (): Promise<Buffer> => {
  const keyHex = process.env.ENCRYPTION_KEY
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY inválida — deve ter 64 chars hex')
  }
  return Buffer.from(keyHex, 'hex')
}

export async function encrypt(text: string): Promise<string> {
  const key = await getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  
  // Formato: iv:authTag:ciphertext (todos em hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export async function decrypt(encryptedText: string): Promise<string> {
  const key = await getKey()
  const [ivHex, authTagHex, ciphertextHex] = encryptedText.split(':')
  
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error('Formato de texto criptografado inválido')
  }
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  
  return decipher.update(ciphertext) + decipher.final('utf8')
}

/**
 * Verificar se string já está criptografada (para migração)
 */
export function isEncrypted(text: string): boolean {
  return /^[a-f0-9]{32}:[a-f0-9]{32}:[a-f0-9]+$/.test(text)
}

/**
 * Hash one-way (para ApiKey — permite comparação sem descriptografar)
 */
export function hashApiKey(key: string): string {
  const { createHash } = require('crypto')
  // Usamos a ENCRYPTION_KEY como salt para o hash SHA-256
  return createHash('sha256').update(key + (process.env.ENCRYPTION_KEY || '')).digest('hex')
}
