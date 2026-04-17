import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTwoFactorToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mail";
import { getTwoFactorEmailTemplate } from "@/lib/email-templates";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = resendSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.status === "ACTIVE") {
      return NextResponse.json({ error: "Sua conta já está ativa" }, { status: 400 });
    }

    // Check cooldown
    const existingToken = await prisma.twoFactorToken.findUnique({
      where: { email }
    });

    if (existingToken) {
      const secondsSinceLastToken = Math.floor((new Date().getTime() - new Date(existingToken.createdAt).getTime()) / 1000);
      if (secondsSinceLastToken < 60) {
        return NextResponse.json(
          { error: `Aguarde ${60 - secondsSinceLastToken} segundos para reenviar.` },
          { status: 429 }
        );
      }
    }

    // Generate and send new 2FA Token
    const { code } = await generateTwoFactorToken(email);
    
    await sendEmail({
      to: email,
      subject: "Novo código de verificação - PulsePay",
      html: getTwoFactorEmailTemplate(code)
    });

    return NextResponse.json({
      success: true,
      message: "Novo código enviado com sucesso!"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
