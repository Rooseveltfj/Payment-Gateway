"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name as string).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-[700] font-syne text-[#f1f5f9] tracking-tight">
            Meus Produtos
          </h1>
          <p className="text-[14px] text-[#64748b] mt-1">
            Gerencie seu catálogo de ofertas e checkouts personalizados.
          </p>
        </div>
        <Link href="/dashboard/produtos/novo" className="shrink-0">
          <Button variant="primary" className="gap-2 h-11 px-6 font-bold">
            <Plus className="h-5 w-5" />
            Novo produto
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      {products.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
             <Input 
               placeholder="Buscar produto por nome..." 
               className="pl-10 h-11"
               value={search}
               onChange={e => setSearch(e.target.value)}
               prefix={<Search className="h-4 w-4" />}
             />
          </div>
          <Button variant="secondary" className="h-11 gap-2 shrink-0 border-white/[0.05]">
             <SlidersHorizontal className="h-4 w-4" />
             Filtros
          </Button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="h-[340px] rounded-[16px] bg-[#0f0f1a] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDuplicate={handleDuplicate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-20 pb-20">
          <Card className="max-w-[480px] w-full p-12 flex flex-col items-center text-center bg-[#0f0f1a] border-white/[0.05] rounded-[24px]">
             <div className="h-16 w-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-white/10" />
             </div>
             <h3 className="text-xl font-bold text-[#f1f5f9]">Nenhum produto criado</h3>
             <p className="text-[#64748b] mt-2 mb-8 leading-relaxed">
                Você ainda não possui produtos ativos no seu catálogo. Crie o seu primeiro checkout e comece a faturar hoje.
             </p>
             <Link href="/dashboard/produtos/novo" className="w-full">
               <Button variant="primary" className="w-full h-12 font-bold gap-2">
                 <Plus className="h-5 w-5" />
                 Criar primeiro produto
               </Button>
             </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
