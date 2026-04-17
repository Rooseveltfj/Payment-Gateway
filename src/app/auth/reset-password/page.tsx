"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <ShieldCheck className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase italic">Link Inválido</h2>
        <p className="text-sm text-white/50">O token de acesso não foi encontrado ou é inválido.</p>
        <Link 
          href="/auth/forgot-password"
          className="block w-full h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight italic uppercase">
          REDEFINIR SENHA
        </h1>
        <p className="text-sm text-white/50">
          Crie uma nova credencial segura para seu acesso.
        </p>
      </div>

      {success ? (
        <div className="space-y-6 flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-center text-white/70 leading-relaxed italic">
            Sua senha foi atualizada com sucesso!<br/>Você será redirecionado em instantes...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-12 text-sm text-white focus:outline-none focus:border-[#A020F0]/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#A020F0]/50"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#A020F0] hover:bg-[#A020F0e0] text-black font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(160,32,240,0.3)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ATUALIZAR SENHA"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 sm:p-10 overflow-hidden" style={{ background: '#05060a' }}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A020F015] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#A020F010] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center space-y-8">
        {/* Logo */}
        <Link href="/" className="hover:scale-105 transition-transform duration-300">
          <Image src="/assets/logo-png.png" alt="PulsePay Logo" width={180} height={48} className="w-auto h-12 object-contain" />
        </Link>

        {/* Card */}
        <div className="w-full bg-[#0a0b11]/80 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[32px] shadow-2xl relative group">
          <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#A020F0]" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
        
        <p className="text-[11px] text-white/20 font-medium uppercase tracking-[0.2em]">
          &copy; 2024 PulsePay. Security First Infrastructure.
        </p>
      </div>
    </div>
  );
}
