"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateShowcase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const bannerUrl = formData.get("bannerUrl") as string;
  const twitter = formData.get("twitter") as string;
  const instagram = formData.get("instagram") as string;

  // Basic validation
  if (username && !/^[a-zA-Z0-9-]+$/.test(username)) {
    throw new Error("Username invlido. Use apenas letras, nmeros e hfens.");
  }

  // Reserved usernames check
  const reserved = ["admin", "pulsepay", "checkout", "support", "api", "dashboard", "login", "register", "c", "obrigado"];
  if (reserved.includes(username.toLowerCase())) {
    throw new Error("Este username no est disponvel.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username: username || null,
      showcaseConfig: {
        bannerUrl,
        bio,
      },
      socialLinks: {
        twitter,
        instagram,
      }
    }
  });

  revalidatePath("/dashboard/marketplace");
  if (username) revalidatePath(`/${username}`);
}

export async function toggleProductShowcase(productId: string, show: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.product.update({
    where: { 
      id: productId,
      userId: session.user.id
    },
    data: { showInShowcase: show }
  });

  revalidatePath("/dashboard/marketplace");
}



