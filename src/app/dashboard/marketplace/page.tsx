import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MarketplaceCatalog } from "./MarketplaceCatalog";

export default async function MarketplacePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    // Listar ofertas de outros produtores que estão ATIVAS
    const offers = await prisma.affiliateOffer.findMany({
      where: {
        status: "ACTIVE",
        ownerId: { not: session.user.id } // Não mostrar os próprios anúncios aqui
      },
      include: {
        product: true,
        owner: {
          select: {
            name: true,
            avatarUrl: true
          }
        },
        affiliations: {
          where: { affiliateId: session.user.id } // Ver se o usuário já é afiliado
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const activeAffiliationsCount = await prisma.affiliation.count({
      where: { affiliateId: session.user.id, status: "APPROVED" }
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketplaceCatalog 
          initialOffers={offers} 
          activeAffiliationsCount={activeAffiliationsCount}
        />
      </div>
    );
  } catch (error) {
    console.error("MarketplacePage Render Error:", error);
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl mt-12">
        <h2 className="text-xl font-bold text-error mb-2">Erro ao carregar marketplace</h2>
        <p className="text-text-secondary">Estamos enfrentando instabilidades temporárias. Por favor, tente novamente.</p>
      </div>
    );
  }
}
