import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { generateTwoFactorToken } from "@/lib/tokens"
import { sendEmail } from "@/lib/mail"
import { getTwoFactorEmailTemplate } from "@/lib/email-templates"
import { rateLimits } from "@/lib/rate-limit"
import { audit } from "@/lib/audit"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().min(11),
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await rateLimits.auth.limit(ip)
  if (!success) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { name, email, password, document } = registerSchema.parse(body)

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { document }] }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or Document (CPF) already registered" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        document,
        status: "PENDING",
      },
    })

    await audit('USER_REGISTERED', user.id, { email, name }, req)

    const { code } = await generateTwoFactorToken(email)
    // Envio CRÍTICO: sem o código o usuário não verifica a conta.
    const emailResult = await sendEmail({
      to: email,
      subject: "Verifique sua conta - PulsePay",
      html: getTwoFactorEmailTemplate(code)
    })

    if (!emailResult.success) {
      // Conta já criada; não deixamos 500 genérico — mensagem clara e acionável.
      return NextResponse.json({
        error: "Sua conta foi criada, mas não conseguimos enviar o código de verificação agora. Vá para a tela de verificação e clique em \"reenviar código\", ou tente novamente em instantes."
      }, { status: 502 })
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: "Verificação enviada. Verifique seu e-mail."
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
