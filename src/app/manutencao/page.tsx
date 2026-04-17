import { Cog } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#030507] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
        <div className="relative z-10 p-8 rounded-full bg-white/[0.02] border border-white/5">
          <Cog className="w-20 h-20 text-primary animate-[spin_10s_linear_infinite]" />
        </div>
      </div>

      <div className="space-y-6 max-w-xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
          Estamos em Manuteno
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          O PulsePay est passando por uma atualizao programada para melhorar nossa infraestrutura e segurana.
        </p>
        
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
          Retornaremos em alguns minutos
        </div>
      </div>

      <div className="mt-20 flex items-center gap-8 opacity-40 grayscale">
         <img src="/assets/logo-png.png" alt="PulsePay" className="h-8 w-auto" />
      </div>
    </div>
  );
}
