"use client";

import { Paintbrush, LayoutTemplate, Palette } from "lucide-react";

export function CheckoutConfigStep() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 py-12">
      <div className="h-20 w-20 bg-hover rounded-full flex flex-col items-center justify-center relative shadow-inner shadow-black mb-6">
         <Paintbrush className="h-8 w-8 text-primary absolute" />
      </div>
      
      <h2 className="text-2xl font-bold text-text-primary">Checkout Builder</h2>
      <p className="text-text-secondary max-w-md mt-2 mb-8 text-sm">
        Esta seção integrará o módulo de edição interativa da interface de pagamento de acordo com o design especificado no Prompt 5.
      </p>

      {/* Scaffold Preview Boxes */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 border border-border rounded-xl bg-background/50 flex items-center gap-4 text-left shadow-sm">
           <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
             <LayoutTemplate className="h-5 w-5 text-primary" />
           </div>
           <div>
             <h4 className="text-sm font-semibold text-text-primary">Layout Dinâmico</h4>
             <p className="text-xs text-text-secondary mt-1">Configuração de Bump, Order Bump e disposições em tela direita.</p>
           </div>
        </div>

        <div className="p-6 border border-border rounded-xl bg-background/50 flex items-center gap-4 text-left shadow-sm">
           <div className="h-10 w-10 bg-success/20 rounded-lg flex items-center justify-center shrink-0">
             <Palette className="h-5 w-5 text-success" />
           </div>
           <div>
             <h4 className="text-sm font-semibold text-text-primary">Temas Premium</h4>
             <p className="text-xs text-text-secondary mt-1">Modificadores de tipografia, arredondamentos e cores Dark/Light base.</p>
           </div>
        </div>
      </div>
      
      <div className="mt-8 text-xs text-text-secondary border border-border px-4 py-2 rounded-full bg-background/50">
        Pule esta etapa para usar o padrão de alta conversão do sistema.
      </div>
    </div>
  );
}
