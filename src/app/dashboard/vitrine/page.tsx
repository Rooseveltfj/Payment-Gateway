import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { VitrineClient } from "./VitrineClient";

export default async function VitrinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return (
      <div className="max-w-7xl mx-auto">
        <VitrineClient user={user} products={products} />
      </div>
    );
  } catch (error) {
    console.error("VitrinePage Render Error:", error);
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl mt-12">
        <h2 className="text-xl font-bold text-error mb-2">Erro ao carregar vitrine</h2>
        <p className="text-text-secondary">Houve um problema ao conectar com o banco de dados. Por favor, tente novamente.</p>
      </div>
    );
  }
}

