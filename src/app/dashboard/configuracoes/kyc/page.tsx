"use client";

import { useState } from "react";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { PersonalDataStep } from "./steps/PersonalDataStep";
import { IdentityDocStep } from "./steps/IdentityDocStep";
import { SelfieStep } from "./steps/SelfieStep";
import { ResidencyStep } from "./steps/ResidencyStep";

const STEPS = [
  { id: "personal", title: "Dados Pessoais" },
  { id: "identity", title: "Identificação" },
  { id: "selfie", title: "Selfie" },
  { id: "residency", title: "Residência" }
];

export default function KycWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Unified application state
  const [formData, setFormData] = useState({
    cpf: "",
    fullName: "",
    birthDate: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    frontIdUrl: null as string | null,
    backIdUrl: null as string | null,
    selfieUrl: null as string | null,
    residencyUrl: null as string | null,
  });

  const updateData = (payload: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...payload }));
  };

  const handleNext = () => {
    // Validation placeholders before proceeding
    if (currentStep === 0 && (!formData.fullName || formData.cpf.length < 14)) {
       return alert("Preencha CPF válido e nome completo.");
    }
    if (currentStep === 1 && (!formData.frontIdUrl || !formData.backIdUrl)) {
       return alert("Faça o upload da frente e verso do seu documento.");
    }
    if (currentStep === 2 && !formData.selfieUrl) {
       return alert("Você precisa enviar a selfie estruturada.");
    }
    setCurrentStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!formData.residencyUrl) {
       return alert("Anexe um comprovante de residência antes de finalizar.");
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro na submissão");
      
      setSubmitted(true);
    } catch {
      alert("Houve um erra ao enviar seu processo de KYC.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 bg-card border border-border shadow-lg rounded-xl mt-12 px-6">
        <div className="h-20 w-20 bg-warning/20 text-warning mx-auto rounded-full flex items-center justify-center mb-6 ring-4 ring-warning/10">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Processo em Análise</h2>
        <p className="text-text-secondary mt-2 mb-8">
          Recebemos seus documentos com sucesso. Nossa equipe de compliance revisará sua identidade dentro de 24-48h. Você receberá um e-mail confirmando o acesso aos saques.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-text-primary">Verificação de Conformidade (KYC)</h1>
        <p className="text-sm text-text-secondary mt-1">Conclua as etapas abaixo para liberar os saques da sua conta.</p>
       </div>

       <div className="bg-card border border-border shadow-md rounded-xl flex flex-col min-h-[500px]">
          <div className="px-6 py-8 border-b border-border/50 flex justify-center bg-background/30 rounded-t-xl overflow-x-auto">
             <Stepper steps={STEPS} currentStep={currentStep} />
          </div>

          <div className="flex-1 p-6 sm:p-8 relative">
             {currentStep === 0 && <PersonalDataStep data={formData} updateData={updateData} />}
             {currentStep === 1 && <IdentityDocStep data={formData} updateData={updateData} />}
             {currentStep === 2 && <SelfieStep data={formData} updateData={updateData} />}
             {currentStep === 3 && <ResidencyStep data={formData} updateData={updateData} />}
          </div>

          <div className="px-6 py-5 border-t border-border bg-background/30 rounded-b-xl flex items-center justify-between">
             <Button variant="outline" onClick={() => setCurrentStep(s => s -1)} disabled={currentStep === 0 || isSubmitting}>
               Etapa anterior
             </Button>
             
             {currentStep === STEPS.length - 1 ? (
               <Button onClick={handleSubmit} disabled={isSubmitting} variant="default" className="bg-success hover:bg-success/90">
                 {isSubmitting ? "Enviando dossiê..." : "Assinar e Enviar"}
               </Button>
             ) : (
               <Button onClick={handleNext} variant="default">Próxima Etapa</Button>
             )}
          </div>
       </div>
    </div>
  );
}
