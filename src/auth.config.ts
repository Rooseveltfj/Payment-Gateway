import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
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
