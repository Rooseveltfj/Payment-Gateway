import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DominiosClient } from "./DominiosClient";

export default async function DominiosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const domains = await prisma.customDomain.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <DominiosClient domains={domains} />
    </div>
  );
}

