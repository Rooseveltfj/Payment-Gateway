"use client";

import { useState } from "react";
import { Copy, Edit, Trash, Play, CopyPlus, Package, MoreVertical } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    type: string;
    status: string;
    salesCount: number;
    revenue: number;
    imageUrl: string | null;
    slug: string;
  };
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const TYPE_MAP: Record<string, string> = {
  SINGLE: "Único",
  SUBSCRIPTION: "Assinatura",
  INSTALLMENT: "Parcelado",
};

export function ProductCard({ product, onDelete, onDuplicate }: ProductCardProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(product.status === "ACTIVE");
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleStatus = async (checked: boolean) => {
    setIsUpdating(true);
    const newStatus = checked ? "ACTIVE" : "INACTIVE";
    setIsActive(checked);
    
    try {
      await fetch(`/api/products/${product.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Checkout ${checked ? 'ativado' : 'desativado'} com sucesso!`);
    } catch {
      setIsActive(!checked);
      toast.error("Erro ao atualizar status");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/c/${product.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleViewCheckout = () => {
    window.open(`/c/${product.slug}`, "_blank");
  };

  const handleEdit = () => {
    router.push(`/dashboard/produtos/${product.id}/editar`);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative flex flex-col rounded-[16px] bg-[#0f0f1a] border border-white/[0.05] transition-all duration-250 hover:border-[#8b5cf633] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Capa Area (160px) - Overflow hidden moved here */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-[16px]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#141428] to-[#0d0d1e] flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 text-white/[0.1]" />
            <span className="text-[12px] font-medium text-white/[0.2]">Sem capa</span>
          </div>
        )}

        {/* Status Badge (Top-Right) */}
        <div className="absolute top-3 right-3 z-10">
          <Badge status={isActive ? 'active' : 'inactive'} />
        </div>
      </div>

      {/* Menu 3 Pontos (Top-Left) - Fixed positioning relative to card to avoid clipping */}
      <div className="absolute top-3 left-3 z-20">
           <DropdownMenu 
             align="left"
             trigger={
               <div className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all border border-white/5 active:scale-90 shadow-lg">
                  <MoreVertical className="h-4 w-4 text-white" />
               </div>
             }
           >
              <DropdownMenuItem icon={Edit} onClick={handleEdit}>Editar produto</DropdownMenuItem>
              <DropdownMenuItem icon={Play} onClick={handleViewCheckout}>Ver checkout</DropdownMenuItem>
              <DropdownMenuItem icon={Copy} onClick={handleCopyLink}>Copiar link</DropdownMenuItem>
              <DropdownMenuItem icon={CopyPlus} onClick={() => onDuplicate?.(product.id)}>Duplicar</DropdownMenuItem>
              <div className="my-1.5 h-px bg-white/[0.05] mx-2" />
              <DropdownMenuItem icon={Trash} danger onClick={() => onDelete?.(product.id)}>Excluir</DropdownMenuItem>
           </DropdownMenu>
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[15px] font-bold text-[#f1f5f9] line-clamp-1 flex-1">
            {product.name}
          </h3>
          <span className="text-[15px] font-bold text-[#f1f5f9] shrink-0">
            R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-[12px] text-[#64748b] mt-1">
          {TYPE_MAP[product.type] || "Único"}
        </p>

        <div className="h-px bg-white/[0.05] my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Vendas</span>
            <span className="text-[20px] font-bold text-[#f1f5f9] tracking-tight">{product.salesCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Receita Gerada</span>
            <span className={cn(
              "text-[14px] font-bold mt-1.5",
              product.revenue > 0 ? "text-[#4ade80]" : "text-[#64748b]"
            )}>
              R$ {product.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/[0.05] my-4" />

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#64748b]">Status no checkout</span>
          <Switch 
            checked={isActive} 
            onCheckedChange={toggleStatus} 
            disabled={isUpdating}
            className="data-[state=checked]:bg-[#8b5cf6]"
          />
        </div>
      </div>
    </motion.div>
  );
}
