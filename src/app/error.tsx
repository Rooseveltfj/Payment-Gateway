"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030507] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full" />
        <AlertCircle className="w-24 h-24 text-red-500 relative z-10" />
      </div>

      <div className="space-y-4 max-w-md relative z-10">
        <h1 className="text-3xl font-black tracking-tighter text-white">Algo deu errado.</h1>
        <p className="text-text-secondary leading-relaxed">
          Ocorreu um erro inesperado no sistema. Nossa equipe técnica já foi notificada.
        </p>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs font-mono text-red-400 break-all">
          {error.message || "INTERNAL_SYSTEM_ERROR"}
        </div>
      </div>

      <div className="mt-12 flex gap-4">
        <Button onClick={() => reset()} className="gap-2 h-12 px-8 rounded-2xl">
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}
