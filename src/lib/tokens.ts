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

import { encrypt, decrypt, isEncrypted, hashApiKey } from "@/lib/encryption";

/**
 * Generates and stores a new 2FA token for a given email.
 * If a token already exists, it is overwritten.
 */
export async function generateTwoFactorToken(email: string) {
  const code = generateVerificationCode();
  const encryptedToken = await encrypt(code);
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
      token: encryptedToken,
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

  let isValid = false;
  try {
    if (isEncrypted(existingToken.token)) {
      const decrypted = await decrypt(existingToken.token);
      isValid = decrypted === code;
    } else {
      // Legacy hash check
      isValid = hashCode(code) === existingToken.token;
    }
  } catch (e) {
    isValid = false;
  }

  if (!isValid) {
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
  const rawToken = crypto.randomUUID();
  const encryptedToken = await encrypt(rawToken);
  const tokenHash = hashApiKey(rawToken); // reusing hashApiKey for generic token hashing
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
      token: encryptedToken,
      tokenHash: tokenHash,
      expires
    }
  });

  return { ...passwordResetToken, token: rawToken };
}
