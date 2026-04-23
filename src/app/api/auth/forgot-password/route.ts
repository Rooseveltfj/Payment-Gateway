import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mail";
import { getForgotPasswordTemplate } from "@/lib/email-templates";
import { z } from "zod";

import { rateLimits } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await rateLimits.passwordReset.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal that the user doesn't exist
      return NextResponse.json({ 
        message: "Se este e-mail estiver cadastrado, um link de recuperação será enviado." 
      });
    }

    const { token } = await generatePasswordResetToken(email);
    
    // In production, use the actual domain. In dev, localhost might be needed for the link to work.
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.pulsepay.com.br";
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    console.log(`[Auth] Password reset link for ${email}: ${resetLink}`);

    await sendEmail({
      to: email,
      subject: "Recuperação de Senha - PulsePay",
      html: getForgotPasswordTemplate(resetLink),
    });

    return NextResponse.json({ 
      message: "Link de recuperação enviado com sucesso. Verifique seu e-mail." 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[Auth] Forgot password error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
