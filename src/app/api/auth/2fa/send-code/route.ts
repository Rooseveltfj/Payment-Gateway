import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateTwoFactorToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mail";
import { getTwoFactorEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verify password before sending code to prevent email spamming
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Generate and send token
    const { code } = await generateTwoFactorToken(user.email);
    
    await sendEmail({
      to: user.email,
      subject: "Seu código de segurança PulsePay",
      html: getTwoFactorEmailTemplate(code)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[2FA_SEND_CODE] Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
