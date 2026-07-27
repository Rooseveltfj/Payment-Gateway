import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import authConfig from "@/auth.config"
import { isIpTrusted, trustIp } from "./auth-security"
import { headers } from "next/headers"
import { validateTwoFactorToken } from "./tokens"
import speakeasy from "speakeasy"

import { audit } from "./audit"
import { detectSuspiciousActivity } from "./security-monitor"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  // Merge explícito: preserva os callbacks edge de auth.config.ts (session + jwt
  // de credenciais) e adiciona a lógica de banco do Google (Node runtime).
  callbacks: {
    ...authConfig.callbacks,
    // Só atua no Google; credenciais passam direto (fluxo intacto).
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      // Só cria se o Google confirmou o e-mail.
      if (!(profile as { email_verified?: boolean } | undefined)?.email_verified) {
        return "/login?error=google_unverified";
      }
      const email = user.email;
      if (!email) return "/login?error=google_unverified";

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        // Regra: e-mail já existe (com senha) → não vincular, não logar.
        return "/login?error=email_exists";
      }

      // Senha aleatória segura (nunca exibida/reutilizável) — User.password é NOT NULL.
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      const created = await prisma.user.create({
        data: {
          name: user.name || (profile as { name?: string } | undefined)?.name || "Usuário",
          email,
          password: randomPassword,
          role: "USER",       // NUNCA vem do provider
          status: "ACTIVE",   // Google já verificou o e-mail (não passa por TwoFactorToken)
          avatarUrl: (profile as { picture?: string } | undefined)?.picture ?? null,
        },
      });
      await audit("USER_REGISTERED", created.id, { email, name: created.name, via: "google" }, undefined);
      return true;
    },
    // Enriquecimento em Node: o jwt edge (auth.config.ts) não pode tocar o Prisma.
    // No 1º sign-in Google, corrige token.sub p/ o id do banco e injeta role/kycStatus.
    async jwt(params) {
      const token = await authConfig.callbacks!.jwt!(params);
      const { account, user } = params as { account?: { provider?: string }; user?: { email?: string | null } };
      if (account?.provider === "google" && user?.email) {
        const db = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true, kycStatus: true },
        });
        if (db) {
          token.sub = db.id;
          (token as { role?: string }).role = db.role;
          (token as { kycStatus?: string }).kycStatus = db.kycStatus;
        }
      }
      return token;
    },
  },
  events: {
    signIn: async ({ user }) => {
      const head = headers();
      const ip = head.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
      
      // Update login stats
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginIp: ip,
          lastLoginAt: new Date(),
          failedLoginCount: 0,
          lockedUntil: null
        }
      }).catch(e => console.error("Error updating user login stats:", e));

      await audit('USER_LOGIN', user.id!, {}, undefined); // We don't have the original request object here easily
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const head = headers();
        const ip = head.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          await audit('USER_LOGIN_FAILED', null, { email: credentials.email as string }, undefined);
          return null
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordsMatch) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: { increment: 1 } }
          });

          await audit('USER_LOGIN_FAILED', user.id, { email: user.email }, undefined);
          
          const suspicion = await detectSuspiciousActivity(user.id, 'USER_LOGIN_FAILED', ip);
          if (suspicion.blocked) {
             // Lock account if multiple failures
             await prisma.user.update({
               where: { id: user.id },
               data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } // 15 min
             });
             throw new Error("TOO_MANY_ATTEMPTS");
          }

          return null
        }

        if (passwordsMatch) {
          if (user.status === "PENDING") {
            throw new Error("UNVERIFIED_EMAIL")
          }

          // 2FA Logic with IP Trust
          if (user.twoFactorEnabled) {
            const userAgent = head.get("user-agent") || undefined;
            
            const trusted = await isIpTrusted(user.id, ip);
            
            if (!trusted) {
              const code = credentials.code as string;
              
              if (!code) {
                 throw new Error("2FA_REQUIRED");
              }

              // Verify code based on method
              if (user.twoFactorMethod === "TOTP" && user.twoFactorSecret) {
                const verified = speakeasy.totp.verify({
                  secret: user.twoFactorSecret,
                  encoding: "base32",
                  token: code,
                  window: 1
                });
                if (!verified) {
                  await audit('2FA_FAILED', user.id, { method: "TOTP" }, undefined);
                  throw new Error("INVALID_2FA_CODE");
                }
              } 
              else if (user.twoFactorMethod === "EMAIL") {
                const result = await validateTwoFactorToken(user.email, code);
                if (!result.success) {
                  await audit('2FA_FAILED', user.id, { method: "EMAIL" }, undefined);
                  throw new Error("INVALID_2FA_CODE");
                }
              }

              // Verification success: Trust this IP
              await trustIp(user.id, ip, userAgent);
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            kycStatus: user.kycStatus,
            avatarUrl: user.avatarUrl,
          }
        }

        return null
      },
    }),
    // Reinclui o Google definido em auth.config.ts (o override de `providers`
    // acima descartaria authConfig.providers). Google fica definido em 1 lugar só.
    ...authConfig.providers.filter((p) => (p as { id?: string }).id !== "credentials"),
  ],
})
