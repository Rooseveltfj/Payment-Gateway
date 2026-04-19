import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MyAffiliationsClient } from "./MyAffiliationsClient";

export default async function MyAffiliationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const affiliations = await prisma.affiliation.findMany({
      where: { affiliateId: session.user.id },
      include: {
        offer: {
          include: {
            product: true,
            owner: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Métricas Agregadas
    const stats = {
      totalEarned: affiliations.reduce((acc, curr) => acc + curr.totalEarned, 0),
      pendingBalance: affiliations.reduce((acc, curr) => acc + curr.pendingBalance, 0),
      activeCount: affiliations.filter(a => a.status === "APPROVED").length,
      avgConversion: affiliations.length > 0 
        ? affiliations.reduce((acc, curr) => acc + (curr.totalSales / (curr.totalClicks || 1)), 0) / affiliations.length * 100
        : 0
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MyAffiliationsClient 
          initialAffiliations={affiliations} 
          stats={stats}
        />
      </div>
    );
  } catch (error) {
    console.error("MyAffiliationsPage Render Error:", error);
    return <div>Erro ao carregar suas afiliações.</div>;
  }
}
