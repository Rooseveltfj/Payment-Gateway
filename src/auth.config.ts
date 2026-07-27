import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
    // Definição edge-safe do Google (só clientId/secret via env). Toda a lógica
    // de banco (criar/rejeitar usuário, enriquecer o token) vive em src/lib/auth.ts.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user && "role" in user) {
        token.role = user.role as string;
        token.kycStatus = (user as any).kycStatus;
      }
      
      // Allow manual updates to the session (like when KYC document is uploaded)
      if (trigger === "update" && session?.kycStatus) {
        token.kycStatus = session.kycStatus;
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        Object.assign(session.user, { role: token.role, kycStatus: token.kycStatus })
      }
      return session
    },
  },
} satisfies NextAuthConfig
