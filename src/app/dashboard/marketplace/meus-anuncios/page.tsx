import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MyAdsClient } from "./MyAdsClient";

export default async function MyAdsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    // 1. Buscar ofertas do próprio usuário (anúncios no marketplace)
    const ads = await prisma.affiliateOffer.findMany({
      where: { ownerId: session.user.id },
      include: {
        product: true,
        affiliations: {
          include: {
            affiliate: {
              select: { name: true, email: true, avatarUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. Buscar produtos que o usuário possui e que AINDA NÃO estão no marketplace
    const products = await prisma.product.findMany({
      where: { 
        userId: session.user.id,
        affiliateOffers: { none: {} } // Produtos que não tem oferta
      }
    });

    // 3. Métricas para o Header
    const stats = {
      totalAds: ads.length,
      totalAffiliates: ads.reduce((acc, curr) => acc + curr.totalAffiliates, 0),
      totalRevenue: ads.reduce((acc, curr) => acc + curr.totalRevenue, 0),
      pendingRequests: ads.reduce((acc, curr) => 
        acc + curr.affiliations.filter(af => af.status === "PENDING").length, 0
      )
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MyAdsClient 
          initialAds={ads} 
          availableProducts={products}
          stats={stats}
        />
      </div>
    );
  } catch (error) {
    console.error("MyAdsPage Render Error:", error);
    return <div>Erro ao carregar seus anúncios.</div>;
  }
}
