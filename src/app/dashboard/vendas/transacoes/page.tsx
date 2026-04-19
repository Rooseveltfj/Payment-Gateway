"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  CreditCard,
  QrCode,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge, BadgeStatus } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { cn } from "@/lib/utils";

interface TransactionData {
  id: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  product: { name: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [method, setMethod] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [selectedTx, setSelectedTx] = useState<TransactionData | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/transactions?page=${page}&status=${status}&method=${method}&search=${search}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { pages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, method]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const columns = useMemo<Column<TransactionData>[]>(() => [
    {
      header: "# Código",
      accessor: (t) => (
        <span className="text-[13px] font-mono text-[#8b5cf6] font-medium tracking-tight">
          #{t.id.slice(-6).toUpperCase()}
        </span>
      ),
      width: "100px"
    },
    {
      header: "Produto",
      accessor: (t) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#f1f5f9]">{t.product.name}</span>
          <span className="text-[12px] text-[#64748b]">Produto Digital</span>
        </div>
      )
    },
    {
      header: "Comprador",
      accessor: (t) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#f1f5f9]">{t.buyerName}</span>
          <span className="text-[11px] text-[#64748b]">{t.buyerEmail}</span>
        </div>
      )
    },
    {
      header: "Método",
      accessor: (t) => <MethodLabel method={t.paymentMethod} />
    },
    {
      header: "Valor",
      className: "text-right",
      accessor: (t) => (
        <span className="font-bold text-[#f1f5f9]">R$ {(t.amount || 0).toFixed(2)}</span>
      )
    },
    {
      header: "Net",
      className: "text-right",
      accessor: (t) => (
        <span className="font-bold text-[#4ade80]">R$ {(t.netAmount || 0).toFixed(2)}</span>
      )
    },
    {
      header: "Status",
      className: "text-center",
      accessor: (t) => {
        const s = t.status.toLowerCase() as BadgeStatus;
        return <Badge status={s === 'abandoned' ? 'inactive' : s} />
      }
    },
    {
      header: "Ação",
      className: "text-right",
      accessor: (t) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="hover:text-[#8b5cf6] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTx(t);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ], []);

  const exportToCSV = () => {
    const headers = ["ID", "Produto", "Comprador", "Email", "Metodo", "Valor", "Comissao", "Status", "Data"];
    const rows = transactions.map((t: TransactionData) => [
      t.id,
      t.product.name,
      t.buyerName,
      t.buyerEmail,
      t.paymentMethod,
      t.amount,
      t.platformFee,
      t.status,
      new Date(t.createdAt).toLocaleString("pt-BR")
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vendas_PulsePay_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-[700] font-syne text-[#f1f5f9] tracking-tight">
            Vendas e Transações
          </h1>
          <p className="text-[14px] text-[#64748b] mt-1">
            Gerencie todos os pedidos e pagamentos em tempo real.
          </p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={exportToCSV} disabled={loading}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <Card padding={0} className="overflow-hidden bg-[#0f0f1a]/50 border-white/[0.05]">
        <div className="flex flex-col lg:flex-row gap-4 p-5">
          <form onSubmit={handleSearch} className="flex-1">
             <Input 
               placeholder="Buscar por nome, e-mail ou código..." 
               prefix={<Search className="h-4 w-4" />}
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
          </form>
          <div className="flex flex-wrap gap-2 lg:w-[480px]">
             <div className="flex-1 min-w-[140px]">
               <Select 
                 value={status}
                 onChange={(val) => { setStatus(val); setPage(1); }}
                 options={[
                   { label: "Todos os Status", value: "ALL" },
                   { label: "Pendente", value: "PENDING" },
                   { label: "Pago", value: "PAID" },
                   { label: "Falhou", value: "FAILED" },
                   { label: "Estornado", value: "REFUNDED" },
                 ]}
               />
             </div>
             <div className="flex-1 min-w-[140px]">
               <Select 
                 value={method}
                 onChange={(val) => { setMethod(val); setPage(1); }}
                 options={[
                   { label: "Todos os Métodos", value: "ALL" },
                   { label: "PIX", value: "PIX" },
                   { label: "Cartão", value: "CREDIT_CARD" },
                   { label: "Boleto", value: "BOLETO" },
                 ]}
               />
             </div>
             <Button variant="primary" size="sm" onClick={fetchTransactions} isLoading={loading}>
               Filtrar
             </Button>
          </div>
        </div>
      </Card>

      {/* Table Area */}
      <DataTable 
        columns={columns} 
        data={transactions} 
        loading={loading}
        onRowClick={(t) => setSelectedTx(t)}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-[#64748b] font-medium">Página {page} de {pagination.pages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {selectedTx && (
        <TransactionDetailModal 
          orderId={selectedTx.id} 
          onClose={() => setSelectedTx(null)} 
          onRefund={fetchTransactions}
        />
      )}
    </div>
  );
}

function MethodLabel({ method }: { method: string }) {
  const icons: Record<string, { icon: JSX.Element, label: string }> = {
    PIX: { 
      icon: <QrCode className="h-3.5 w-3.5 text-[#22c55e]" />, 
      label: "PIX" 
    },
    CREDIT_CARD: { 
      icon: <CreditCard className="h-3.5 w-3.5 text-[#8b5cf6]" />, 
      label: "Cartão" 
    },
    BOLETO: { 
      icon: <FileText className="h-3.5 w-3.5 text-[#eab308]" />, 
      label: "Boleto" 
    }
  };
  
  const config = icons[method] || { 
    icon: <FileText className="h-3.5 w-3.5" />, 
    label: method 
  };

  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-md bg-white/[0.03]">
        {config.icon}
      </div>
      <span className="text-[14px] text-[#f1f5f9] font-medium">{config.label}</span>
    </div>
  );
}
