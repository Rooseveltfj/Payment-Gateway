"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import dns from "dns";
import { promisify } from "util";

const resolveCname = promisify(dns.resolveCname);

export async function addDomain(domain: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Basic validation
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
  if (!domainRegex.test(domain)) {
    throw new Error("Domínio inválido. Ex: pagar.seunegocio.com.br");
  }

  // Check if domain already exists
  const existing = await prisma.customDomain.findUnique({ where: { domain } });
  if (existing) throw new Error("Este domínio já está em uso.");

  await prisma.customDomain.create({
    data: {
      userId: session.user.id,
      domain,
      status: "PENDING"
    }
  });

  revalidatePath("/dashboard/dominios");
}

export async function verifyDomain(domainId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const customDomain = await prisma.customDomain.findUnique({
    where: { id: domainId, userId: session.user.id }
  });

  if (!customDomain) throw new Error("Domínio não encontrado");

  try {
    const records = await resolveCname(customDomain.domain);
    const target = "checkouts.pulsepay.com.br";
    
    // Check if any CNAME record points to our target
    const isVerified = records.some(r => r.toLowerCase() === target);

    if (isVerified) {
      await prisma.customDomain.update({
        where: { id: domainId },
        data: { status: "ACTIVE" }
      });
      return { success: true, message: "Domínio verificado e ativo!" };
    } else {
      await prisma.customDomain.update({
        where: { id: domainId },
        data: { status: "ERROR" }
      });
      return { success: false, message: `O domínio aponta para ${records[0]}, mas deveria apontar para ${target}` };
    }
  } catch (err: any) {
    if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
      return { success: false, message: "Nenhum registro CNAME encontrado para este domínio." };
    }
    return { success: false, message: "Erro ao verificar DNS: " + err.message };
  } finally {
    revalidatePath("/dashboard/dominios");
  }
}

export async function deleteDomain(domainId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.customDomain.delete({
    where: { id: domainId, userId: session.user.id }
  });

  revalidatePath("/dashboard/dominios");
}


