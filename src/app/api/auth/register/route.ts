import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { generateTwoFactorToken } from "@/lib/tokens"
import { sendEmail } from "@/lib/mail"
import { getTwoFactorEmailTemplate } from "@/lib/email-templates"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().min(11), // CPF
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, document } = registerSchema.parse(body)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { document }]
      }
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

    // Generate and send 2FA Token
    const { code } = await generateTwoFactorToken(email);
    
    await sendEmail({
      to: email,
      subject: "Verifique sua conta - PulsePay",
      html: getTwoFactorEmailTemplate(code)
    });

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
