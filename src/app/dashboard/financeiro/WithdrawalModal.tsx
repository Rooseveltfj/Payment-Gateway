"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ArrowUpRight, ChevronRight, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface WithdrawalModalProps {
  available: number;
  pixKey?: string;
  pixKeyType?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function WithdrawalModal({ available, pixKey: initialPixKey, pixKeyType: initialPixKeyType, onClose, onSuccess }: WithdrawalModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [pixKey, setPixKey] = useState(initialPixKey || "");
  const [pixKeyType, setPixKeyType] = useState(initialPixKeyType || "CPF");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const withdrawalFee = 3.67;
  const netAmount = Math.max(0, amount - withdrawalFee);

  const handleSubmit = async () => {
    if (amount < 30) return setError("O valor mínimo para saque é R$ 30,00");
    if (amount > available) return setError("Saldo insuficiente para esta operação.");
    if (!pixKey) return setError("Por favor, informe sua chave PIX.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/financial/withdrawal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, pixKey, pixKeyType })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar saque.");

      setSuccess(true);
      setTimeout(() => onSuccess(), 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="500px">
      <div className="mb-8">
        <h3 className="text-[20px] font-bold text-[#f1f5f9] tracking-tight">Solicitar Saque</h3>
        <p className="text-[14px] text-[#64748b] mt-1">
          Transfira seu saldo para sua conta via PIX.
        </p>
      </div>

      {success ? (
        <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-[#22c55e1a] text-[#22c55e] mx-auto rounded-full flex items-center justify-center mb-6 border border-[#22c55e33]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#f1f5f9]">Solicitação Enviada!</h2>
          <p className="text-[#64748b] mt-3 leading-relaxed max-w-[320px] mx-auto">
            Seu pedido de saque foi recebido e será processado em até 24 horas úteis.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Info */}
          <div className="bg-[#141422] border border-white/[0.05] rounded-[20px] p-6 text-center">
             <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest block mb-2">Saldo Disponível</span>
             <p className="text-4xl font-bold text-[#4ade80] tracking-tighter">
               R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </p>
          </div>

          <div className="space-y-4">
             {error && (
               <div className="p-4 rounded-xl bg-[#ef44440a] border border-[#ef444433] text-[#ef4444] text-xs font-medium animate-in slide-in-from-top-2">
                 {error}
               </div>
             )}

             <div className="space-y-2">
               <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Valor do Saque (R$)</label>
               <Input 
                 type="number" 
                 placeholder="0,00" 
                 className="text-lg font-bold h-12"
                 value={amount || ""} 
                 onChange={e => setAmount(Number(e.target.value))}
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3">
               <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Tipo</label>
                 <Select 
                   value={pixKeyType}
                   onChange={setPixKeyType}
                   options={[
                     { label: "CPF", value: "CPF" },
                     { label: "CNPJ", value: "CNPJ" },
                     { label: "E-mail", value: "EMAIL" },
                     { label: "Telefone", value: "PHONE" },
                     { label: "Aleatória", value: "RANDOM" },
                   ]}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Chave PIX</label>
                 <Input 
                   placeholder="Informe sua chave" 
                   value={pixKey} 
                   onChange={e => setPixKey(e.target.value)}
                   className="h-10"
                 />
               </div>
             </div>
          </div>

          {/* Calculations Card */}
          <div className="bg-[#141422] border border-white/[0.05] rounded-[16px] p-4 space-y-3">
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#64748b]">Valor solicitado:</span>
                <span className="text-[#f1f5f9] font-medium">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
             </div>
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#64748b]">Taxa de saque:</span>
                <span className="text-[#ef4444] font-medium">- R$ {withdrawalFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
             </div>
             <div className="h-px bg-white/[0.05] my-1" />
             <div className="flex justify-between items-center">
                <span className="text-[14px] font-bold text-[#f1f5f9]">Você receberá:</span>
                <div className="text-right">
                  <p className="text-[18px] font-bold text-[#4ade80]">
                    R$ {netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-[#64748b] uppercase tracking-widest font-bold">Transferência PIX</p>
                </div>
             </div>
          </div>

          <Button 
            className="w-full h-12 text-base font-bold gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white" 
            onClick={handleSubmit} 
            isLoading={loading}
            disabled={amount < 30 || amount > available}
          >
            Confirmar Saque
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 justify-center py-1">
             <div className="flex -space-x-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
               <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] opacity-40" />
             </div>
             <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-[0.2em]">Processamento Prioritário PulsePay</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
