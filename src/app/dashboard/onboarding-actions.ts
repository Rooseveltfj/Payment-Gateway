"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getOnboardingStatus() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      kycDocuments: true,
      products: {
        include: { checkoutLinks: true }
      },
      orders: true,
      customDomains: true,
    }
  });

  if (!user) return null;

  const steps = [
    {
      id: "profile",
      title: "Complete seu perfil",
      description: "Adicione seu telefone e chave PIX para receber pagamentos.",
      completed: !!(user.phone && user.pixKey),
      href: "/dashboard/configuracoes/perfil"
    },
    {
      id: "kyc",
      title: "Envie seus documentos",
      description: "Necessrio para realizar saques na plataforma.",
      completed: user.kycStatus === "APPROVED" || user.kycDocuments.length > 0,
      href: "/dashboard/configuracoes/kyc"
    },
    {
      id: "product",
      title: "Crie seu primeiro produto",
      description: "Cadastre o infoproduto ou serviço que deseja vender.",
      completed: user.products.length > 0,
      href: "/dashboard/produtos/novo"
    },
    {
      id: "checkout",
      title: "Configure um checkout",
      description: "Personalize a aparncia da sua pgina de pagamento.",
      completed: user.products.some(p => p.checkoutConfig !== null),
      href: "/dashboard/produtos"
    },
    {
      id: "share",
      title: "Marketplace & Vendas",
      description: "Divulgue seus produtos no Marketplace ou compartilhe seu checkout.",
      completed: user.username !== null || user.customDomains.length > 0,
      href: "/dashboard/marketplace"
    }
  ];

  const allCompleted = steps.every(s => s.completed);

  return {
    steps,
    allCompleted,
    percentage: Math.round((steps.filter(s => s.completed).length / steps.length) * 100)
  };
}


