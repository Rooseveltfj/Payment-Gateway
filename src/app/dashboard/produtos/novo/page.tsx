import ProductWizard from "@/components/products/ProductWizard";

export const metadata = {
  title: "Novo Produto | PulsePay",
};

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Criar novo checkout</h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure as informações básicas e meios de pagamento do seu produto.
        </p>
      </div>

      <ProductWizard />
    </div>
  );
}
