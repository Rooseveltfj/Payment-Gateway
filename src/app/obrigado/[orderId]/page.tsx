import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Clock, XCircle, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { CheckoutConfig } from "@/types/checkout-config";

export default async function ThankYouPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true }
  });

  if (!order) {
    notFound();
  }

  const config = (order.product.checkoutConfig as unknown as CheckoutConfig) || null;
  const status = order.status;

  const isPaid = status === "PAID";
  const isPending = status === "PENDING";
  const isFailed = status === "FAILED";

  const upsell = config?.bumpUpsell?.upsell;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Status Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {isPaid ? (
              <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center border-2 border-success/30 shadow-[0_0_40px_rgba(22,163,74,0.2)]">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            ) : isPending ? (
              <div className="h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-amber-500/30">
                <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-error/20 flex items-center justify-center border-2 border-error/30">
                <XCircle className="h-10 w-10 text-error" />
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isPaid ? "Pagamento Confirmado!" : isPending ? "Aguardando Pagamento" : "Falha no Pagamento"}
          </h1>
          <p className="text-zinc-400">
            {isPaid 
              ? "Seu acesso foi liberado com sucesso. Confira seu e-mail." 
              : isPending 
                ? "Estamos aguardando a confirmação do seu banco." 
                : "Houve um problema ao processar seu pagamento."}
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-zinc-400" />
             </div>
             <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">Resumo do Pedido</p>
                <p className="font-semibold">{order.product.name}</p>
             </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Valor Total</span>
              <span className="font-bold">R$ {order.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Método de Pagamento</span>
              <span className="font-bold uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">ID da Transação</span>
              <span className="font-mono text-zinc-400 text-xs">{order.id}</span>
            </div>
          </div>
        </div>

        {/* Upsell Section */}
        {isPaid && upsell?.enabled && (
           <div className="bg-indigo-600 rounded-3xl p-8 space-y-6 shadow-[0_0_50px_rgba(79,70,229,0.3)] relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 blur-3xl rounded-full" />
              
              <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase tracking-widest">
                 <ShieldCheck className="h-4 w-4" />
                 Oferta Exclusiva para Você
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black italic">ESPERE! NÃO FECHE A PÁGINA AINDA.</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Temos uma oportunidade única que vai acelerar seus resultados em 10x. 
                  Esta oferta expira em instantes e não aparecerá novamente.
                </p>
              </div>

              <a 
                href={upsell.url}
                className="flex items-center justify-center gap-2 w-full h-14 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl group-hover:scale-[1.02]"
              >
                QUERO APROVEITAR AGORA
                <ArrowRight className="h-5 w-5" />
              </a>

              <p className="text-center text-[10px] text-indigo-300">
                Ao clicar você será redirecionado para a página da oferta.
              </p>
           </div>
        )}

        {/* Success Instructions */}
        {isPaid && !upsell?.enabled && (
          <div className="text-center space-y-6 pt-4">
            <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl">
              <p className="text-sm font-medium">O link de acesso foi enviado para o e-mail:</p>
              <p className="text-primary font-bold">{order.buyerEmail}</p>
            </div>
            <button className="w-full h-14 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all">
              IR PARA ÁREA DE MEMBROS
            </button>
          </div>
        )}

        {/* Failed Action */}
        {isFailed && (
          <button className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all">
            TENTAR PAGAMENTO NOVAMENTE
          </button>
        )}

        <p className="text-center text-xs text-zinc-600 pt-8">
          Black Gate Payments &copy; 2026. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
