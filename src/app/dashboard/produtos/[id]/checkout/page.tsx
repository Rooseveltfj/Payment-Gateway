import { CheckoutBuilderClient } from "./CheckoutBuilderClient";

export const metadata = { title: "Checkout Builder | PulsePay" };

export default function CheckoutBuilderPage({ params }: { params: { id: string } }) {
  return <CheckoutBuilderClient productId={params.id} />;
}
