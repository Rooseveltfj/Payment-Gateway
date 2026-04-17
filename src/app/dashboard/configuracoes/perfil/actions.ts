"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const pixKey = formData.get("pixKey") as string;
  const pixKeyType = formData.get("pixKeyType") as any;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
      pixKey,
      pixKeyType
    }
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
      twoFactorSecret: null
    }
  });

  revalidatePath("/dashboard/configuracoes/perfil");
}


