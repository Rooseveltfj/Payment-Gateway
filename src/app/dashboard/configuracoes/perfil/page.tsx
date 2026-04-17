import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PerfilClient } from "./PerfilClient";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      kycDocuments: true,
    }
  });

  if (!user) redirect("/login");

  return <PerfilClient user={user} />;
}

