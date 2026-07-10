import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname
  const isLogged = !!req.auth
  const hostname = req.headers.get("host") || ""
  
  // ── 1. SECURITY HEADERS ───────────────────────────────────────────
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.simpleicons.org",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: https://api.dicebear.com https://cdn.simpleicons.org",
      "media-src 'self' blob: data: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co https://api.woovi.com",
      // VSL: permite embutir players do YouTube/Vimeo (checkout)
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  // ── 2. BLOQUEAR ACESSO DIRETO AO SUPABASE VIA BROWSER ───────────
  if (pathname.startsWith('/api/') && req.headers.get('origin') === null) {
    const ua = req.headers.get('user-agent') || ''
    const blockedUAs = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab']
    if (blockedUAs.some(b => ua.toLowerCase().includes(b))) {
      return new NextResponse(null, { status: 403 })
    }
  }

  // ── 3. BLOQUEAR ROTAS INTERNAS DE CRON ──────────────────────────
  if (pathname.startsWith('/api/cron/')) {
    const authHeader = req.headers.get('authorization')
    const expectedSecret = `Bearer ${process.env.INTERNAL_API_SECRET}`
    if (authHeader !== expectedSecret) {
      return new NextResponse(null, { status: 401 })
    }
  }

  // ── 4. CUSTOM DOMAIN ROUTING ─────────────────────────────────────
  const isMainDomain = 
    hostname.includes("pulsepay.com.br") || 
    hostname.includes("localhost") || 
    hostname.includes("vercel.app")

  if (!isMainDomain) {
    try {
      const res = await fetch(`${nextUrl.origin}/api/domains/lookup?domain=${hostname}`)
      const data = await res.json()

      if (data.active && data.username) {
        if (pathname === "/") {
          const rewriteRes = NextResponse.rewrite(new URL(`/${data.username}`, req.url))
          // Copy security headers to rewrite response
          response.headers.forEach((v, k) => rewriteRes.headers.set(k, v))
          return rewriteRes
        }
        if (!pathname.startsWith("/api") && !pathname.startsWith("/_next") && !pathname.includes(".")) {
          if (pathname.startsWith("/obrigado")) return response
          const rewriteRes = NextResponse.rewrite(new URL(`/c${pathname}`, req.url))
          response.headers.forEach((v, k) => rewriteRes.headers.set(k, v))
          return rewriteRes
        }
      }
    } catch (e) { console.error(e) }
  }

  // ── 5. AUTH PROTECTION ───────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!isLogged) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // Verificar se conta não está suspensa
    const user = req.auth?.user as { status?: string } | undefined
    if (user?.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/conta-suspensa', req.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    const user = req.auth?.user as { role?: string } | undefined
    if (!isLogged || user?.role !== 'ADMIN') {
      return new NextResponse(null, { status: 403 })
    }
  }

  // ── 6. AFFILIATION TRACKING ──────────────────────────────────────
  const affiliateRef = nextUrl.searchParams.get("ref")
  if (pathname.startsWith("/c/") && affiliateRef) {
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
}
