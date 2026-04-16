"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingCart, 
  Send, 
  Clock, 
  User, 
  ShoppingBag, 
  AlertCircle,
  TrendingUp,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AbandonedCart {
  id: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  createdAt: string;
  product: { name: string };
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState({ abandonedCount: 0, abandonmentRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarts = async () => {
      setLoading(true);
      const res = await fetch("/api/dashboard/clients/abandoned");
      const data = await res.json();
      setCarts(data.abandonedCarts || []);
      setStats(data.stats || { abandonedCount: 0, abandonmentRate: 0 });
      setLoading(false);
    };
    fetchCarts();
  }, []);

  const handleSendReminder = (id: string) => {
    alert(`Lembrete enviado para o pedido #${id.slice(-6).toUpperCase()}! (Simulação)`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight italic uppercase">Carrinhos Abandonados</h1>
          <p className="text-sm text-text-secondary mt-1">Recupere suas vendas perdidas enviando lembretes diretos.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <StatsCard 
           label="Taxa de Abandono (30 dias)" 
           value={`${stats.abandonmentRate}%`} 
           desc="Visitantes que iniciaram mas não pagaram"
           icon={TrendingUp}
           color="error"
         />
         <StatsCard 
           label="Abatidos para recuperar" 
           value={stats.abandonedCount.toString()} 
           desc="Pedidos pendentes há mais de 1 hora"
           icon={ShoppingCart}
           color="warning"
         />
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
         <div className="p-6 border-b border-border bg-background/30 flex items-center justify-between">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
               <Clock className="h-4 w-4 text-warning" /> 
               Tentativas de compra recentes
            </h3>
            <span className="text-[10px] font-black bg-warning/10 text-warning px-2 py-1 rounded-md border border-warning/20">AÇÃO NECESSÁRIA</span>
         </div>

         <div className="divide-y divide-border/50">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card animate-pulse" />)
            ) : carts.length > 0 ? (
              carts.map((cart: AbandonedCart) => (
                <div key={cart.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-hover/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                         <User className="h-5 w-5" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-primary">{cart.buyerName || "Cliente Interessado"}</span>
                            <span className="text-[10px] text-text-secondary opacity-50 px-1.5 border border-border rounded">#{cart.id.slice(-6).toUpperCase()}</span>
                         </div>
                         <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-1">
                            <Mail className="h-3 w-3" />
                            {cart.buyerEmail}
                         </p>
                         <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                               {cart.product.name}
                            </span>
                            <span className="text-[10px] font-bold text-text-secondary uppercase">
                               R$ {cart.amount.toFixed(2)}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                         <p className="text-xs font-bold text-text-primary">Abandonado em</p>
                         <p className="text-[10px] text-text-secondary">{new Date(cart.createdAt).toLocaleString("pt-BR")}</p>
                      </div>
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-6 shadow-lg shadow-primary/20"
                        onClick={() => handleSendReminder(cart.id)}
                      >
                         <Send className="h-4 w-4" />
                         Enviar Lembrete
                      </Button>
                   </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center">
                 <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-border shadow-inner">
                    <ShoppingBag className="h-10 w-10 text-text-secondary opacity-30" />
                 </div>
                 <h3 className="text-xl font-bold text-text-primary italic">Nenhum abate para agora</h3>
                 <p className="text-sm text-text-secondary max-w-xs mx-auto mt-2 leading-relaxed">
                   Parece que todo mundo está finalizando as compras ou você ainda não tem tentativas registradas.
                 </p>
              </div>
            )}
         </div>
      </div>

      {/* Tip Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
         <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <AlertCircle className="h-6 w-6" />
         </div>
         <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Dica do Black Gate</h4>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed max-w-2xl">
               O envio de lembretes nas primeiras **2 horas** após o abandono aumenta em até **35%** as chances de conversão. Personalize sua abordagem oferecendo um cupom de desconto exclusivo para fechar o negócio.
            </p>
         </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: string;
  desc: string;
  icon: React.ComponentType<{className?: string}>;
  color: 'error' | 'warning' | 'success';
}

function StatsCard({ label, value, desc, icon: Icon, color }: StatsCardProps) {
  const colors: Record<string, string> = {
    error: "bg-error/10 text-error border-error/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    success: "bg-success/10 text-success border-success/20",
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-8 flex justify-between items-start shadow-sm hover:shadow-md transition-all">
       <div className="space-y-2">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{label}</p>
          <div className="flex items-baseline gap-2">
             <span className={cn("text-4xl font-black italic tracking-tighter", color === 'error' ? 'text-error' : color === 'warning' ? 'text-warning' : 'text-text-primary')}>
                {value}
             </span>
          </div>
          <p className="text-xs text-text-secondary">{desc}</p>
       </div>
       <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", colors[color] || "bg-primary/10 text-primary border-primary/20")}>
          <Icon className="h-6 w-6" />
       </div>
    </div>
  );
}
