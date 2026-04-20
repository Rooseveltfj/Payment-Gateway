"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { generateTwoFactorToken, validateTwoFactorToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mail";
import { getTwoFactorEmailTemplate } from "@/lib/email-templates";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string | null;
  const phone = formData.get("phone") as string | null;
  const pixKey = formData.get("pixKey") as string | null;
  const pixKeyType = formData.get("pixKeyType") as any;
  const avatarUrl = formData.get("avatarUrl") as string | null;

  // Build update data object dynamically to avoid overriding with nulls
  const updateData: any = {};
  if (name !== null) updateData.name = name;
  if (phone !== null) updateData.phone = phone;
  if (pixKey !== null) updateData.pixKey = pixKey;
  if (pixKeyType !== null) updateData.pixKeyType = pixKeyType;
  if (avatarUrl !== null) updateData.avatarUrl = avatarUrl;

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData
  });

  revalidatePath("/dashboard/configuracoes/perfil");
}

export async function disable2FA() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorMethod: null
    }
  });

  revalidatePath("/dashboard/configuracoes/perfil");
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) throw new Error("As senhas não coincidem");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) throw new Error("Usuário não encontrado");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Senha atual incorreta");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword }
  });
}

export async function requestEmail2FA() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) throw new Error("Unauthorized");

  const { code } = await generateTwoFactorToken(session.user.email);
  
  await sendEmail({
    to: session.user.email,
    subject: "Seu código de segurança PulsePay",
    html: getTwoFactorEmailTemplate(code)
  });

  return { success: true };
}

export async function activateEmail2FA(code: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) throw new Error("Unauthorized");

  const result = await validateTwoFactorToken(session.user.email, code);
  if (!result.success) throw new Error(result.error);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorMethod: "EMAIL"
    }
  });

  revalidatePath("/dashboard/configuracoes/perfil");
  return { success: true };
}


