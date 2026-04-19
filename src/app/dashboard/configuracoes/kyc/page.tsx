"use client";

import { useState, useEffect } from "react";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { PersonalDataStep } from "./steps/PersonalDataStep";
import { IdentityDocStep } from "./steps/IdentityDocStep";
import { SelfieStep } from "./steps/SelfieStep";
import { ResidencyStep } from "./steps/ResidencyStep";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = [
  { id: "personal", title: "Dados Pessoais" },
  { id: "identity", title: "Documento" },
  { id: "selfie", title: "Selfie" },
  { id: "residency", title: "Comprovante" }
];

export default function KycPage() {
  const [kycData, setKycData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local form state for submission
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

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/kyc/status");
      const data = await res.json();
      setKycData(data);
      if (data.status === "NOT_SUBMITTED" || data.status === "REJECTED") {
        setFormData(prev => ({ 
          ...prev, 
          fullName: data.userData?.name || "",
          cpf: data.userData?.document || "",
          phone: data.userData?.phone || ""
        }));
      }
    } catch (e) {
      toast.error("Erro ao carregar status do KYC");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const updateData = (payload: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...payload }));
  };

  const handleNext = () => {
    if (currentStep === 0 && (!formData.fullName || formData.cpf.length < 14)) {
      return toast.error("Preencha nome completo e CPF válido.");
    }
    if (currentStep === 1 && (!formData.frontIdUrl || !formData.backIdUrl)) {
      return toast.error("Envie a frente e o verso do seu documento.");
    }
    if (currentStep === 2 && !formData.selfieUrl) {
      return toast.error("A selfie é obrigatória para verificação.");
    }
    setCurrentStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!formData.residencyUrl) {
      return toast.error("Anexe o comprovante de residência.");
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      
      toast.success("Documentos enviados com sucesso!");
      fetchStatus();
    } catch {
      toast.error("Erro ao enviar seus documentos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#8b5cf6] animate-spin" />
      </div>
    );
  }

  // Se já enviou e está PENDING, APPROVED ou REJECTED (e não clicou em reenviar)
  const isFinalState = kycData?.status === "PENDING" || kycData?.status === "APPROVED" || kycData?.status === "REJECTED";

  if (isFinalState) {
    const statusInfo = {
      PENDING: {
        icon: Clock,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        title: "Processo em Análise",
        desc: "Sua documentação foi recebida e nossa equipe de compliance está revisando as informações. O prazo médio é de 24h a 48h úteis.",
        badge: "Em análise"
      },
      APPROVED: {
        icon: CheckCircle2,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        title: "Identidade Verificada",
        desc: "Parabéns! Sua conta está totalmente verificada e você já pode realizar saques na plataforma sem restrições.",
        badge: "Aprovado"
      },
      REJECTED: {
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        title: "Documentação Rejeitada",
        desc: "Infelizmente sua verificação não pôde ser concluída. Verifique o motivo abaixo e realize o reenvio dos documentos.",
        badge: "Rejeitado"
      }
    }[kycData.status as "PENDING" | "APPROVED" | "REJECTED"];

    const Icon = statusInfo.icon;

    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
        <Card className="p-12 text-center bg-[#0f0f1a] border-white/[0.05] rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className={cn("h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner", statusInfo.bgColor, statusInfo.color)}>
            <Icon className="h-12 w-12" />
          </div>
          
          <h2 className="text-3xl font-bold text-[#f1f5f9] tracking-tight">{statusInfo.title}</h2>
          <div className="mt-4 flex justify-center">
             <Badge status={kycData.status === 'PENDING' ? 'pending' : kycData.status === 'APPROVED' ? 'active' : 'failed'} label={statusInfo.badge} />
          </div>
          
          <p className="text-[#64748b] mt-6 max-w-md mx-auto leading-relaxed">
            {statusInfo.desc}
          </p>

          {kycData.status === "REJECTED" && (
            <div className="mt-10 p-6 bg-red-500/5 border border-red-500/20 rounded-[20px] text-left">
              <div className="flex items-center gap-2 mb-2 text-red-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[12px] font-bold uppercase tracking-widest">Motivo da Rejeição</span>
              </div>
              <p className="text-[14px] text-[#f1f5f9]/80 font-medium">
                {kycData.rejectionReason}
              </p>
            </div>
          )}

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            {kycData.status === "REJECTED" ? (
              <Button 
                variant="primary" 
                className="h-12 px-10 font-bold gap-2"
                onClick={() => setKycData({ ...kycData, status: "NOT_SUBMITTED" })}
              >
                Reenviar documentos
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                className="h-12 px-10 font-bold border-white/[0.05]"
                onClick={() => window.location.href = "/dashboard"}
              >
                Voltar à Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Wizard Flow (NOT_SUBMITTED)
  return (
    <div className="max-w-[880px] mx-auto space-y-8 animate-in fade-in duration-700">
       <div className="space-y-1">
         <h1 className="text-[28px] font-bold text-[#f1f5f9] tracking-tight">Meus Documentos</h1>
         <p className="text-[14px] text-[#64748b]">Verificação necessária para realizar saques na plataforma.</p>
       </div>

       {/* Status Alert Banner (Optional but good) */}
       <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
             <p className="text-sm font-bold text-[#f1f5f9]">Sua conta ainda não foi verificada</p>
             <p className="text-xs text-[#64748b]">Complete o envio dos dados abaixo para aumentar sua segurança.</p>
          </div>
       </div>

       <Card className="bg-[#0f0f1a] border-white/[0.05] rounded-[24px] shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
          {/* Progress Header */}
          <div className="px-8 py-10 border-b border-white/[0.05]">
             <Stepper steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Content */}
          <div className="flex-1 p-8 sm:p-10">
             <div className="min-h-[400px]">
                {currentStep === 0 && <PersonalDataStep data={formData} updateData={updateData} />}
                {currentStep === 1 && <IdentityDocStep data={formData} updateData={updateData} />}
                {currentStep === 2 && <SelfieStep data={formData} updateData={updateData} />}
                {currentStep === 3 && <ResidencyStep data={formData} updateData={updateData} />}
             </div>
          </div>

          {/* Controls */}
          <div className="p-8 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
             <Button 
                variant="secondary" 
                onClick={() => setCurrentStep(s => s - 1)} 
                disabled={currentStep === 0 || isSubmitting}
                className="h-11 px-8 border-white/[0.05]"
              >
                Voltar
             </Button>
             
             {currentStep === STEPS.length - 1 ? (
               <Button 
                onClick={handleSubmit} 
                isLoading={isSubmitting} 
                variant="primary"
                className="h-12 px-10 font-bold bg-[#22c55e] hover:bg-[#16a34a] text-white"
               >
                 Enviar para Análise
               </Button>
             ) : (
               <Button onClick={handleNext} variant="primary" className="h-12 px-10 font-bold gap-2">
                 Próxima Etapa
                 <ChevronRight className="w-4 h-4" />
               </Button>
             )}
          </div>
       </Card>
    </div>
  );
}
