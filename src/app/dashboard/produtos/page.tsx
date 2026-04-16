"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, PackageX, Search, Filter } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, []);

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/products/${id}/duplicate`, { method: "POST" });
    if(res.ok) {
       const newList = await fetch("/api/products").then(r => r.json());
       setProducts(newList.products || []);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name as string).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Meus produtos</h1>
          <p className="text-sm text-text-secondary mt-1">Gerencie seu catálogo e checkouts.</p>
        </div>
        <Link href="/dashboard/produtos/novo">
          <Button className="w-full sm:w-auto font-semibold shadow-md gap-2" variant="default">
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      {products.length > 0 && (
        <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg overflow-x-auto">
           <div className="relative w-full max-w-sm shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input 
                 placeholder="Buscar produto por nome..." 
                 className="pl-9 h-9"
                 value={search}
                 onChange={e => setSearch(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-9 gap-2 shrink-0">
              <Filter className="h-4 w-4" />
              Filtros
           </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="h-72 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredProducts.map(product => (
             <ProductCard 
                key={product.id as string} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                product={product as any} 
                onDuplicate={handleDuplicate}
             />
           ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl py-24 text-center px-4">
           <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center mb-6">
              <PackageX className="h-10 w-10 text-primary" />
           </div>
           <h3 className="text-lg font-bold text-text-primary">Nenhum produto encontrado</h3>
           <p className="text-text-secondary max-w-sm mt-2 mb-6">
              Você ainda não possui produtos ativos neste filtro ou catálogo. Crie o seu primeiro checkout e comece a vender.
           </p>
           <Link href="/dashboard/produtos/novo">
             <Button className="font-semibold px-8" variant="default">Criar produto</Button>
           </Link>
        </div>
      )}
    </div>
  );
}
