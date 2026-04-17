import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { VerificationForm } from "@/components/auth/VerificationForm";
import { Loader2 } from "lucide-react";

export default function VerifyPage() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-bg-void overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 grid-dots opacity-20" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center space-y-8">
        {/* Logo Link */}
        <Link href="/" className="hover:scale-105 transition-transform duration-300">
          <Image 
            src="/assets/logo-png.png" 
            alt="PulsePay Logo" 
            width={180} 
            height={48} 
            className="w-auto h-12 object-contain"
          />
        </Link>

        {/* Form area with Suspense for useSearchParams */}
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        }>
          <VerificationForm />
        </Suspense>

        {/* Footer info */}
        <div className="text-center space-y-4">
          <p className="text-sm text-text-muted font-bold uppercase tracking-[0.2em]">
            © 2024 PulsePay. Segurança Garantida.
          </p>
          <Link href="/login" className="block text-xs text-accent font-bold uppercase tracking-widest hover:underline transition-all">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </main>
  );
}
