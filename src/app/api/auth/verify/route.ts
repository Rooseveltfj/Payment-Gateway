import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTwoFactorToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mail";
import { getWelcomeEmailTemplate } from "@/lib/email-templates";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = verifySchema.parse(body);

    // 1. Validate the 2FA token
    const result = await validateTwoFactorToken(email, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // 2. Activate the user
    const user = await prisma.user.update({
      where: { email },
      data: { status: "ACTIVE" }
    });

    // 3. Send welcome email — NÃO-crítico: falha aqui não pode bloquear a verificação.
    try {
      await sendEmail({
        to: email,
        subject: "Bem-vindo à PulsePay 🚀",
        html: getWelcomeEmailTemplate(user.name)
      });
    } catch (e) {
      console.error("[verify] Falha ao enviar e-mail de boas-vindas (ignorado):", e);
    }

    return NextResponse.json({
      success: true,
      message: "Conta verificada com sucesso!"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
