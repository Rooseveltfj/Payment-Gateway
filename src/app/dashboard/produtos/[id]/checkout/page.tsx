import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutBuilderClient } from "./CheckoutBuilderClient";

export const metadata = { title: "Checkout Builder | PulsePay" };

export default async function CheckoutBuilderPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const product = await prisma.product.findUnique({
    where: { id: params.id, userId: session.user.id }
  });

  if (!product) notFound();

  return <CheckoutBuilderClient productId={params.id} initialProduct={product} />;
}
