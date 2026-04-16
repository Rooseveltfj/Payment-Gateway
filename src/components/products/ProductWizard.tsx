"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";

// Steps implementations
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { CheckoutConfigStep } from "./steps/CheckoutConfigStep";
import { PaymentMethodsStep } from "./steps/PaymentMethodsStep";

const STEPS = [
  { id: "basic", title: "Informações Iniciais" },
  { id: "checkout", title: "Checkout Builder" },
  { id: "payments", title: "Pagamentos" }
];

export default function ProductWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Unified State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    type: "SINGLE", // SINGLE | SUBSCRIPTION | INSTALLMENT
    imageUrl: null as string | null,
    slug: "",
    category: "",
    // Step 3
    paymentMethods: {
      pix: true,
      credit_card: true,
      boleto: false,
    },
    pixDiscount: 0,
    maxInstallments: 12,
  });

  const handleNext = () => {
    // Validação básica do Step 0
    if (currentStep === 0) {
      if (!formData.name || formData.price <= 0 || !formData.slug) {
        alert("Preencha nome, preço maior que zero e slug.");
        return;
      }
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          type: formData.type,
          slug: formData.slug,
          imageUrl: formData.imageUrl,
          checkoutConfig: {
             methods: formData.paymentMethods,
             pixDiscount: formData.pixDiscount,
             installments: formData.maxInstallments
          }
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar produto");
      
      const { id } = await res.json();
      router.push(`/dashboard/produtos/${id}`);

    } catch (error) {
      console.error(error);
      alert("Houve um erro no salvamento do Checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border shadow-md rounded-xl flex flex-col min-h-[600px]">
      {/* Header with Stepper */}
      <div className="px-6 py-8 border-b border-border/50 flex justify-center bg-background/30 rounded-t-xl">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="flex-1 p-6 sm:p-8">
        {currentStep === 0 && (
          <BasicInfoStep data={formData} updateData={(d) => setFormData(prev => ({ ...prev, ...d }))} />
        )}
        {currentStep === 1 && (
          <CheckoutConfigStep />
        )}
        {currentStep === 2 && (
          <PaymentMethodsStep data={formData} updateData={(d) => setFormData(prev => ({ ...prev, ...d }))} />
        )}
      </div>

      {/* Footer Controls */}
      <div className="px-6 py-5 border-t border-border bg-background/30 rounded-b-xl flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSubmitting}>
          Voltar etapa
        </Button>

        {currentStep === STEPS.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting} variant="default">
            {isSubmitting ? "Criando checkout..." : "Finalizar Produto"}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="default">
            Continuar para {STEPS[currentStep + 1].title}
          </Button>
        )}
      </div>
    </div>
  );
}
