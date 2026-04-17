"use client";

import { useState } from "react";
import { Copy, Edit, Trash, Play, CopyPlus } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    } catch {
      // Revert on error
      setIsActive(!checked);
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
    router.push(`/dashboard/produtos/${product.id}/checkout`);
  };

  const statusVariant = isActive ? "success" : "secondary";

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
      style={{
        background: "#111113",
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Image Cover */}
      <div className="relative h-40 w-full bg-background/50 border-b border-border flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="text-text-secondary/50 flex flex-col items-center">
            <span className="text-sm font-medium">Sem capa</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={statusVariant} className="shadow-sm backdrop-blur-md">
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 bg-black/50 rounded flex items-center shadow-sm backdrop-blur-md">
          <DropdownMenu>
            <DropdownMenuItem icon={Edit} onClick={handleEdit}>Editar</DropdownMenuItem>
            <DropdownMenuItem icon={Play} onClick={handleViewCheckout}>Ver checkout</DropdownMenuItem>
            <DropdownMenuItem icon={Copy} onClick={handleCopyLink}>Copiar link</DropdownMenuItem>
            <DropdownMenuItem icon={CopyPlus} onClick={() => onDuplicate?.(product.id)}>Duplicar</DropdownMenuItem>
            <div className="my-1 h-px bg-border mx-2" />
            <DropdownMenuItem icon={Trash} danger onClick={() => onDelete?.(product.id)}>Excluir</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-base font-bold text-text-primary line-clamp-1" title={product.name}>
              {product.name}
            </h3>
            <p className="text-xs text-text-secondary font-medium mt-0.5">
              {TYPE_MAP[product.type] || product.type}
            </p>
          </div>
          <div className="text-right shrink-0">
             <p className="text-sm font-bold text-primary">
               {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
             </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border/50">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Vendas</p>
            <p className="text-sm font-semibold text-text-primary">{product.salesCount.toLocaleString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Receita gerada</p>
            <p className="text-sm font-semibold text-success">
               {product.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 flex items-center justify-between border-t border-border">
          <span className="text-xs text-text-secondary font-medium">Status no checkout</span>
          <Switch 
            checked={isActive} 
            onCheckedChange={toggleStatus} 
            disabled={isUpdating}
          />
        </div>
      </div>
    </div>
  );
}
