"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { 
  User, 
  CreditCard, 
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Mail,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, BadgeStatus } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  createdAt: string;
}

export function TransactionDetailModal({ orderId, onClose, onRefund }: Props) {
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/transactions/${orderId}`)
      .then(r => r.json())
      .then(d => setData(d.transaction))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading || !data) {
    return (
      <Modal isOpen={true} onClose={onClose}>
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
        </div>
      </Modal>
    )
  }

  const t = data;
  const history = t.statusHistory || [];
  const status = t.status.toLowerCase() as BadgeStatus;

  const formattedDate = format(new Date(t.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="640px">
      {/* Custom Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          <h2 className="text-[18px] font-semibold text-[#f1f5f9]">Detalhes do Pedido</h2>
          <span className="px-2 py-0.5 rounded-full bg-[#8b5cf61a] border border-[#8b5cf633] text-[#a78bfa] text-[12px] font-mono font-medium">
            #{t.id.slice(-8).toUpperCase()}
          </span>
        </div>
        <p className="text-[14px] text-[#64748b]">
          {formattedDate}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6">
        {/* Left Column: Buyer Data */}
        <div className="space-y-6">
          <div className="bg-[#141422] border border-white/[0.05] rounded-[12px] p-4">
            <h4 className="flex items-center gap-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-4">
              <User className="w-3.5 h-3.5" /> DADOS DO COMPRADOR
            </h4>
            
            <div className="space-y-3">
              <DataRow label="Nome" value={t.buyerName} />
              <DataRow label="E-mail" value={t.buyerEmail} icon={<Mail className="w-3 h-3" />} />
              <DataRow label="CPF" value={t.buyerCpf} />
              <DataRow label="Telefone" value={t.buyerPhone} icon={<Smartphone className="w-3 h-3" />} />
              
              {/* Dynamic Buyer Data */}
              {Object.entries(t.buyerData || {}).map(([key, val]) => (
                <DataRow key={key} label={key.replace(/_/g, ' ')} value={String(val)} />
              ))}
            </div>
          </div>

          {/* Bottom Card: Payment */}
          <div className="bg-[#141422] border border-white/[0.05] rounded-[12px] p-4">
            <h4 className="flex items-center gap-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-4">
              <CreditCard className="w-3.5 h-3.5" /> PAGAMENTO
            </h4>
            
            <div className="space-y-3">
              <DataRow label="Produto" value={t.product.name} valueClassName="text-[#a78bfa]" />
              <DataRow label="Método" value={t.paymentMethod} />
              <DataRow label="Parcelas" value={`${t.installments}x`} />
              
              <div className="pt-3 mt-3 border-t border-white/[0.05]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-bold text-[#f1f5f9]">Total Pago</span>
                  <span className="text-[18px] font-bold text-[#f1f5f9]">
                    R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#64748b] italic">Comissão Líquida</span>
                  <span className="text-[14px] font-bold text-[#4ade80]">
                    R$ {t.netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status and Timeline */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-[#141422] border border-white/[0.05] rounded-[12px]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.1em] mb-3">Status Atual</span>
            <Badge status={status === 'chargeback' ? 'failed' : status} className="scale-125 my-1" />
          </div>

          <div className="flex-1 space-y-5 px-2">
            <h4 className="flex items-center gap-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" /> HISTÓRICO
            </h4>

            <div className="space-y-6 relative ml-2">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/[0.05]" />

              {history.map((item, idx) => (
                <div key={idx} className="relative pl-6 flex flex-col gap-0.5">
                  <div className={cn(
                    "absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#0f0f1a] flex items-center justify-center",
                    item.status === 'PAID' ? "bg-[#22c55e]" : "bg-[#1f1f2e]"
                  )}>
                    {item.status === 'PAID' && <CheckCircle2 className="w-2 h-2 text-white" />}
                  </div>
                  <span className="text-[13px] font-medium text-[#f1f5f9]">{item.label}</span>
                  <span className="text-[10px] text-[#64748b]">
                    {format(new Date(item.date), "dd/MM - HH:mm", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/[0.05]">
        <Button variant="ghost" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
          Email Manual
        </Button>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}

function DataRow({ 
  label, 
  value, 
  icon, 
  valueClassName 
}: { 
  label: string; 
  value?: string; 
  icon?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[13px]">
      <span className="text-[#64748b] capitalize min-w-[100px]">{label}:</span>
      <span className={cn(
        "font-medium text-[#f1f5f9] flex items-center gap-1.5 text-right",
        !value && "italic text-[#334155]",
        valueClassName
      )}>
        {value || "Não informado"}
        {value && icon && <span className="opacity-50">{icon}</span>}
      </span>
    </div>
  );
}
