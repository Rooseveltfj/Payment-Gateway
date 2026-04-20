import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import authConfig from "@/auth.config"
import { isIpTrusted, trustIp } from "./auth-security"
import { headers } from "next/headers"
import { validateTwoFactorToken } from "./tokens"
import speakeasy from "speakeasy"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          if (user.status === "PENDING") {
            throw new Error("UNVERIFIED_EMAIL")
          }

          // 2FA Logic with IP Trust
          if (user.twoFactorEnabled) {
            const head = headers();
            const ip = head.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
            const userAgent = head.get("user-agent") || undefined;
            
            const trusted = await isIpTrusted(user.id, ip);
            
            if (!trusted) {
              const code = credentials.code as string;
              
              if (!code) {
                 // Trigger code sending if method is EMAIL
                 // (We could do it here or in a separate API call from frontend)
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
                if (!verified) throw new Error("INVALID_2FA_CODE");
              } 
              else if (user.twoFactorMethod === "EMAIL") {
                const result = await validateTwoFactorToken(user.email, code);
                if (!result.success) throw new Error("INVALID_2FA_CODE");
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
  ],
})
