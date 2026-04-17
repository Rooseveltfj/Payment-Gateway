import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "./CheckoutClient";
import { CheckoutConfig } from "@/types/checkout-config";

export const dynamic = "force-dynamic";

export default async function PublicCheckoutPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          platformFeePercent: true
        }
      }
    }
  });

  if (!product) {
    notFound();
  }

    const config = (product.checkoutConfig as unknown as CheckoutConfig) || null;

    return (
      <div className="min-h-screen bg-background">
        <CheckoutClient product={product} config={config} />
      </div>
    );
  } catch (error) {
    console.error("PublicCheckoutPage Error:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-error">Houve um problema ao carregar o produto</h1>
          <p className="text-text-secondary">O servidor está com alta demanda ou o banco de dados está temporariamente indisponível. Por favor, tente novamente em alguns segundos.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
}
