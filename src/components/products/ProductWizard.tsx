"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

// Steps implementations
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { PaymentMethodsStep } from "./steps/PaymentMethodsStep";
import { DEFAULT_CHECKOUT_CONFIG } from "@/types/checkout-config";
import { toast } from "sonner";

const STEPS = [
  { id: "basic", title: "Informações Básicas" },
  { id: "payments", title: "Meios de Pagamento" },
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
    type: "SINGLE",
    imageUrl: null as string | null,
    slug: "",
    category: "",
    paymentMethods: {
      pix: true,
      credit_card: true,
      boleto: false,
    },
    maxInstallments: 12,
    pixDiscount: 0,
    checkoutConfig: DEFAULT_CHECKOUT_CONFIG,
  });

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.name || formData.price <= 0 || !formData.slug) {
        toast.error("Por favor, preencha o nome, preço e a URL do produto.");
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
            ...formData.checkoutConfig,
            paymentMethods: formData.paymentMethods,
            pixDiscount: formData.pixDiscount,
            installments: formData.maxInstallments
          }
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar produto");

      const { id } = await res.json();
      toast.success("Produto criado! Personalize seu checkout agora.");

      // Redirect to Checkout Builder for visual customization
      router.push(`/dashboard/produtos/${id}/checkout`);

    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao salvar o produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[880px] mx-auto w-full pb-20">
      <Card className="p-8 bg-[#0f0f1a] border-white/[0.05] rounded-[24px] shadow-2xl relative overflow-hidden">
        {/* Step Progress */}
        <div className="mb-12 border-b border-white/[0.05] pb-10">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <BasicInfoStep data={formData} updateData={(d) => setFormData(prev => ({ ...prev, ...d }))} />
              )}
              {currentStep === 1 && (
                <PaymentMethodsStep data={formData} updateData={(d) => setFormData(prev => ({ ...prev, ...d }))} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.05] flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <Button variant="secondary" onClick={handleBack} disabled={isSubmitting} className="border-white/[0.05] h-11 px-8">
                Voltar etapa
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                variant="primary"
                className="h-11 px-10 font-bold"
              >
                Criar Produto e Personalizar
              </Button>
            ) : (
              <Button onClick={handleNext} variant="primary" className="h-11 px-10 font-bold">
                Continuar para Meios de Pagamento
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
