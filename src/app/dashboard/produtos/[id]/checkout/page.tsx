import { CheckoutBuilderClient } from "./CheckoutBuilderClient";

export const metadata = { title: "Checkout Builder | Black Gate" };

export default function CheckoutBuilderPage({ params }: { params: { id: string } }) {
  return <CheckoutBuilderClient productId={params.id} />;
}
