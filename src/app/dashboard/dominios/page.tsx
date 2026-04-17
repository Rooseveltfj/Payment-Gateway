import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DominiosClient } from "./DominiosClient";

export default async function DominiosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let domains = [];
  try {
     domains = await prisma.customDomain.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Erro Prisma em Domínios (Local):", error);
    // Em caso de erro local (ex: model não gerado), retornamos lista vazia 
    // e poderíamos mostrar um aviso no DominiosClient se necessário.
  }

  return (
    <div className="max-w-7xl mx-auto">
      <DominiosClient domains={domains} />
    </div>
  );
}

