"use client";

import { useState } from "react";
import { 
  Search, Filter, ChevronDown, Zap, Clock, 
  TrendingUp, Users, DollarSign, ShoppingBag, 
  LayoutGrid, List as ListIcon 
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MarketplaceProductCard } from "./MarketplaceProductCard";

interface Props {
  initialOffers: any[];
  activeAffiliationsCount: number;
}

export function MarketplaceCatalog({ initialOffers, activeAffiliationsCount }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortType, setSortType] = useState("recent");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "Marketing Digital", label: "Marketing Digital" },
    { value: "Saúde", label: "Saúde" },
    { value: "Finanças", label: "Finanças" },
    { value: "Tecnologia", label: "Tecnologia" },
    { value: "Educação", label: "Educação" },
    { value: "Entretenimento", label: "Entretenimento" },
    { value: "Outros", label: "Outros" },
  ];

  const sortOptions = [
    { value: "recent", label: "Mais Recentes" },
    { value: "commission", label: "Maior Comissão" },
    { value: "sales", label: "Mais Vendidos" },
    { value: "conversion", label: "Melhor Conversão" },
  ];

  // Filtros simples no cliente para MVP
  const filteredOffers = initialOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         offer.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || offer.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Marketplace de Afiliação</h1>
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold rounded-full uppercase tracking-wider">
              {initialOffers.length} Produtos disponíveis
            </span>
          </div>
          <p className="text-[#64748b] text-base font-medium">
            Encontre produtos de alta conversão para divulgar e faturar comissões.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-[#0f0f1a] border border-white/5 rounded-xl flex items-center gap-3">
              <Users className="h-4 w-4 text-purple-400" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider leading-none">Minhas Afiliações</span>
                 <span className="text-[14px] font-bold text-white">{activeAffiliationsCount} ativas</span>
              </div>
           </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#0f0f1a] border border-white/5 rounded-[24px] p-4 lg:p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Busca */}
          <div className="md:col-span-5 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] group-focus-within:text-purple-400 transition-colors" />
            <Input 
              placeholder="Buscar produto por nome ou palavra-chave..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-black/40 border-white/5 rounded-2xl text-[14px] focus:border-purple-500/50"
            />
          </div>

          {/* Categoria */}
          <div className="md:col-span-3 relative">
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-12 bg-black/40 border border-white/5 rounded-2xl px-4 text-[14px] text-white appearance-none outline-none focus:border-purple-500/50"
            >
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] pointer-events-none" />
          </div>

          {/* Ordenação */}
          <div className="md:col-span-3 relative">
            <select 
              value={sortType}
              onChange={e => setSortType(e.target.value)}
              className="w-full h-12 bg-black/40 border border-white/5 rounded-2xl px-4 text-[14px] text-white appearance-none outline-none focus:border-purple-500/50"
            >
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] pointer-events-none" />
          </div>

          {/* Botão Filtros */}
          <div className="md:col-span-1">
            <Button 
              variant="outline" 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={cn(
                "w-full h-12 border-white/5 bg-black/40 hover:bg-white/5 hover:text-white rounded-2xl",
                isFiltersOpen && "border-purple-500/50 text-purple-400"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtros Extras (Expandível) */}
        {isFiltersOpen && (
          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
             <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest ml-1">Comissão Mínima (%)</label>
                <div className="px-2">
                   <input type="range" min="0" max="90" className="w-full accent-purple-500" />
                   <div className="flex justify-between mt-1 text-[10px] text-[#475569] font-bold">
                      <span>0%</span>
                      <span>90%</span>
                   </div>
                </div>
             </div>
             
             <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest ml-1">Tipo de Aprovação</label>
                <div className="flex gap-2">
                   <button className="flex-1 py-2 px-3 bg-black/40 border border-white/5 rounded-xl text-[11px] font-bold text-white hover:border-purple-500/50 transition-all">Todas</button>
                   <button className="flex-1 py-2 px-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[11px] font-bold text-purple-400">Automática</button>
                </div>
             </div>

             <div className="flex items-end pb-1">
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-[12px] font-bold">
                  Limpar todos os filtros
                </Button>
             </div>
          </div>
        )}
      </div>

      {/* Grid de Ofertas */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOffers.map((offer) => (
            <MarketplaceProductCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#0f0f1a] border border-white/5 rounded-[32px] space-y-4">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-[#2a2a3d]" />
           </div>
           <h3 className="text-xl font-bold text-white">Nenhum produto encontrado</h3>
           <p className="text-[#64748b]">Tente ajustar seus filtros ou buscar por outros termos.</p>
           <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl" onClick={() => { setSearchTerm(""); setCategory("all"); }}>
             Ver todos os produtos
           </Button>
        </div>
      )}
    </div>
  );
}
