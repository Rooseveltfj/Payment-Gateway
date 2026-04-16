import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "./CheckoutClient";
import { CheckoutConfig } from "@/types/checkout-config";

export default async function PublicCheckoutPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

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
}
