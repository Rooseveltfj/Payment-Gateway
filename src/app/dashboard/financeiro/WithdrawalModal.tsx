"use client";

import { useState } from "react";
import { X, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface WithdrawalModalProps {
  available: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function WithdrawalModal({ available, onClose, onSuccess }: WithdrawalModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("CPF");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fee = 3.50 + (amount * 0.05);
  const netAmount = Math.max(0, amount - fee);

  const handleSubmit = async () => {
    if (amount < 30) return setError("Valor mínimo de saque é R$ 30,00");
    if (amount > available) return setError("Saldo disponível insuficiente");
    if (!pixKey) return setError("Preencha sua chave PIX");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/financial/withdrawal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, pixKey, pixKeyType })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao solicitar saque");

      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-bold text-text-primary">Solicitar Saque</h3>
            <p className="text-sm text-text-secondary mt-1">Disponível: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(available)}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="h-20 w-20 bg-success/20 text-success mx-auto rounded-full flex items-center justify-center mb-6 ring-4 ring-success/10">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Solicitação Enviada!</h2>
            <p className="text-text-secondary mt-2 leading-relaxed">
              Recebemos seu pedido de saque. O valor será enviado para sua chave PIX em até 24 horas úteis.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-sm flex items-center gap-3">
                 <X className="h-4 w-4" />
                 {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Valor para sacar (R$)</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">R$</span>
                   <Input 
                     type="number" 
                     className="pl-10 text-lg font-bold" 
                     placeholder="0,00" 
                     value={amount || ""} 
                     onChange={e => setAmount(Number(e.target.value))}
                   />
                </div>
              </div>

              {/* PIX Keys */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Tipo de Chave</label>
                    <select 
                      className="w-full flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary"
                      value={pixKeyType}
                      onChange={e => setPixKeyType(e.target.value)}
                    >
                      <option value="CPF">CPF</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="PHONE">Telefone</option>
                      <option value="RANDOM">Chave Aleatória</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Chave PIX</label>
                    <Input 
                      placeholder="Sua chave aqui" 
                      value={pixKey} 
                      onChange={e => setPixKey(e.target.value)}
                    />
                 </div>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-background rounded-2xl p-4 border border-border/50 space-y-3">
               <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Valor do saque:</span>
                  <span className="text-text-primary font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Taxa de saque (3,50 + 5%):</span>
                  <span className="text-error font-medium">-{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount > 0 ? fee : 0)}</span>
               </div>
               <div className="h-px bg-border/50 my-1" />
               <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-text-primary">Você receberá:</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-success">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount > 0 ? netAmount : 0)}</p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Crédito via PIX</p>
                  </div>
               </div>
            </div>

            <Button 
              className="w-full h-12 text-base font-bold gap-2" 
              onClick={handleSubmit} 
              disabled={loading || amount < 30 || amount > available}
            >
              {loading ? "Processando..." : (
                <>
                  Confirmar Saque
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 justify-center py-2">
               <span className="h-1.5 w-1.5 rounded-full bg-success" />
               <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Processamento imediato</span>
            </div>
          </div>
        ) }
      </div>
    </div>
  );
}
