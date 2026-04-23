import { auth } from '@/lib/auth'
import { z } from 'zod'
import { rateLimits } from '@/lib/rate-limit'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type HandlerOptions = {
  requireAuth?: boolean
  requireAdmin?: boolean
  requireApiKey?: boolean
  schema?: z.ZodSchema
  rateLimit?: 'auth' | 'checkout' | 'webhook' | 'api'
}

export function createHandler(
  handler: (req: Request, ctx: { session?: any; body?: any }) => Promise<Response>,
  options: HandlerOptions = {}
) {
  return async (req: Request) => {
    try {
      // 1. Rate limiting
      if (options.rateLimit) {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
        const { success } = await rateLimits[options.rateLimit].limit(ip)
        if (!success) {
          return NextResponse.json({ error: 'Muitas requisições. Tente novamente.' }, { status: 429 })
        }
      }

      // 2. Autenticação via sessão (NextAuth v5)
      let session: any = null
      if (options.requireAuth || options.requireAdmin) {
        session = await auth()
        if (!session?.user) {
          return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }
        if (options.requireAdmin && session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }
        
        // Fetch full user to check status
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { status: true }
        })
        
        if (user?.status === 'SUSPENDED') {
          return NextResponse.json({ error: 'Conta suspensa' }, { status: 403 })
        }
      }

      // 3. Autenticação via API Key (para /api/v1/*)
      if (options.requireApiKey) {
        const authResult = await validateApiKey(req)
        if ('error' in authResult) {
          return authResult.error
        }
        // In this case, session is the result of API Key validation
        session = { user: authResult.user, isApiKey: true }
      }

      // 4. Validação do body com Zod
      let body = null
      if (options.schema && ['POST', 'PUT', 'PATCH'].includes(req.method!)) {
        const rawBody = await req.json().catch(() => ({}))
        const result = options.schema.safeParse(rawBody)
        if (!result.success) {
          return NextResponse.json({
            error: 'Dados inválidos',
            details: result.error.flatten()
          }, { status: 422 })
        }
        body = result.data
      }

      return await handler(req, { session, body })

    } catch (error) {
      console.error('[API Error]', error)
      return NextResponse.json(
        { error: 'Erro interno no servidor' },
        { status: 500 }
      )
    }
  }
}
