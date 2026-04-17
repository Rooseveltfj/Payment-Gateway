import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generates a random 6-digit numeric code.
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hashes a code using SHA-256 for secure storage.
 */
export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Generates and stores a new 2FA token for a given email.
 * If a token already exists, it is overwritten.
 */
export async function generateTwoFactorToken(email: string) {
  const code = generateVerificationCode();
  const hashedToken = hashCode(code);
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes

  // Delete existing token if any
  const existingToken = await prisma.twoFactorToken.findUnique({
    where: { email }
  });

  if (existingToken) {
    await prisma.twoFactorToken.delete({
      where: { id: existingToken.id }
    });
  }

  const twoFactorToken = await prisma.twoFactorToken.create({
    data: {
      email,
      token: hashedToken,
      expires,
    }
  });

  return { ...twoFactorToken, code }; // Return the raw code to send by email
}

/**
 * Validates a code against the hashed token in the database.
 * Handles expiry and attempt tracking.
 */
export async function validateTwoFactorToken(email: string, code: string) {
  const hashedCode = hashCode(code);
  
  const existingToken = await prisma.twoFactorToken.findUnique({
    where: { email }
  });

  if (!existingToken) {
    return { success: false, error: "Token não encontrado. Solicite um novo código." };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { success: false, error: "Código expirado. Solicite um novo código." };
  }

  if (existingToken.attempts >= 3) {
    return { success: false, error: "Muitas tentativas. Solicite um novo código." };
  }

  if (existingToken.token !== hashedCode) {
    // Increment attempts
    await prisma.twoFactorToken.update({
      where: { id: existingToken.id },
      data: { attempts: { increment: 1 } }
    });
    return { success: false, error: "Código inválido." };
  }

  // Success: Delete token after use
  await prisma.twoFactorToken.delete({
    where: { id: existingToken.id }
  });

  return { success: true };
}

/**
 * Generates a secure random token for password reset.
 * Valid for 1 hour.
 */
export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id }
    });
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return passwordResetToken;
}
