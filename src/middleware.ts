import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
  const { nextUrl } = req
  const isLogged = !!req.auth
  const hostname = req.headers.get("host") || ""
  
  // 1. Security Headers
  const requestHeaders = new Headers(req.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // CSP, HSTS, etc.
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

  // 2. Custom Domain Routing
  const isMainDomain = 
    hostname.includes("pulsepay.com.br") || 
    hostname.includes("localhost") || 
    hostname.includes("vercel.app")

  if (!isMainDomain) {
    try {
      const res = await fetch(`${nextUrl.origin}/api/domains/lookup?domain=${hostname}`)
      const data = await res.json()

      if (data.active && data.username) {
        const path = nextUrl.pathname
        if (path === "/") {
          return NextResponse.rewrite(new URL(`/${data.username}`, req.url))
        }
        if (!path.startsWith("/api") && !path.startsWith("/_next") && !path.includes(".")) {
          if (path.startsWith("/obrigado")) return NextResponse.next()
          return NextResponse.rewrite(new URL(`/c${path}`, req.url))
        }
      }
    } catch (e) { console.error(e) }
  }

  // 3. Auth Protection
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")

  if (isAdminRoute) {
    if (!isLogged) return NextResponse.redirect(new URL("/login", nextUrl))
    const user = req.auth?.user as { role?: string } | undefined
    if (user?.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  if (isDashboardRoute && !isLogged) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // 4. Affiliation Tracking
  const affiliateRef = nextUrl.searchParams.get("ref")
  if (nextUrl.pathname.startsWith("/c/") && affiliateRef) {
    response.cookies.set("pulsepay_affiliate", affiliateRef, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  }

  return response
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
