"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { 
  User, 
  Mail, 
  CreditCard, 
  Smartphone, 
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  orderId: string;
  onClose: () => void;
  onRefund: () => void;
}

interface TransactionHistoryEntry {
  status: string;
  label: string;
  date: string;
}

interface TransactionData {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerCpf?: string;
  buyerPhone?: string;
  buyerData: Record<string, unknown>;
  paymentMethod: string;
  amount: number;
  netAmount: number;
  installments: number;
  status: string;
  statusHistory: TransactionHistoryEntry[];
  product: { id: string; name: string };
}

export function TransactionDetailModal({ orderId, onClose, onRefund }: Props) {
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/transactions/${orderId}`)
      .then(r => r.json())
      .then(d => setData(d.transaction))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleRefund = async () => {
    if (!confirm("Tem certeza que deseja estornar esta venda? O valor será debitado do seu saldo.")) return;
    setRefunding(true);
    try {
      const res = await fetch(`/api/dashboard/transactions/${orderId}/refund`, { method: "POST" });
      if (res.ok) {
        onRefund();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao estornar");
      }
    } catch {
      alert("Erro de rede");
    } finally {
      setRefunding(false);
    }
  };

  if (loading) return null;

  const t = data!;
  const history = t.statusHistory || [];

  return (
    <Modal isOpen={true} onClose={onClose} title={`Detalhes do Pedido #${t.id.slice(-6).toUpperCase()}`} size="xl">
      <div className="flex flex-col lg:flex-row gap-8 p-1">
        
        {/* Left: Info */}
        <div className="flex-1 space-y-6">
          
          {/* Section: Buyer */}
          <section className="space-y-4">
             <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4" /> Dados do Comprador
             </h4>
             <div className="bg-background/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary">Nome:</span>
                   <span className="font-bold text-text-primary">{t.buyerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary">E-mail:</span>
                   <span className="font-bold text-text-primary flex items-center gap-1">
                      {t.buyerEmail} <Mail className="h-3 w-3 opacity-50 capitalize" />
                   </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary">CPF:</span>
                   <span className="font-medium text-text-primary">{t.buyerCpf || "Não informado"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary">Telefone:</span>
                   <span className="font-medium text-text-primary flex items-center gap-1">
                      {t.buyerPhone || "Não informado"} <Smartphone className="h-3 w-3 opacity-50" />
                   </span>
                </div>
                {/* Custom Fields */}
                {Object.keys(t.buyerData || {}).length > 0 && (
                  <div className="pt-2 mt-2 border-t border-border/50 space-y-2">
                    {Object.entries(t.buyerData).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start text-xs">
                        <span className="text-text-secondary capitalize">{key}:</span>
                        <span className="font-medium text-text-primary text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </section>

          {/* Section: Product & Payment */}
          <section className="space-y-4">
             <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Pagamento
             </h4>
             <div className="bg-background/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary">Produto:</span>
                   <span className="font-bold text-primary">{t.product.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary">Método:</span>
                   <span className="font-bold text-text-primary">{t.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary">Parcelas:</span>
                   <span className="font-bold text-text-primary">{t.installments}x</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                   <span className="text-sm font-bold text-text-primary">Total Pago:</span>
                   <span className="text-xl font-black text-text-primary">R$ {t.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs opacity-70">
                   <span className="text-text-secondary italic">Comissão Líquida:</span>
                   <span className="font-bold text-success">R$ {t.netAmount.toFixed(2)}</span>
                </div>
             </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
             <Button variant="outline" className="flex-1 gap-2" onClick={() => alert("Função em desenvolvimento")}>
                <Send className="h-4 w-4" /> Email Manual
             </Button>
             {t.status === "PAID" && (
                <Button variant="outline" className="flex-1 gap-2 text-error border-error/30 hover:bg-error/10" onClick={handleRefund} disabled={refunding}>
                   {refunding ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Estornar
                </Button>
             )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="w-full lg:w-72 border-l border-border pl-8 relative">
           <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-8 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Histórico
           </h4>
           
           <div className="space-y-8 relative">
              {/* Vertical line connector */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/50" />

              {history.map((step, idx: number) => (
                <div key={idx} className="relative flex gap-4 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className={cn(
                    "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2",
                    step.status === "PAID" ? "bg-success border-success text-white shadow-lg shadow-success/20" : "bg-card border-border text-text-secondary"
                  )}>
                    {step.status === "PAID" ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text-primary leading-tight">{step.label}</h5>
                    <p className="text-[10px] text-text-secondary mt-0.5">{new Date(step.date).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              ))}
           </div>

           {/* Current Status Banner */}
           <div className={cn(
             "mt-12 p-4 rounded-2xl border text-center",
             t.status === "PAID" ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"
           )}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-1 opacity-50">Status Atual</span>
              <p className={cn("text-lg font-black", t.status === "PAID" ? "text-success" : "text-warning")}>{t.status}</p>
           </div>
        </div>
      </div>
    </Modal>
  );
}
