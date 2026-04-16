import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLogged = !!req.auth
  
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")

  if (isAdminRoute) {
    if (!isLogged) return NextResponse.redirect(new URL("/login", nextUrl))
    const user = req.auth?.user as { role?: string } | undefined
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  if (isDashboardRoute && !isLogged) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
