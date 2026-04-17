import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Ghost, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030507] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
        <Ghost className="w-24 h-24 text-primary animate-bounce relative z-10" />
      </div>
      
      <div className="space-y-4 max-w-md relative z-10">
        <h1 className="text-6xl font-black tracking-tighter text-white">404</h1>
        <h2 className="text-2xl font-bold">Oops! Página não encontrada.</h2>
        <p className="text-text-secondary leading-relaxed">
          Parece que o link que você acessou não existe ou foi movido para um novo endereço.
        </p>
      </div>

      <div className="mt-12">
        <Link href="/dashboard">
          <Button className="gap-2 h-12 px-8 rounded-2xl">
            <Home className="w-4 h-4" />
            Voltar para o Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="absolute bottom-8 text-[10px] font-bold text-white/10 tracking-[0.4em] uppercase">
        PulsePay System Error
      </div>
    </div>
  );
}
