"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.email?.[0] || data.error || "Ocorreu um erro inesperado");
      }

      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 sm:p-10 overflow-hidden" style={{ background: '#05060a' }}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A020F015] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#A020F010] rounded-full blur-[120px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center space-y-8">
        {/* Logo */}
        <Link href="/" className="hover:scale-105 transition-transform duration-300">
          <Image 
            src="/assets/logo-png.png" 
            alt="PulsePay Logo" 
            width={180} 
            height={48} 
            className="w-auto h-12 object-contain"
          />
        </Link>

        {/* Card */}
        <div className="w-full bg-[#0a0b11]/80 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[32px] shadow-2xl relative group">
          {/* Neon Border Effect */}
          <div className="absolute inset-[-1px] rounded-[32px] bg-gradient-to-tr from-[#A020F0] via-transparent to-[#A020F0] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />

          <div className="relative space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight italic">
                RECUPERAR CONTA
              </h1>
              <p className="text-sm text-white/50">
                {message ? "Verifique sua caixa de entrada" : "Informa seu e-mail para receber o link de redefinição."}
              </p>
            </div>

            {message ? (
              <div className="space-y-6 flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#A020F015] flex items-center justify-center border border-[#A020F030]">
                  <CheckCircle2 className="w-8 h-8 text-[#A020F0]" />
                </div>
                <p className="text-sm text-center text-white/70 leading-relaxed italic">
                  {message}
                </p>
                <Link 
                  href="/login"
                  className="w-full h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/5"
                >
                  Voltar para o Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">
                    E-mail Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@exemplo.com"
                      required
                      className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#A020F0]/50 focus:bg-white/[0.05] transition-all"
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
                  className="w-full h-12 rounded-xl bg-[#A020F0] hover:bg-[#A020F0e0] text-black font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(160,32,240,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "ENVIAR LINK AGORA"
                  )}
                </button>

                <div className="pt-2">
                  <Link 
                    href="/login"
                    className="flex items-center justify-center space-x-2 text-[13px] text-white/40 hover:text-white transition-colors group"
                  >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    <span>Voltar ao login</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-[11px] text-white/20 font-medium uppercase tracking-[0.2em]">
          &copy; 2024 PulsePay. Segurança End-to-End.
        </p>
      </div>
    </div>
  );
}
