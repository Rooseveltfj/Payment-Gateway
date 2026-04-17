"use client";

import { useState, useRef, useEffect } from "react";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { Loader2, ShieldCheck, RefreshCcw } from "lucide-react";

export function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasteData = value.substring(0, 6).split("");
      const newCode = [...code];
      pasteData.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      
      const lastIndex = Math.min(index + pasteData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast.error("Por favor, insira o código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Código inválido ou expirado.");
        return;
      }

      toast.success("Conta verificada com sucesso! Redirecionando...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      toast.error("Erro ao verificar código.");
    } finally {
      setIsLoading(false);
    }
  }, [code, email, router]);

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao reenviar código.");
        return;
      }

      toast.success("Novo código enviado para seu e-mail.");
      setResendTimer(60);
    } catch {
      toast.error("Erro ao reenviar e-mail.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (code.every(digit => digit !== "")) {
      handleVerify();
    }
  }, [code, handleVerify]);

  return (
    <Card className="w-full max-w-md p-8 bg-bg-card/50 backdrop-blur-xl border-accent/20 shadow-[0_0_50px_rgba(191,0,255,0.1)]">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(191,0,255,0.2)]">
          <ShieldCheck className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white uppercase italic tracking-tight">Verifique sua conta</h1>
          <p className="text-sm text-text-secondary">
            Enviamos um código de 6 dígitos para <br />
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="w-full space-y-8">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
                className="w-12 h-14 text-center text-xl font-bold bg-bg-void border border-white/5 rounded-xl text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all uppercase"
                whileFocus={{ scale: 1.05 }}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-accent hover:bg-accent/90 text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(191,0,255,0.3)]"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verificar Código"}
          </Button>
        </form>

        <div className="flex flex-col items-center space-y-4 pt-4 border-t border-white/5 w-full">
          <button 
            onClick={handleResend}
            disabled={resendTimer > 0 || isLoading}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : "Não recebeu o código? Reenviar"}
          </button>
        </div>
      </div>
    </Card>
  );
}
